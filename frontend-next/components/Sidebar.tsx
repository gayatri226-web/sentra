"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "\u2637" },
  { href: "/queue", label: "Review Queue", icon: "\u2691" },
  { href: "/campaigns", label: "Campaigns", icon: "\u2637" },
  { href: "/evidence", label: "Evidence Vault", icon: "\uD83D\uDD12" },
  { href: "/settings", label: "Settings", icon: "\u2699" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        gridArea: "sidebar",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "16px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 8,
              color: active ? "var(--ink)" : "var(--ink-2)",
              background: active ? "var(--brand-dim)" : "transparent",
              borderLeft: active
                ? "3px solid var(--brand)"
                : "3px solid transparent",
              fontWeight: active ? 600 : 400,
              fontSize: 13,
            }}
          >
            <span style={{ width: 16, textAlign: "center", opacity: 0.85 }}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
      <div
        style={{
          marginTop: "auto",
          padding: 12,
          fontSize: 11,
          color: "var(--ink-muted)",
          borderTop: "1px solid var(--border)",
        }}
      >
        Live data from the Sentra detection engine. Behavioral signals never
        include message content.
      </div>
    </div>
  );
}
