"""
Sentra Detection Engine
------------------------
One core detection loop, two operator modes:
  - "school": device enrolled via school roster, incidents reviewed by safety officer
  - "individual": device enrolled by parent, incidents reviewed by parent

Never reads message content. Only behavioral metadata:
  - new contact appearance
  - contact frequency over time
  - late-night activity
  - cross-app transitions (inferred from foreground-app timing, not a captured "request")
  - (optional) identity signal: stolen/AI-generated photo flag

Risk score is simple, explainable, rule-based on purpose — not a black box.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid
import hashlib
import json
import requests

app = FastAPI(title="Sentra Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICES: dict[str, dict] = {}
INCIDENTS: dict[str, dict] = {}

_LAST_HASH = "0" * 64


def _next_hash(payload: dict) -> str:
    global _LAST_HASH
    body = json.dumps(payload, sort_keys=True, default=str)
    combined = _LAST_HASH + body
    new_hash = hashlib.sha256(combined.encode("utf-8")).hexdigest()
    _LAST_HASH = new_hash
    return new_hash


class DeviceEnroll(BaseModel):
    device_name: str
    operator_type: Literal["school", "individual"]
    school_name: Optional[str] = None
    student_id: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None


class EventIn(BaseModel):
    device_id: str
    event_type: Literal[
        "new_contact",
        "message_burst",
        "late_night_activity",
        "cross_app_transition",
        "identity_flag",
        "known_threat_domain",
    ]
    contact_handle: Optional[str] = None
    detail: Optional[str] = None
    timestamp: Optional[datetime] = None


SIGNAL_WEIGHTS = {
    "new_contact": 15,
    "message_burst": 30,
    "late_night_activity": 20,
    "cross_app_transition": 35,
    "identity_flag": 20,
    "known_threat_domain": 100,
}

SEVERITY_THRESHOLDS = [
    (80, "critical"),
    (55, "high"),
    (30, "medium"),
    (0, "low"),
]


def score_to_severity(score: int) -> str:
    for threshold, label in SEVERITY_THRESHOLDS:
        if score >= threshold:
            return label
    return "low"


def compute_incident(device_id: str, signals: list[str]) -> dict:
    score = min(sum(SIGNAL_WEIGHTS.get(s, 0) for s in signals), 100)
    severity = score_to_severity(score)
    auto_blocked_decision = "known_threat_domain" in signals
    evidence_locked = auto_blocked_decision or severity in ("high", "critical")
    return {
        "score": score,
        "severity": severity,
        "auto_blocked": auto_blocked_decision,
        "enforcement_status": "simulated_for_demo",
        "requires_human_review": not auto_blocked_decision,
        "evidence_locked": evidence_locked,
    }


@app.get("/")
def root():
    return {"status": "Sentra detection engine running"}


@app.get("/health")
def health():
    return {"monitoring": "active"}


@app.post("/devices/enroll")
def enroll_device(payload: DeviceEnroll):
    device_id = str(uuid.uuid4())[:8]
    DEVICES[device_id] = {
        "device_id": device_id,
        "device_name": payload.device_name,
        "operator_type": payload.operator_type,
        "school_name": payload.school_name,
        "student_id": payload.student_id,
        "guardian_name": payload.guardian_name,
        "guardian_contact": payload.guardian_contact,
        "enrolled_at": datetime.now(timezone.utc).isoformat(),
        "recent_signals": [],
    }
    return DEVICES[device_id]


@app.get("/devices")
def list_devices(operator_type: Optional[Literal["school", "individual"]] = None):
    devices = list(DEVICES.values())
    if operator_type:
        devices = [d for d in devices if d["operator_type"] == operator_type]
    return devices


@app.post("/events")
def ingest_event(event: EventIn):
    device = DEVICES.get(event.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not enrolled")
    return _create_incident(device, event.event_type, event.contact_handle, event.detail)


class DomainCheck(BaseModel):
    device_id: str
    domain: str


# Small local fallback list, used only if the live lookup fails (e.g. no
# internet at demo time). The real check below queries a live, public,
# no-key-required threat feed — not a hardcoded match.
_FALLBACK_KNOWN_BAD = {"insta-gram-login.tk", "phish-schoolportal-login.com"}


@app.post("/threat-check")
def check_domain(payload: DomainCheck):
    """
    Checks a domain against URLhaus (abuse.ch) in real time — a live,
    public, global malware/phishing feed, not a hardcoded string match.
    Anyone can type in any domain here and get a genuine, current verdict.
    """
    device = DEVICES.get(payload.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not enrolled")

    is_malicious = False
    source_note = "URLhaus (live)"
    threat_type = None

    try:
        resp = requests.post(
            "https://urlhaus-api.abuse.ch/v1/host/",
            data={"host": payload.domain},
            timeout=4,
        )
        data = resp.json()
        if data.get("query_status") == "ok":
            is_malicious = True
            urls = data.get("urls") or []
            if urls:
                threat_type = urls[0].get("threat")
    except Exception:
        source_note = "local fallback list (live lookup unavailable)"
        is_malicious = payload.domain in _FALLBACK_KNOWN_BAD

    if not is_malicious:
        return {
            "domain": payload.domain,
            "malicious": False,
            "source": source_note,
            "message": "No match against known threat feeds. No incident created.",
        }

    incident = _create_incident(
        device,
        "known_threat_domain",
        contact_handle=None,
        detail=f"{payload.domain} — flagged by {source_note}"
        + (f" as {threat_type}" if threat_type else ""),
    )
    return incident


def _create_incident(device: dict, event_type: str, contact_handle: Optional[str],
                      detail: Optional[str]) -> dict:
    device["recent_signals"].append(event_type)
    device["recent_signals"] = device["recent_signals"][-6:]

    result = compute_incident(device["device_id"], device["recent_signals"])

    incident_id = str(uuid.uuid4())[:8]
    incident_core = {
        "incident_id": incident_id,
        "device_id": device["device_id"],
        "device_name": device["device_name"],
        "operator_type": device["operator_type"],
        "school_name": device.get("school_name"),
        "guardian_name": device.get("guardian_name"),
        "event_type": event_type,
        "contact_handle": contact_handle,
        "detail": detail,
        "signals_considered": list(device["recent_signals"]),
        "score": result["score"],
        "severity": result["severity"],
        "auto_blocked": result["auto_blocked"],
        "enforcement_status": result["enforcement_status"],
        "requires_human_review": result["requires_human_review"],
        "evidence_locked": result["evidence_locked"],
        "status": "auto_blocked" if result["auto_blocked"] else "pending_review",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if result["evidence_locked"]:
        incident_core["evidence_hash"] = _next_hash(incident_core)
    else:
        incident_core["evidence_hash"] = None

    INCIDENTS[incident_id] = incident_core
    return incident_core


@app.get("/incidents")
def list_incidents(operator_type: Optional[Literal["school", "individual"]] = None,
                    device_id: Optional[str] = None):
    incidents = list(INCIDENTS.values())
    if operator_type:
        incidents = [i for i in incidents if i["operator_type"] == operator_type]
    if device_id:
        incidents = [i for i in incidents if i["device_id"] == device_id]
    incidents.sort(key=lambda i: i["created_at"], reverse=True)
    return incidents


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


REVIEWERS = {
    "school": {
        "name": "J. Alvarez",
        "title": "Safety Officer",
        "org": "Riverside High (Pilot)",
    },
    "individual": {
        "name": "Priya Sharma",
        "title": "Guardian",
        "org": "Family Mode",
    },
}


@app.get("/reviewers/{role}")
def get_reviewer(role: str):
    reviewer = REVIEWERS.get(role)
    if not reviewer:
        raise HTTPException(status_code=404, detail="Unknown role")
    return reviewer


@app.post("/incidents/{incident_id}/review")
def review_incident(incident_id: str, decision: Literal["escalate", "false_positive", "resolved"]):
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident["status"] = decision
    incident["reviewed_at"] = datetime.now(timezone.utc).isoformat()
    return incident