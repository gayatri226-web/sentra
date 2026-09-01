"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineViewGrid,
  HiOutlineFlag,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCog,
  HiOutlinePlay,
  HiOutlineGlobeAlt,
} from "react-icons/hi";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: HiOutlineViewGrid },
  { href: "/dashboard/live-test", label: "Live Test", icon: HiOutlinePlay },
  { href: "/dashboard/threat-map", label: "Threat Map", icon: HiOutlineGlobeAlt },
  { href: "/dashboard/queue", label: "Review Queue", icon: HiOutlineFlag },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: HiOutlineShieldCheck },
  { href: "/dashboard/evidence", label: "Evidence Vault", icon: HiOutlineLockClosed },
  { href: "/dashboard/settings", label: "Settings", icon: HiOutlineCog },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "16px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
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
            <Icon size={16} style={{ opacity: 0.9, flexShrink: 0 }} />
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
