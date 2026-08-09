"use client";

import { AppSidebar } from "@/shared/components/app-sidebar";
import { AuthBootstrap } from "@/shared/components/auth-bootstrap";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background sm:flex-row">
      <AuthBootstrap />
      <AppSidebar />
      <main className="min-h-0 min-w-0 flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
        <div className="mx-auto min-w-0 w-full max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
