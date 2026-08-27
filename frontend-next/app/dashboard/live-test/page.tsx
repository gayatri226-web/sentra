"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { API_BASE } from "@/lib/api";
import { SIGNAL_LABELS, type EventType } from "@/lib/types";

const SIGNAL_OPTIONS = Object.keys(SIGNAL_LABELS).filter(
  (k) => k !== "known_threat_domain"
) as EventType[];

export default function LiveTestPage() {
  const [deviceName, setDeviceName] = useState("Demo-Device");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [signal, setSignal] = useState<EventType>("new_contact");
  const [domain, setDomain] = useState("");
  const [log, setLog] = useState<string[]>([]);

  function addLog(line: string) {
    setLog((prev) => [line, ...prev].slice(0, 12));
  }

  async function enroll() {
    const res = await fetch(`${API_BASE}/devices/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_name: deviceName,
        operator_type: "school",
        school_name: "Live Demo",
      }),
    });
    const data = await res.json();
    setDeviceId(data.device_id);
    addLog(`Enrolled device ${data.device_id} (${deviceName})`);
  }

  async function fireSignal() {
    if (!deviceId) return;
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: deviceId,
        event_type: signal,
        contact_handle: "live_demo_contact",
      }),
    });
    const data = await res.json();
    addLog(
      `${SIGNAL_LABELS[signal]} → risk ${data.score}/100 (${data.severity}), status: ${data.status}`
    );
  }

  async function checkDomain() {
    if (!deviceId || !domain) return;
    const res = await fetch(`${API_BASE}/threat-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, domain }),
    });
    const data = await res.json();
    if (data.malicious === false) {
      addLog(`"${domain}" — clean (${data.source})`);
    } else {
      addLog(
        `"${domain}" — MALICIOUS, auto-blocked (${data.detail ?? ""})`
      );
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Live Test Console</h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-muted)", fontSize: 12.5 }}>
        Not scripted. Pick a scenario yourself and watch the engine react in
        real time — the same API a real device would call.
      </p>

      <div style={{ display: "flex", gap: 16 }}>
        <div
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 13.5, margin: "0 0 14px" }}>1. Enroll a device</h3>
          <input
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            style={inputStyle}
          />
          <button onClick={enroll} style={btnStyle}>
            Enroll
          </button>
          {deviceId && (
            <p style={{ fontSize: 11.5, color: "var(--good)", marginTop: 8 }}>
              Active device: {deviceId}
            </p>
          )}

          <h3 style={{ fontSize: 13.5, margin: "20px 0 14px" }}>
            2. Fire a behavioral signal
          </h3>
          <select
            value={signal}
            onChange={(e) => setSignal(e.target.value as EventType)}
            style={inputStyle}
          >
            {SIGNAL_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SIGNAL_LABELS[s]}
              </option>
            ))}
          </select>
          <button onClick={fireSignal} disabled={!deviceId} style={btnStyle}>
            Send signal
          </button>

          <h3 style={{ fontSize: 13.5, margin: "20px 0 14px" }}>
            3. Check a real domain, live
          </h3>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. google.com or a known-bad domain"
            style={inputStyle}
          />
          <button onClick={checkDomain} disabled={!deviceId} style={btnStyle}>
            Check against live threat feed
          </button>
        </div>

        <div
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <h3 style={{ fontSize: 13.5, margin: "0 0 14px" }}>Live log</h3>
          {log.length === 0 && (
            <p style={{ color: "var(--ink-muted)", fontSize: 12.5 }}>
              Nothing yet — actions appear here the instant they happen.
            </p>
          )}
          {log.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                fontFamily: "monospace",
                padding: "8px 0",
                borderBottom: "1px solid var(--grid)",
                color: "var(--ink-2)",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 13,
  marginBottom: 10,
};

const btnStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "none",
  background: "var(--brand)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};