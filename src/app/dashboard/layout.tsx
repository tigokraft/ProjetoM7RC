"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <Sidebar />
      <main className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
