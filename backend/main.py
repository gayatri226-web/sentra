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
  - platform-switch requests
  - (optional) identity signal: stolen/AI-generated photo flag

Risk score is simple, explainable, rule-based on purpose — not a black box.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid

app = FastAPI(title="Sentra Detection Engine")

# Allow the dashboard (any localhost port) to call this API during dev/demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory store (swap for SQLite/Postgres later — fine for tonight's demo)
# ---------------------------------------------------------------------------
DEVICES: dict[str, dict] = {}
INCIDENTS: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class DeviceEnroll(BaseModel):
    device_name: str
    operator_type: Literal["school", "individual"]
    # school mode
    school_name: Optional[str] = None
    student_id: Optional[str] = None
    # individual mode
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


# ---------------------------------------------------------------------------
# Scoring — simple, explainable, rule-based (Phase 1, as stated in the deck)
# ---------------------------------------------------------------------------
SIGNAL_WEIGHTS = {
    "new_contact": 15,
    "message_burst": 30,
    "late_night_activity": 20,
    "cross_app_transition": 35,
    "identity_flag": 20,
    "known_threat_domain": 100,  # always critical, always auto-block territory
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
    # NOTE: "auto_blocked" here means Sentra's policy engine has DECIDED to
    # block and logged that decision. It does NOT mean this server has
    # actually enforced a network-level block on a real device — that would
    # require a local agent or a DNS/firewall rule at the school's gateway,
    # neither of which exists in this prototype. This flag is the decision,
    # not the enforcement. Label it as such in any demo or pitch.
    auto_blocked_decision = "known_threat_domain" in signals
    return {
        "score": score,
        "severity": severity,
        "auto_blocked": auto_blocked_decision,
        "enforcement_status": "simulated_for_demo",
        # ambiguous (non-network) signals never auto-act — always human review
        "requires_human_review": not auto_blocked_decision,
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
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
        # rolling window of recent signal types for this device
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

    # keep a short rolling window of recent signal types (last 6)
    device["recent_signals"].append(event.event_type)
    device["recent_signals"] = device["recent_signals"][-6:]

    result = compute_incident(event.device_id, device["recent_signals"])

    incident_id = str(uuid.uuid4())[:8]
    incident = {
        "incident_id": incident_id,
        "device_id": event.device_id,
        "device_name": device["device_name"],
        "operator_type": device["operator_type"],
        "school_name": device.get("school_name"),
        "guardian_name": device.get("guardian_name"),
        "event_type": event.event_type,
        "contact_handle": event.contact_handle,
        "detail": event.detail,
        "signals_considered": list(device["recent_signals"]),
        "score": result["score"],
        "severity": result["severity"],
        "auto_blocked": result["auto_blocked"],
        "requires_human_review": result["requires_human_review"],
        "status": "auto_blocked" if result["auto_blocked"] else "pending_review",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    INCIDENTS[incident_id] = incident
    return incident


@app.get("/incidents")
def list_incidents(operator_type: Optional[Literal["school", "individual"]] = None,
                    device_id: Optional[str] = None):
    incidents = list(INCIDENTS.values())
    if operator_type:
        incidents = [i for i in incidents if i["operator_type"] == operator_type]
    if device_id:
        incidents = [i for i in incidents if i["device_id"] == device_id]
    # newest first
    incidents.sort(key=lambda i: i["created_at"], reverse=True)
    return incidents


@app.post("/incidents/{incident_id}/review")
def review_incident(incident_id: str, decision: Literal["escalate", "false_positive", "resolved"]):
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident["status"] = decision
    incident["reviewed_at"] = datetime.now(timezone.utc).isoformat()
    return incident
