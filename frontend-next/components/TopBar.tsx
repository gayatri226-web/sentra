"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiOutlineShieldExclamation, HiOutlineLogout, HiOutlineHome, HiOutlineMenu } from "react-icons/hi";

const SUBTITLE: Record<string, string> = {
  school: "Safety Console",
  individual: "Safety Console · Family Mode",
};

const ROLE_TITLE: Record<string, string> = {
  school: "Safety Officer",
  individual: "Guardian",
};

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const [role, setRole] = useState<string>("school");
  const [name, setName] = useState<string>("");
  const [org, setOrg] = useState<string>("");

  useEffect(() => {
    setRole(localStorage.getItem("sentra_role") ?? "school");
    setName(localStorage.getItem("sentra_name") ?? "");
    setOrg(localStorage.getItem("sentra_org") ?? "");
  }, []);

  function handleLogout() {
    localStorage.removeItem("sentra_role");
    localStorage.removeItem("sentra_name");
    localStorage.removeItem("sentra_org");
    router.push("/login");
  }

  const userLabel = name ? `${name} · ${ROLE_TITLE[role] ?? ""}` : ROLE_TITLE[role] ?? "";
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={onMenuClick}
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 7,
            cursor: "pointer",
            color: "var(--ink-2)",
            display: "flex",
          }}
        >
          <HiOutlineMenu size={16} />
        </button>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <HiOutlineShieldExclamation size={20} color="var(--brand)" />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontSize: 16,
              color: "var(--ink)",
            }}
          >
            SENTRA
          </span>
        </Link>
        <span
          style={{
            color: "var(--ink-muted)",
            fontSize: 12,
            marginLeft: 4,
            paddingLeft: 10,
            borderLeft: "1px solid var(--border)",
          }}
        >
          {SUBTITLE[role] ?? SUBTITLE.school}
          {org ? ` · ${org}` : ""}
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
              boxShadow: "0 0 0 3px rgba(34,197,94,0.18)",
            }}
          />
          Monitoring active
        </div>
        {name && (
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
                background: "linear-gradient(135deg, var(--brand), var(--brand-2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {initials}
            </span>
            {userLabel}
          </div>
        )}
        <Link
          href="/"
          title="Back to home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--ink-muted)",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          <HiOutlineHome size={14} />
        </Link>
        <button
          onClick={handleLogout}
          title="Switch role"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--ink-muted)",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <HiOutlineLogout size={14} />
        </button>
      </div>
    </div>
  );
}
