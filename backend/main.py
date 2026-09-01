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

# Hash chain state — each incident's evidence_hash includes the previous
# incident's hash, so any silent edit to an earlier record breaks every
# hash after it. This is the actual mechanism, not just a claim.
_LAST_HASH = "0" * 64


def _next_hash(payload: dict) -> str:
    global _LAST_HASH
    body = json.dumps(payload, sort_keys=True, default=str)
    combined = _LAST_HASH + body
    new_hash = hashlib.sha256(combined.encode("utf-8")).hexdigest()
    _LAST_HASH = new_hash
    return new_hash


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


SEVERITY_RANK = ["low", "medium", "high", "critical"]


def _signal_category(signal: str) -> str:
    # Each distinct signal type counts as its own independent category —
    # this is what makes "diversity" meaningful. The fix is specifically
    # against the SAME signal firing repeatedly (e.g. three message_bursts
    # in a row), not against a genuine escalation across different signal
    # types, which is exactly the pattern real grooming cases follow and
    # should still reach full severity.
    return signal


def compute_incident(device_id: str, signals: list[str]) -> dict:
    score = min(sum(SIGNAL_WEIGHTS.get(s, 0) for s in signals), 100)
    severity = score_to_severity(score)
    auto_blocked_decision = "known_threat_domain" in signals

    # Defense in depth: never let one repeated signal type alone justify a
    # high/critical call. A student messaging one contact a lot is not the
    # same confidence as a new contact + late-night activity + a platform
    # switch together. Known technical threats are exempt — a confirmed
    # malicious domain is deterministic, not a behavioral judgment call.
    distinct_categories = {_signal_category(s) for s in signals}
    signal_diversity = len(distinct_categories)
    if not auto_blocked_decision and signal_diversity < 2:
        capped_index = min(SEVERITY_RANK.index(severity), SEVERITY_RANK.index("medium"))
        severity = SEVERITY_RANK[capped_index]

    evidence_locked = auto_blocked_decision or severity in ("high", "critical")
    return {
        "score": score,
        "severity": severity,
        "signal_diversity": signal_diversity,
        "auto_blocked": auto_blocked_decision,
        "enforcement_status": "simulated_for_demo",
        # ambiguous (non-network) signals never auto-act — always human review
        "requires_human_review": not auto_blocked_decision,
        "evidence_locked": evidence_locked,
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
        # Live lookup failed (no internet, feed down) — fall back to the
        # small local list so the demo still works, and say so honestly.
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


# ---------------------------------------------------------------------------
# Progressive friction — a third state between "do nothing" and "block."
# At rising but non-critical risk, Sentra doesn't block anything; it
# introduces simulated friction and starts watching more closely, while
# staying fully human-gated for anything ambiguous.
# ---------------------------------------------------------------------------
FRICTION_MAP = {
    "low": ("normal", None),
    "medium": ("observing", "Interaction is being watched more closely. No action taken yet."),
    "high": ("friction_applied", "Unknown-contact interaction temporarily rate-limited pending review."),
    "critical": ("human_review_required", "Interaction restricted pending human review."),
}

ACCELERATION_THRESHOLD = 25  # a single jump this large flags "accelerating"


def _create_incident(device: dict, event_type: str, contact_handle: Optional[str],
                      detail: Optional[str]) -> dict:
    device["recent_signals"].append(event_type)
    device["recent_signals"] = device["recent_signals"][-6:]

    result = compute_incident(device["device_id"], device["recent_signals"])

    # Risk trajectory: how this device's score has moved over time, not
    # just the final number.
    history = device.setdefault("score_history", [])
    previous_score = history[-1] if history else 0
    history.append(result["score"])
    score_delta = result["score"] - previous_score

    if result["auto_blocked"]:
        friction_state, friction_message = "technical_block", "Connection blocked automatically — known technical threat."
    else:
        friction_state, friction_message = FRICTION_MAP.get(result["severity"], ("normal", None))

    incident_id = str(uuid.uuid4())[:8]
    created_at = datetime.now(timezone.utc).isoformat()

    # Only these fields are ever hashed. Fields that legitimately change
    # later (status, reviewed_at via /review) are deliberately excluded,
    # so a human review action never breaks evidence verification — only
    # tampering with the original facts does.
    evidence_snapshot = {
        "device_id": device["device_id"],
        "event_type": event_type,
        "contact_handle": contact_handle,
        "detail": detail,
        "signals_considered": list(device["recent_signals"]),
        "score": result["score"],
        "severity": result["severity"],
        "created_at": created_at,
    }

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
        "created_at": created_at,
        "risk_trajectory": list(history),
        "previous_score": previous_score,
        "score_delta": score_delta,
        "risk_accelerating": score_delta >= ACCELERATION_THRESHOLD,
        "signal_diversity": result["signal_diversity"],
        "friction_state": friction_state,
        "friction_message": friction_message,
        "evidence_snapshot": evidence_snapshot,
    }

    if result["evidence_locked"]:
        incident_core["evidence_prev_hash"] = _LAST_HASH
        incident_core["evidence_hash"] = _next_hash(evidence_snapshot)
    else:
        incident_core["evidence_prev_hash"] = None
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
    # newest first
    incidents.sort(key=lambda i: i["created_at"], reverse=True)
    return incidents


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@app.get("/evidence/{incident_id}/verify")
def verify_evidence(incident_id: str):
    """
    Recomputes the hash from the incident's original evidence snapshot and
    compares it to the stored hash. Review actions (status changes) never
    affect this, since only the original facts are hashed — only direct
    tampering with the evidence itself will fail this check.
    """
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    if not incident.get("evidence_locked"):
        return {"status": "NOT_APPLICABLE", "message": "This incident never locked evidence."}

    recomputed = hashlib.sha256(
        (incident["evidence_prev_hash"] + json.dumps(incident["evidence_snapshot"], sort_keys=True, default=str)).encode("utf-8")
    ).hexdigest()

    if recomputed == incident["evidence_hash"]:
        return {"status": "VERIFIED", "evidence_hash": incident["evidence_hash"]}
    return {
        "status": "INTEGRITY_FAILURE",
        "expected": incident["evidence_hash"],
        "recomputed": recomputed,
    }


