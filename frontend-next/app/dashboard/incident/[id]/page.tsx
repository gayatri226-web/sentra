"use client";

import { HiOutlineLockClosed, HiArrowLeft } from "react-icons/hi";
import RiskGauge from "@/components/RiskGauge";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Incident } from "@/lib/types";
import { getIncident, reviewIncident } from "@/lib/api";
import RiskBadge from "@/components/RiskBadge";
import IncidentTimeline from "@/components/IncidentTimeline";

const SEVERITY_COLOR: Record<string, string> = {
  low: "var(--good)",
  medium: "var(--warning)",
  high: "var(--serious)",
  critical: "var(--critical)",
};

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getIncident(params.id);
      setIncident(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load incident.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleReview(
    decision: "escalate" | "false_positive" | "resolved",
    message: string
  ) {
    if (!incident) return;
    try {
      const updated = await reviewIncident(incident.incident_id, decision);
      setIncident(updated);
      setToast(message);
      setTimeout(() => setToast(null), 2600);
    } catch (err) {
      setToast("Could not save review decision — is the backend running?");
    }
  }

  if (error) {
    return (
      <div style={{ color: "var(--critical)", fontSize: 13 }}>{error}</div>
    );
  }

  if (!incident) {
    return (
      <div style={{ color: "var(--ink-muted)", fontSize: 13 }}>Loading…</div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--ink-2)",
          background: "none",
          border: "1px solid var(--border)",
          padding: "7px 12px",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 12.5,
          marginBottom: 16,
        }}
      >
        <HiArrowLeft size={14} /> Back to overview
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div>
          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {incident.contact_handle ?? incident.detail ?? incident.device_name}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                  {incident.operator_type === "school"
                    ? incident.school_name
                    : `Guardian: ${incident.guardian_name}`}{" "}
                  &middot; device: {incident.device_name}
                </div>
              </div>
              <RiskBadge severity={incident.severity} />
            </div>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
              <RiskGauge score={incident.score} severity={incident.severity} />
            </div>

            {incident.risk_trajectory && incident.risk_trajectory.length > 1 && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 11.5,
                  color: "var(--ink-muted)",
                  textAlign: "center",
                }}
              >
                Trajectory: {incident.risk_trajectory.join(" → ")}
                {incident.risk_accelerating && (
                  <span style={{ color: "var(--critical)", marginLeft: 6 }}>(accelerating)</span>
                )}
              </div>
            )}

            {incident.friction_message && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--warning)",
                  background: "rgba(245,183,61,0.1)",
                  border: "1px solid rgba(245,183,61,0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  textAlign: "center",
                }}
              >
                {incident.friction_message}
              </div>
            )}
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 13.5 }}>
              Detection timeline
            </h3>
            <IncidentTimeline incident={incident} />
          </Card>

          {incident.evidence_locked && (
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 18,
              }}
            >
              <div style={{ fontSize: 20 }}><HiOutlineLockClosed color="var(--critical)" /></div>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--critical)",
                    marginBottom: 3,
                  }}
                >
                  Evidence locked
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
                  Hash-chained the moment this crossed the review threshold, so
                  it cannot be silently edited or deleted.
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "var(--ink-muted)",
                    marginTop: 8,
                    wordBreak: "break-all",
                  }}
                >
                  {incident.evidence_hash}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <Card>
            <h3 style={{ margin: "0 0 6px", fontSize: 13.5 }}>Human review</h3>
            <p
              style={{
                margin: "0 0 14px",
                color: "var(--ink-muted)",
                fontSize: 12.5,
              }}
            >
              Nothing here auto-blocks or punishes. Your decision is the only
              thing that changes this incident's status.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ActionButton
                variant="primary"
                onClick={() =>
                  handleReview("escalate", "Escalated for follow-up.")
                }
              >
                Escalate
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() =>
                  handleReview(
                    "false_positive",
                    "Marked as a false positive. Evidence stays archived."
                  )
                }
              >
                Mark as false positive
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={() =>
                  handleReview("resolved", "Marked as resolved.")
                }
              >
                Mark as resolved
              </ActionButton>
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 12,
                color: "var(--ink-muted)",
              }}
            >
              Current status: <b style={{ color: "var(--ink)" }}>{incident.status}</b>
            </div>
          </Card>

          <Card>
            <h3 style={{ margin: "0 0 8px", fontSize: 13.5 }}>
              Why this was flagged
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: 0 }}>
              This score comes only from the signals listed in the timeline
              &mdash; timing, frequency, and app-transition patterns. No
              message content was read to reach this score.
            </p>
          </Card>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--good)",
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 12.5,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            maxWidth: 280,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 20,
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "secondary";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "11px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        border: "1px solid var(--border)",
        cursor: "pointer",
        textAlign: "left",
        background: variant === "primary" ? "var(--brand)" : "var(--surface-2)",
        borderColor: variant === "primary" ? "var(--brand)" : "var(--border)",
        color: variant === "primary" ? "#fff" : "var(--ink)",
      }}
    >
      {children}
    </button>
  );
}