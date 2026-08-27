import Link from "next/link";

const PILLARS = [
  {
    title: "Pattern, not keywords",
    body: "Sentra watches for the sequence that precedes real harm — a new contact, a sudden spike in messages, then a move to somewhere private. It never reads what was actually said.",
  },
  {
    title: "Machine flags, human decides",
    body: "Known danger is blocked automatically. Anything ambiguous is never auto-punished — it goes to one trained adult, who makes the actual call.",
  },
  {
    title: "Two modes, one engine",
    body: "Run by a school for its students, or by a parent for their own child. Same detection core — just a different responsible adult on the other end.",
  },
  {
    title: "Evidence that can't vanish",
    body: "The moment risk crosses a threshold, a hash-chained record locks automatically — solving the reason so many real cases never reach the police.",
  },
];

const STEPS = [
  { n: "01", label: "Watch", body: "App-usage timing and network signals — never message content." },
  { n: "02", label: "Spot", body: "A pattern known to precede harm: new contact, frequency spike, platform shift." },
  { n: "03", label: "Decide", body: "Clear danger is blocked instantly. Anything unclear goes to a human." },
  { n: "04", label: "Protect", body: "Evidence is locked. The right adult is told. Nothing is ever auto-punished." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--page)", color: "var(--ink)" }}>
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--brand)" }} />
          <span style={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: 15 }}>SENTRA</span>
        </div>
        <Link
          href="/login"
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "9px 18px",
            borderRadius: 8,
            background: "var(--brand)",
            color: "#fff",
          }}
        >
          Enter Safety Console &rarr;
        </Link>
      </div>

      {/* Hero */}
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "90px 24px 70px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11.5,
            letterSpacing: "0.08em",
            color: "var(--ink-muted)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "6px 14px",
            marginBottom: 24,
          }}
        >
          PRIVACY-PRESERVING BEHAVIORAL THREAT DETECTION
        </div>
        <h1
          style={{
            fontSize: 44,
            lineHeight: 1.15,
            margin: "0 0 20px",
            fontWeight: 700,
          }}
        >
          A smoke detector for a child&apos;s online safety
          <br />
          <span style={{ color: "var(--brand)" }}>not a camera on the child.</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            color: "var(--ink-2)",
            maxWidth: 620,
            margin: "0 auto 34px",
            lineHeight: 1.6,
          }}
        >
          Sentra detects escalating online-risk patterns around children
          without ever reading their private messages, and puts every
          ambiguous case in the hands of a trusted human &mdash; never an
          algorithm acting alone.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link
            href="/login"
            style={{
              fontSize: 14,
              fontWeight: 600,
              padding: "13px 24px",
              borderRadius: 8,
              background: "var(--brand)",
              color: "#fff",
            }}
          >
            Enter Safety Console &rarr;
          </Link>
        </div>
      </div>

      {/* Pillars */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
          }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.title}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--brand)",
                borderRadius: 10,
                padding: "22px 24px",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
                {p.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "70px 24px",
          background: "var(--surface)",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <h2 style={{ fontSize: 24, marginBottom: 8, textAlign: "center" }}>
            How it works
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "var(--ink-muted)",
              fontSize: 13.5,
              marginBottom: 40,
            }}
          >
            The whole loop, end to end &mdash; nothing hidden, nothing overclaimed.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
            }}
          >
            {STEPS.map((s) => (
              <div key={s.n} style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--brand)",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  {s.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--ink-muted)", fontSize: 13, marginBottom: 20 }}>
          Built for Omnikon National Hackathon 2026 &middot; Problem Statement Omni_CyberTech_6
        </p>
        <Link
          href="/login"
          style={{
            fontSize: 14,
            fontWeight: 600,
            padding: "13px 24px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            color: "var(--ink)",
          }}
        >
          View the live Safety Console &rarr;
        </Link>
      </div>
    </div>
  );
}
