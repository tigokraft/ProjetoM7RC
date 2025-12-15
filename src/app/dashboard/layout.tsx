"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Listen to sidebar state from localStorage
  useEffect(() => {
    const handleStorage = () => {
      const isOpen = localStorage.getItem("sidebarOpen") !== "false";
      setSidebarOpen(isOpen);
    };

    handleStorage();
    window.addEventListener("storage", handleStorage);
    
    // Custom event for same-tab updates
    window.addEventListener("sidebarToggle", handleStorage);
    
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("sidebarToggle", handleStorage);
    };
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-[60px]"}`}>
        <main className="flex flex-1 justify-center py-5 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
