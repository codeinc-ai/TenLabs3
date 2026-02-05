"use client";

import { useState } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardErrorBoundary } from "@/components/dashboard/error-boundary";

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * Dashboard Shell Component
 *
 * The main layout wrapper for all authenticated dashboard pages.
 * Features ElevenLabs-style design with:
 * - Desktop sidebar (fixed width)
 * - Mobile sidebar (slide-out drawer)
 * - Header with user menu
 * - Full-height layout with white background
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden font-sans transition-colors">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar - slide-out drawer */}
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header */}
        <DashboardHeader onMobileMenuClick={() => setMobileOpen(true)} />
        
        {/* Page Content with Error Boundary */}
        <DashboardErrorBoundary>
          <main className="flex-1 overflow-y-auto bg-white dark:bg-black transition-colors">
            {children}
          </main>
        </DashboardErrorBoundary>
      </div>
    </div>
  );
}
