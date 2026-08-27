"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import type { Incident } from "@/lib/types";
import { categoryOf, SIGNAL_LABELS } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import TypeTag from "./TypeTag";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

function statusLabel(incident: Incident): {
  text: string;
  color: string;
} {
  if (incident.status === "auto_blocked") {
    return { text: "Auto-blocked", color: "var(--good)" };
  }
  if (incident.status === "pending_review") {
    return { text: "Pending review", color: "var(--warning)" };
  }
  if (incident.status === "escalate") {
    return { text: "Reviewed — escalated", color: "var(--ink-2)" };
  }
  if (incident.status === "false_positive") {
    return { text: "Closed — false positive", color: "var(--ink-2)" };
  }
  return { text: "Resolved", color: "var(--ink-2)" };
}

export default function IncidentTable({
  incidents,
  onSelect,
  selectedId,
}: {
  incidents: Incident[];
  onSelect?: (incident: Incident) => void;
  selectedId?: string;
}) {
  const router = useRouter();

  if (incidents.length === 0) {
    return (
      <div style={{ padding: 24, color: "var(--ink-muted)", fontSize: 13 }}>
        No incidents yet. Run <code>python simulate.py</code> in the backend
        folder to generate some.
      </div>
    );
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {["Risk", "Type", "Summary", "Device / Contact", "Time", "Status"].map(
            (h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "var(--ink-muted)",
                  fontWeight: 600,
                  padding: "10px 18px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {h}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {incidents.map((incident) => {
          const status = statusLabel(incident);
          return (
            <tr
              key={incident.incident_id}
              onClick={() =>
                onSelect
                  ? onSelect(incident)
                  : router.push(`/dashboard/incident/${incident.incident_id}`)
              }
              style={{
                cursor: "pointer",
                background:
                  selectedId === incident.incident_id ? "var(--surface-2)" : "",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--surface-2)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              <td style={cellStyle}>
                <RiskBadge severity={incident.severity} />
              </td>
              <td style={cellStyle}>
                <TypeTag category={categoryOf(incident.event_type)} />
              </td>
              <td style={cellStyle}>
                {SIGNAL_LABELS[incident.event_type]}
                {incident.detail ? ` — ${incident.detail}` : ""}
              </td>
              <td style={{ ...cellStyle, color: "var(--ink-muted)" }}>
                {incident.contact_handle ?? incident.device_name} &middot;{" "}
                {incident.device_name}
              </td>
              <td style={{ ...cellStyle, color: "var(--ink-muted)" }}>
                {timeAgo(incident.created_at)}
              </td>
              <td style={{ ...cellStyle, color: status.color }}>
                {status.text}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const cellStyle: CSSProperties = {
  padding: "13px 18px",
  borderBottom: "1px solid var(--grid)",
  fontSize: 13,
  verticalAlign: "middle",
};
