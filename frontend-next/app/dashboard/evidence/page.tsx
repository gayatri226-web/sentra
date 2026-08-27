"use client";

import { useIncidents } from "@/hooks/useIncidents";

export default function EvidencePage() {
  const { incidents } = useIncidents();
  const locked = incidents.filter((i) => i.evidence_locked);

  return (
    <div>
      <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Evidence vault</h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-muted)", fontSize: 12.5 }}>
        Hash-chained metadata timelines, locked automatically once an
        incident crosses the review threshold. Content is never stored
        &mdash; only metadata (timing, contact history, signal sequence).
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
              {["Case", "Locked on", "Status", "Evidence hash"].map((h) => (
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
            {locked.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ padding: 24, color: "var(--ink-muted)", fontSize: 13 }}
                >
                  No evidence locked yet. High and critical severity
                  incidents lock automatically.
                </td>
              </tr>
            )}
            {locked.map((incident) => (
              <tr key={incident.incident_id}>
                <td style={cell}>
                  {incident.contact_handle ?? incident.detail ?? incident.device_name}
                  <span style={{ color: "var(--ink-muted)" }}>
                    {" "}
                    &mdash; {incident.severity}
                  </span>
                </td>
                <td style={{ ...cell, color: "var(--ink-muted)" }}>
                  {new Date(incident.created_at).toLocaleString()}
                </td>
                <td style={{ ...cell, color: "var(--ink-2)" }}>
                  {incident.status}
                </td>
                <td
                  style={{
                    ...cell,
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "var(--ink-muted)",
                  }}
                >
                  {incident.evidence_hash?.slice(0, 16)}...
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
