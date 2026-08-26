export default function StatTile({
  label,
  value,
  hint,
  hintTone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  hintTone?: "neutral" | "up" | "down";
}) {
  const hintColor =
    hintTone === "up"
      ? "var(--critical)"
      : hintTone === "down"
      ? "var(--good)"
      : "var(--ink-2)";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div
        style={{
          color: "var(--ink-muted)",
          fontSize: 11.5,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{value}</div>
      {hint && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: hintColor }}>
          {hint}
        </div>
      )}
    </div>
  );
}
