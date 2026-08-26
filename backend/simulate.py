"""
Sentra demo simulator.

Run this AFTER the backend is running (uvicorn main:app --reload),
in a second terminal:

    python simulate.py

It enrolls one school-mode device and one individual-mode device,
then fires a realistic escalation sequence on each — the same
sequence described in the pitch deck's "example in practice."

Watch the dashboard update live while this runs.
"""

import requests
import time

BASE = "http://127.0.0.1:8000"


def enroll(payload):
    r = requests.post(f"{BASE}/devices/enroll", json=payload)
    r.raise_for_status()
    return r.json()


def send_event(device_id, event_type, contact_handle=None, detail=None):
    r = requests.post(f"{BASE}/events", json={
        "device_id": device_id,
        "event_type": event_type,
        "contact_handle": contact_handle,
        "detail": detail,
    })
    r.raise_for_status()
    incident = r.json()
    print(f"  -> {event_type:28s} | score={incident['score']:3d} | "
          f"severity={incident['severity']:8s} | status={incident['status']}")
    return incident


def run_escalation(device_id, label):
    print(f"\n[{label}] New contact appears...")
    send_event(device_id, "new_contact", contact_handle="unknown_88")
    time.sleep(1)

    print(f"[{label}] Message frequency spikes...")
    send_event(device_id, "message_burst", contact_handle="unknown_88",
               detail="40+ messages in 48 hours, up from zero")
    time.sleep(1)

    print(f"[{label}] Late-night activity begins...")
    send_event(device_id, "late_night_activity", contact_handle="unknown_88",
               detail="Active 11PM-2AM, three nights running")
    time.sleep(1)

    print(f"[{label}] Cross-app transition pattern detected (game -> messaging app)...")
    incident = send_event(device_id, "cross_app_transition", contact_handle="unknown_88",
               detail="Foreground app changed from game to messaging app within 3 minutes")
    time.sleep(1)
    return incident


def run_known_threat(device_id, label):
    print(f"\n[{label}] Device connects to a known phishing domain...")
    send_event(device_id, "known_threat_domain", detail="insta-gram-login.tk")


if __name__ == "__main__":
    print("Enrolling devices...")

    school_device = enroll({
        "device_name": "iPad-Rm14-07",
        "operator_type": "school",
        "school_name": "Riverside High (Pilot)",
        "student_id": "STU-2291",
    })
    print(f"  School device enrolled: {school_device['device_id']}")

    individual_device = enroll({
        "device_name": "Aarav's Phone",
        "operator_type": "individual",
        "guardian_name": "Priya Sharma",
        "guardian_contact": "priya.sharma@example.com",
    })
    print(f"  Individual device enrolled: {individual_device['device_id']}")

    # Behavioral escalation on the school device -> should land in human review
    final = run_escalation(school_device["device_id"], "SCHOOL")
    print(f"  Final: risk {final['score']}/100, {final['severity'].upper()}, "
          f"requires_human_review={final['requires_human_review']}")

    # Same escalation pattern on the individual/parent device
    final2 = run_escalation(individual_device["device_id"], "INDIVIDUAL")
    print(f"  Final: risk {final2['score']}/100, {final2['severity'].upper()}, "
          f"requires_human_review={final2['requires_human_review']}")

    # A known threat on the school network -> should auto-block, no human needed
    run_known_threat(school_device["device_id"], "SCHOOL")

    print("\nDone. Check GET /incidents to see everything that just happened.")
