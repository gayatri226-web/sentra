import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentra — Behavioral Threat Detection for Child Online Safety",
  description:
    "Sentra detects escalating online-risk patterns around children without reading their private messages, and puts ambiguous cases in the hands of a trusted human.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
