"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex flex-1 overflow-y-hidden">
        {/* Sidebar */}
        <aside
          className={`flex h-full shrink-0 flex-col border-r border-border-primary-200 bg-card text-foreground-third transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-72"
          }`}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex h-screen flex-1 flex-col overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
