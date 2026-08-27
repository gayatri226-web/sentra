"use client";

import { useIncidents } from "@/hooks/useIncidents";
import StatTile from "@/components/StatTile";
import IncidentTable from "@/components/IncidentTable";
import { HiOutlineExclamationCircle, HiOutlineShieldCheck, HiOutlineClock, HiOutlineDeviceMobile } from "react-icons/hi";

export default function OverviewPage() {
  const { incidents, loading, error } = useIncidents();

  const activeAlerts = incidents.filter(
    (i) => i.status === "pending_review"
  ).length;
  const autoBlockedToday = incidents.filter(
    (i) => i.status === "auto_blocked"
  ).length;
  const pendingHumanReview = incidents.filter(
    (i) => i.requires_human_review && i.status === "pending_review"
  ).length;
  const uniqueDevices = new Set(incidents.map((i) => i.device_id)).size;

  return (
    <div>
      <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Overview</h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-muted)", fontSize: 12.5 }}>
        What Sentra is currently seeing across enrolled devices — live from
        the detection engine, refreshing every few seconds.
      </p>

      {error && (
        <div
          style={{
            background: "rgba(208,59,59,0.1)",
            border: "1px solid rgba(208,59,59,0.3)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 12.5,
            color: "var(--critical)",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatTile
          label="Active alerts"
          value={activeAlerts}
          icon={HiOutlineExclamationCircle}
          accent="var(--serious)"
        />
        <StatTile
          label="Auto-blocked"
          value={autoBlockedToday}
          hint="known threats, no review needed"
          icon={HiOutlineShieldCheck}
          accent="var(--good)"
        />
        <StatTile
          label="Pending human review"
          value={pendingHumanReview}
          hintTone="up"
          icon={HiOutlineClock}
          accent="var(--warning)"
        />
        <StatTile
          label="Devices monitored"
          value={uniqueDevices}
          hint="school + individual mode"
          icon={HiOutlineDeviceMobile}
          accent="var(--brand)"
        />
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>
            Live incident feed
          </div>
          {loading && (
            <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
              Loading…
            </span>
          )}
        </div>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}