const SEVERITY_COLOR: Record<string, string> = {
  low: "var(--good)",
  medium: "var(--warning)",
  high: "var(--serious)",
  critical: "var(--critical)",
};

export default function RiskGauge({
  score,
  severity,
}: {
  score: number;
  severity: string;
}) {
  const radius = 54;
  const circumference = Math.PI * radius;
  const fraction = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = circumference * (1 - fraction);
  const color = SEVERITY_COLOR[severity] ?? "var(--brand)";

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 140 80" width="180" height="103">
        <path
          d="M 10 70 A 54 54 0 0 1 130 70"
          fill="none"
          stroke="var(--grid)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 10 70 A 54 54 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div style={{ marginTop: -36, fontSize: 28, fontWeight: 700, fontFamily: "var(--font-display)" }}>
        {score}%
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Risk score
      </div>
    </div>
  );
}