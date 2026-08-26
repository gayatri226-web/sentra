import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: "Sentra \u2014 Safety Console",
  description: "Behavioral threat detection console for child online safety",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gridTemplateRows: "60px 1fr",
            gridTemplateAreas: `"header header" "sidebar main"`,
            minHeight: "100vh",
          }}
        >
          <TopBar
            subtitle="Safety Console \u00b7 Riverside High (Pilot)"
            userLabel="J. Alvarez \u00b7 Safety Officer"
          />
          <Sidebar />
          <div
            style={{
              gridArea: "main",
              padding: "22px 26px 40px",
              overflowY: "auto",
            }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
