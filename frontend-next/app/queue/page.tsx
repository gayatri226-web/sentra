"use client";

import { useRouter } from "next/navigation";
import { useIncidents } from "@/hooks/useIncidents";
import RiskBadge from "@/components/RiskBadge";
import TypeTag from "@/components/TypeTag";
import { categoryOf, SIGNAL_LABELS } from "@/lib/types";

function waitTime(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function QueuePage() {
  const { incidents } = useIncidents();
  const router = useRouter();

  const pending = incidents.filter(
    (i) => i.status === "pending_review" && i.requires_human_review
  );

  return (
    <div>
      <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Review queue</h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-muted)", fontSize: 12.5 }}>
        Ambiguous signals waiting on a trained safety officer or guardian
        &mdash; nothing here has been auto-actioned.
      </p>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Risk", "Type", "Summary", "Waiting", ""].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    fontSize: 11,
                    textTransform: "uppercase",
                    color: "var(--ink-muted)",
                    padding: "10px 18px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: 24, color: "var(--ink-muted)", fontSize: 13 }}
                >
                  Nothing waiting on review right now.
                </td>
              </tr>
            )}
            {pending.map((incident) => (
              <tr key={incident.incident_id}>
                <td style={cell}>
                  <RiskBadge severity={incident.severity} />
                </td>
                <td style={cell}>
                  <TypeTag category={categoryOf(incident.event_type)} />
                </td>
                <td style={cell}>
                  {SIGNAL_LABELS[incident.event_type]} &mdash;{" "}
                  {incident.contact_handle ?? incident.device_name}
                </td>
                <td style={{ ...cell, color: "var(--ink-muted)" }}>
                  {waitTime(incident.created_at)}
                </td>
                <td style={cell}>
                  <button
                    onClick={() =>
                      router.push(`/incident/${incident.incident_id}`)
                    }
                    style={{
                      fontSize: 11.5,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--ink-2)",
                      cursor: "pointer",
                    }}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cell = { padding: "13px 18px", borderBottom: "1px solid var(--grid)", fontSize: 13 };
