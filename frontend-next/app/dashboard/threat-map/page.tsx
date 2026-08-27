"use client";

import { useEffect, useState } from "react";
import { getRegions, API_BASE, type Region } from "@/lib/api";

const SEVERITY_COLOR: Record<string, string> = {
  low: "var(--good)",
  medium: "var(--warning)",
  high: "var(--serious)",
  critical: "var(--critical)",
};

const DEMO_EVENT_TYPES = ["new_contact", "message_burst", "late_night_activity", "cross_app_transition", "known_threat_domain"];

function project(lat: number, lng: number) {
  const minLat = 8, maxLat = 30;
  const minLng = 68, maxLng = 90;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
  return { x, y };
}

export default function ThreatMapPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [populating, setPopulating] = useState(false);

  function loadRegions() {
    getRegions().then(setRegions).catch(() => {});
  }

  useEffect(() => {
    loadRegions();
    const id = setInterval(loadRegions, 4000);
    return () => clearInterval(id);
  }, []);

  async function populateDemoActivity() {
    setPopulating(true);
    try {
      // Enroll a handful of devices and fire 1-3 random signals each, so
      // regions light up immediately without needing the CLI simulator.
      for (let i = 0; i < 8; i++) {
        const enrollRes = await fetch(`${API_BASE}/devices/enroll`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_name: `Demo-Device-${Date.now()}-${i}`,
            operator_type: Math.random() > 0.5 ? "school" : "individual",
            school_name: "Demo School",
            guardian_name: "Demo Guardian",
          }),
        });
        const device = await enrollRes.json();

        const eventCount = 1 + Math.floor(Math.random() * 3);
        for (let j = 0; j < eventCount; j++) {
          const eventType = DEMO_EVENT_TYPES[Math.floor(Math.random() * DEMO_EVENT_TYPES.length)];
          await fetch(`${API_BASE}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              device_id: device.device_id,
              event_type: eventType,
              contact_handle: "demo_contact",
            }),
          });
        }
      }
      loadRegions();
    } finally {
      setPopulating(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Regional Threat Map</h1>
          <p style={{ margin: "0 0 16px", color: "var(--ink-muted)", fontSize: 12.5, maxWidth: 640 }}>
            Each enrolled device is grouped into a region. When multiple regions
            light up with the same kind of threat, that&apos;s the early signal
            for a shared, cross-institution pattern &mdash; not just one
            school&apos;s problem.
          </p>
        </div>
        <button
          onClick={populateDemoActivity}
          disabled={populating}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            padding: "9px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--brand)",
            color: "#fff",
            cursor: populating ? "default" : "pointer",
            opacity: populating ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {populating ? "Generating…" : "Populate demo activity"}
        </button>
      </div>

      <div
        style={{
          background: "#0b1220",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          position: "relative",
          height: 420,
          overflow: "hidden",
        }}
      >
        {regions.map((r) => {
          const { x, y } = project(r.lat, r.lng);
          const color = SEVERITY_COLOR[r.max_severity] ?? "var(--good)";
          const size = 14 + Math.min(r.incident_count, 10) * 4;
          return (
            <div
              key={r.id}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: color,
                  opacity: 0.35,
                  position: "absolute",
                  animation: r.incident_count > 0 ? "pulse 2s infinite" : "none",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid var(--page)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  color: "var(--ink-2)",
                  whiteSpace: "nowrap",
                }}
              >
                {r.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>
                {r.incident_count} incident{r.incident_count === 1 ? "" : "s"}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.35; }
          50% { transform: scale(1.3); opacity: 0.1; }
          100% { transform: scale(0.9); opacity: 0.35; }
        }
      `}</style>

      <div
        style={{
          marginTop: 16,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "14px 18px",
          fontSize: 12,
          color: "var(--ink-muted)",
        }}
      >
        <b style={{ color: "var(--ink-2)" }}>Honesty note:</b> region assignment
        here is a deterministic demo mapping, not real IP-geolocation or
        device GPS &mdash; we have no location data in this prototype. This
        panel exists to visualize the roadmap idea: a shared threat registry
        where the same indicator lighting up in multiple regions signals a
        cross-institution pattern, without any region seeing another&apos;s
        private data. Real geolocation would come from the school&apos;s own
        network gateway (a known, static property), not device tracking.
      </div>
    </div>
  );
}
