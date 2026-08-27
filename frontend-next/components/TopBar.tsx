"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineShieldExclamation, HiOutlineLogout } from "react-icons/hi";
import { getReviewer, type Reviewer } from "@/lib/api";

const SUBTITLE: Record<string, string> = {
  school: "Safety Console · Riverside High (Pilot)",
  individual: "Safety Console · Family Mode",
};

export default function TopBar() {
  const router = useRouter();
  const [role, setRole] = useState<string>("school");
  const [reviewer, setReviewer] = useState<Reviewer | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("sentra_role") ?? "school";
    setRole(stored);
    getReviewer(stored)
      .then(setReviewer)
      .catch(() => setReviewer(null));
  }, []);

  function handleLogout() {
    localStorage.removeItem("sentra_role");
    router.push("/login");
  }

  const userLabel = reviewer ? `${reviewer.name} · ${reviewer.title}` : "Loading…";
  const initials = reviewer
    ? reviewer.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
    : "…";

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
        <HiOutlineShieldExclamation size={20} color="var(--brand)" />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            letterSpacing: "0.06em",
            fontSize: 16,
          }}
        >
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
          {SUBTITLE[role] ?? SUBTITLE.school}
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