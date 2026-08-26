import type { Severity } from "@/lib/types";

const SEVERITY_COLOR: Record<Severity, string> = {
  low: "var(--good)",
  medium: "var(--warning)",
  high: "var(--serious)",
  critical: "var(--critical)",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export default function RiskBadge({ severity }: { severity: Severity }) {
  const color = SEVERITY_COLOR[severity];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 9px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 600,
        border: "1px solid var(--border)",
        color,
      }}
    >
      <i
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