@app.post("/incidents/{incident_id}/debug-tamper")
def debug_tamper(incident_id: str):
    """
    Demo-only endpoint: directly mutates the evidence snapshot without
    updating its hash — simulating unauthorized tampering. Call
    /evidence/{id}/verify afterward to see it fail. Not part of the real
    product surface; exists purely to make tamper-evidence demonstrable.
    """
    incident = INCIDENTS.get(incident_id)
    if not incident or not incident.get("evidence_snapshot"):
        raise HTTPException(status_code=400, detail="No evidence to tamper with on this incident")
    incident["evidence_snapshot"]["detail"] = (
        (incident["evidence_snapshot"].get("detail") or "") + " [TAMPERED]"
    )
    return {"message": "Evidence snapshot mutated directly, bypassing the hash. Now call /evidence/{incident_id}/verify."}


# ---------------------------------------------------------------------------
# Reviewer profiles — seeded, not a real user/auth database. This exists so
# the frontend doesn't hardcode names in the UI layer; a real deployment
# would replace this with actual accounts (school SSO / verified guardian
# accounts), one per operator_type role selected at /login.
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Regional threat view — this is a DEMO visualization, not real geolocation.
# We have no IP-geolocation or device-location data in this prototype, so
# each device is deterministically assigned to one of a few demo regions
# based on its device_id. A real deployment would derive this from actual
# network-level IP geolocation (school gateway IP) or device-reported
# location with consent — not implemented here. This exists to visualize
# the roadmap idea: correlating threats across regions, not just devices.
# ---------------------------------------------------------------------------
DEMO_REGIONS = [
    {"id": "mumbai", "name": "Mumbai", "lat": 19.076, "lng": 72.877},
    {"id": "delhi", "name": "Delhi", "lat": 28.613, "lng": 77.209},
    {"id": "bengaluru", "name": "Bengaluru", "lat": 12.972, "lng": 77.594},
    {"id": "kolkata", "name": "Kolkata", "lat": 22.573, "lng": 88.364},
    {"id": "hyderabad", "name": "Hyderabad", "lat": 17.385, "lng": 78.487},
]


def _region_for_device(device_id: str) -> dict:
    idx = int(hashlib.sha256(device_id.encode()).hexdigest(), 16) % len(DEMO_REGIONS)
    return DEMO_REGIONS[idx]


@app.get("/regions")
def get_regions():
    region_stats = {r["id"]: {**r, "incident_count": 0, "max_severity": "low", "devices": set()} for r in DEMO_REGIONS}
    severity_rank = {"low": 0, "medium": 1, "high": 2, "critical": 3}

    for incident in INCIDENTS.values():
        region = _region_for_device(incident["device_id"])
        stat = region_stats[region["id"]]
        stat["incident_count"] += 1
        stat["devices"].add(incident["device_id"])
        if severity_rank[incident["severity"]] > severity_rank[stat["max_severity"]]:
            stat["max_severity"] = incident["severity"]

    result = []
    for r in region_stats.values():
        r["device_count"] = len(r["devices"])
        del r["devices"]
        result.append(r)
    return result


@app.get("/stats/hourly")
def get_hourly_stats():
    """
    Real data, not decorative: buckets actual incidents by hour-of-day so
    the dashboard sparklines reflect genuine incident timing, not a fake
    trend line.
    """
    buckets = [0] * 24
    for incident in INCIDENTS.values():
        hour = datetime.fromisoformat(incident["created_at"]).hour
        buckets[hour] += 1
    return {"buckets": buckets}


@app.post("/incidents/{incident_id}/review")
def review_incident(incident_id: str, decision: Literal["escalate", "false_positive", "resolved"]):
    incident = INCIDENTS.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident["status"] = decision
    incident["reviewed_at"] = datetime.now(timezone.utc).isoformat()
    return incident
