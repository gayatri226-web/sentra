import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AuthGate from "@/components/AuthGate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gridTemplateRows: "60px 1fr",
          gridTemplateAreas: `"header header" "sidebar main"`,
          minHeight: "100vh",
        }}
      >
        <TopBar />
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
    </AuthGate>
  );
}
