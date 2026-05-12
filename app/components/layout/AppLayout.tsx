"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  headerTitle: string;
  headerSubtitle?: string;
  headerStatus?: "ok" | "attention" | "offline";
}

export default function AppLayout({
  children,
  headerTitle,
  headerSubtitle,
  headerStatus,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#F4F7FA] text-[#0F172A]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={headerTitle}
          subtitle={headerSubtitle}
          status={headerStatus}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
