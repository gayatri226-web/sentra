"use client";

import { useRouter } from "next/navigation";
import { HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineShieldExclamation } from "react-icons/hi";

const ROLES = [
  {
    id: "school",
    icon: HiOutlineAcademicCap,
    title: "School Safety Officer",
    body: "Review flagged incidents across enrolled student devices at your school.",
    org: "Riverside High (Pilot)",
  },
  {
    id: "individual",
    icon: HiOutlineUserGroup,
    title: "Parent / Guardian",
    body: "Review flagged incidents for a device you've personally enrolled.",
    org: "Family mode",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();

  function selectRole(roleId: string) {
    // NOTE: this is an access-scoping choice for the demo, not real
    // authentication. There is no password, session, or server-verified
    // identity behind this — it exists to show that a school officer and
    // a parent see different, correctly-scoped views. Real auth (school
    // SSO, or a verified parent account) is a stated Phase 2 item.
    localStorage.setItem("sentra_role", roleId);
    router.push("/dashboard");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <HiOutlineShieldExclamation size={26} color="var(--brand)" />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "0.04em",
          }}
        >
          SENTRA
        </span>
      </div>
      <p style={{ color: "var(--ink-muted)", fontSize: 13, marginBottom: 44 }}>
        Choose how you&apos;re accessing the console today.
      </p>

      <div style={{ display: "flex", gap: 18 }}>
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => selectRole(role.id)}
              style={{
                width: 280,
                textAlign: "left",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 26,
                cursor: "pointer",
                color: "var(--ink)",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--brand)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
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
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                {role.title}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-2)",
                  lineHeight: 1.5,
                  marginBottom: 14,
                }}
              >
                {role.body}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {role.org}
              </div>
            </button>
          );
        })}
      </div>

      <p
        style={{
          marginTop: 44,
          fontSize: 11.5,
          color: "var(--ink-muted)",
          maxWidth: 460,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        This is a role-scoped demo view, not a verified login — a real
        deployment would use school SSO or a verified guardian account here.
      </p>
    </div>
  );
}
