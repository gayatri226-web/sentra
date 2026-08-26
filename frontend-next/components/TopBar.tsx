export default function TopBar({
  subtitle,
  userLabel,
}: {
  subtitle: string;
  userLabel: string;
}) {
  return (
    <div
      style={{
        gridArea: "header",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 2,
            background: "var(--brand)",
          }}
        />
        <span style={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: 15 }}>
          SENTRA
        </span>
        <span
          style={{
            color: "var(--ink-muted)",
            fontSize: 12,
            marginLeft: 10,
            paddingLeft: 10,
            borderLeft: "1px solid var(--border)",
          }}
        >
          {subtitle}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12,
            color: "var(--ink-2)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            padding: "6px 10px",
            borderRadius: 20,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--good)",
              boxShadow: "0 0 0 3px rgba(12,163,12,0.18)",
            }}
          />
          Monitoring active
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "var(--ink-2)",
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--type-behavioral)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {userLabel
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </span>
          {userLabel}
        </div>
      </div>
    </div>
  );
}
