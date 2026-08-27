export default function SettingsPage() {
  const rows: { label: string; value: string; on: boolean }[] = [
    { label: "Auto-block known threats (network/malware)", value: "On", on: true },
    { label: "Behavioral pattern detection", value: "On", on: true },
    { label: "Identity signal check (photo verification)", value: "On", on: true },
    { label: "Read message content", value: "Never", on: false },
    { label: "Auto-action on ambiguous signals", value: "Off — human review only", on: false },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 18, margin: "0 0 4px" }}>Settings</h1>
      <p style={{ margin: "0 0 20px", color: "var(--ink-muted)", fontSize: 12.5 }}>
        Policy this deployment enforces. These reflect the actual rules in
        the detection engine, not just a description of intent.
      </p>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: 20,
        }}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid var(--grid)",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--ink-2)" }}>{row.label}</span>
            <span
              style={{
                fontWeight: 700,
                color: row.on ? "var(--good)" : "var(--ink-muted)",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
