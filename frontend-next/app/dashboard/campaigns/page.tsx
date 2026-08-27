"use client";

import { useIncidents } from "@/hooks/useIncidents";
import type { Incident } from "@/lib/types";

interface Campaign {
  key: string;
  title: string;
  subtitle: string;
  deviceIds: string[];
}

/**
 * Real correlation, not a hardcoded example: groups incidents by the
 * indicator they share (a contact handle, or a threat domain in `detail`),
 * and only surfaces groups that actually touch more than one device.
 * This is the same idea the pitch deck describes, computed from whatever
 * incidents are actually in the backend right now.
 */
function computeCampaigns(incidents: Incident[]): Campaign[] {
  const groups = new Map<string, Incident[]>();

  for (const incident of incidents) {
    const indicator = incident.contact_handle ?? incident.detail;
    if (!indicator) continue;
    const list = groups.get(indicator) ?? [];
    list.push(incident);
    groups.set(indicator, list);
  }

  const campaigns: Campaign[] = [];
  for (const [indicator, group] of groups.entries()) {
    const deviceIds = Array.from(new Set(group.map((i) => i.device_id)));
    if (deviceIds.length < 2) continue; // only real cross-device patterns
    const sample = group[0];
    campaigns.push({
      key: indicator,
      title: indicator,
      subtitle:
        sample.event_type === "known_threat_domain"
          ? "Known threat domain, network-level detection"
          : "Same contact seen across multiple devices",
      deviceIds,
    });
  }

  return campaigns;
}

export default function CampaignsPage() {
  const { incidents } = useIncidents();
  const campaigns = computeCampaigns(incidents);

  return (
    <div>
      <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Campaigns</h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-muted)", fontSize: 12.5 }}>
        When the same contact or indicator appears on more than one device,
        Sentra groups it here so the team acts once instead of per-device.
      </p>

      {campaigns.length === 0 && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 24,
            color: "var(--ink-muted)",
            fontSize: 13,
          }}
        >
          No cross-device patterns yet. This appears automatically once the
          same contact or threat indicator shows up on two or more enrolled
          devices.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 14,
        }}
      >
        {campaigns.map((c) => (
          <div
            key={c.key}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  {c.subtitle}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 20,
                  background: "rgba(236,131,90,0.16)",
                  color: "var(--serious)",
                  fontWeight: 700,
                }}
              >
                {c.deviceIds.length} devices
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
              {c.deviceIds.map((id) => (
                <span
                  key={id}
                  style={{
                    fontSize: 11,
                    color: "var(--ink-2)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    padding: "4px 9px",
                    borderRadius: 6,
                  }}
                >
                  {id}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
