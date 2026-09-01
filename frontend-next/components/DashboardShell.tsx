"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh" }}>
      <TopBar onMenuClick={() => setOpen((v) => !v)} />

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            top: 60,
            background: "rgba(0,0,0,0.5)",
            zIndex: 30,
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 60,
          left: 0,
          bottom: 0,
          width: 220,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.2s ease",
          zIndex: 40,
        }}
      >
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <div
        style={{
          padding: "22px 26px 40px",
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
