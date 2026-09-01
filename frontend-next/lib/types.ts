// These types mirror the FastAPI backend's response shapes exactly
// (see backend/main.py). Keeping them in one place means a backend
// field change surfaces as a type error here, not a silent bug in the UI.

export type OperatorType = "school" | "individual";

export type Severity = "low" | "medium" | "high" | "critical";

export type EventType =
  | "new_contact"
  | "message_burst"
  | "late_night_activity"
  | "cross_app_transition"
  | "identity_flag"
  | "known_threat_domain";

export type IncidentStatus =
  | "pending_review"
  | "auto_blocked"
  | "escalate"
  | "false_positive"
  | "resolved";

export interface Device {
  device_id: string;
  device_name: string;
  operator_type: OperatorType;
  school_name: string | null;
  student_id: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  enrolled_at: string;
}

export interface Incident {
  incident_id: string;
  device_id: string;
  device_name: string;
  operator_type: OperatorType;
  school_name: string | null;
  guardian_name: string | null;
  event_type: EventType;
  contact_handle: string | null;
  detail: string | null;
  signals_considered: EventType[];
  score: number;
  severity: Severity;
  auto_blocked: boolean;
  enforcement_status: string;
  requires_human_review: boolean;
  evidence_locked: boolean;
  evidence_hash: string | null;
  evidence_prev_hash?: string | null;
  risk_trajectory?: number[];
  previous_score?: number;
  score_delta?: number;
  risk_accelerating?: boolean;
  signal_diversity?: number;
  friction_state?: string;
  friction_message?: string | null;
  status: IncidentStatus;
  created_at: string;
  reviewed_at?: string;
}

// Client-side derived category, used only for display grouping/coloring —
// the backend doesn't need to know about this, it's a UI concern.
export type SignalCategory = "network" | "behavioral" | "identity";

export function categoryOf(event_type: EventType): SignalCategory {
  if (event_type === "known_threat_domain") return "network";
  if (event_type === "identity_flag") return "identity";
  return "behavioral";
}

export const SIGNAL_LABELS: Record<EventType, string> = {
  new_contact: "New contact appeared",
  message_burst: "Message frequency spike",
  late_night_activity: "Late-night activity",
  cross_app_transition: "Cross-app transition",
  identity_flag: "Identity signal (photo check)",
  known_threat_domain: "Known threat domain",
};
