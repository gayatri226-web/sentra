import type { IconType } from "react-icons";
import Sparkline from "././Sparkline";

export default function StatTile({
  label,
  value,
  hint,
  hintTone = "neutral",
  icon: Icon,
  accent = "var(--brand)",
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  hintTone?: "neutral" | "up" | "down";
  icon?: IconType;
  accent?: string;
  trend?: number[];
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
        borderRadius: 12,
        padding: 18,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            color: "var(--ink-muted)",
            fontSize: 11.5,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </div>
        {Icon && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `${accent}1a`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={14} color={accent} />
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: hintColor }}>
          {hint}
        </div>
      )}
      {trend && trend.length > 1 && (
        <div style={{ marginTop: 10 }}>
          <Sparkline values={trend} color={accent} />
        </div>
      )}
    </div>
  );
}