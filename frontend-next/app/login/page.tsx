"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineShieldExclamation, HiArrowLeft } from "react-icons/hi";

const ROLES = [
  {
    id: "school",
    icon: HiOutlineAcademicCap,
    title: "School Safety Officer",
    body: "Review flagged incidents across enrolled student devices at your school.",
    orgLabel: "School name",
    orgPlaceholder: "e.g. Riverside High",
  },
  {
    id: "individual",
    icon: HiOutlineUserGroup,
    title: "Parent / Guardian",
    body: "Review flagged incidents for a device you've personally enrolled.",
    orgLabel: "Child's name (optional)",
    orgPlaceholder: "e.g. Aarav",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");

  function proceed() {
    if (!selectedRole || !name.trim()) return;
    // NOTE: this is a role-scoped demo entry point, not real authentication.
    // No password, no session, no server-verified identity — a real
    // deployment needs school SSO or a verified guardian account here.
    localStorage.setItem("sentra_role", selectedRole);
    localStorage.setItem("sentra_name", name.trim());
    localStorage.setItem("sentra_org", org.trim());
    router.push("/dashboard");
  }

  const activeRole = ROLES.find((r) => r.id === selectedRole);

  return (
    <div style={{ minHeight: "100vh", background: "var(--page)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 32px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--ink-muted)",
          }}
        >
          <HiArrowLeft size={14} /> Back to home
        </Link>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px 60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <HiOutlineShieldExclamation size={26} color="var(--brand)" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "0.04em" }}>
            SENTRA
          </span>
        </div>
        <p style={{ color: "var(--ink-muted)", fontSize: 13, marginBottom: 40 }}>
          Choose how you&apos;re accessing the console today.
        </p>

        <div style={{ display: "flex", gap: 18, marginBottom: 28 }}>
          {ROLES.map((role) => {
            const Icon = role.icon;
            const active = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  width: 280,
                  textAlign: "left",
                  background: "var(--surface)",
                  border: active ? "1px solid var(--brand)" : "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 26,
                  cursor: "pointer",
                  color: "var(--ink)",
                  boxShadow: active ? "0 0 30px -8px var(--brand-glow)" : "none",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "var(--brand-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon size={22} color="var(--brand)" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{role.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{role.body}</div>
              </button>
            );
          })}
        </div>

        {activeRole && (
          <div
            style={{
              width: 578,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <label style={{ display: "block", fontSize: 12, color: "var(--ink-muted)", marginBottom: 6 }}>
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              style={inputStyle}
            />
            <label style={{ display: "block", fontSize: 12, color: "var(--ink-muted)", margin: "14px 0 6px" }}>
              {activeRole.orgLabel}
            </label>
            <input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder={activeRole.orgPlaceholder}
              style={inputStyle}
            />
            <button
              onClick={proceed}
              disabled={!name.trim()}
              style={{
                width: "100%",
                marginTop: 18,
                padding: "12px 16px",
                borderRadius: 8,
                border: "none",
                background: name.trim() ? "linear-gradient(135deg, var(--brand), var(--brand-2))" : "var(--surface-2)",
                color: name.trim() ? "#fff" : "var(--ink-muted)",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: name.trim() ? "pointer" : "default",
              }}
            >
              Enter Safety Console &rarr;
            </button>
          </div>
        )}

        <p style={{ marginTop: 36, fontSize: 11.5, color: "var(--ink-muted)", maxWidth: 460, textAlign: "center", lineHeight: 1.6 }}>
          This is a role-scoped demo entry point, not a verified login &mdash; a real
          deployment would use school SSO or a verified guardian account here.
        </p>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--ink)",
  fontSize: 13.5,
};
