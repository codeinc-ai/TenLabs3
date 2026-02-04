import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { DashboardShell } from "@/components/dashboard";

/**
 * App Layout - Authenticated Dashboard Layout
 *
 * This layout wraps all pages under the (app) route group.
 * It provides:
 * 1. Route-level authentication protection
 * 2. Dashboard shell with sidebar navigation
 * 3. Header with user menu
 * 4. Error boundary for content (via DashboardShell)
 *
 * Authentication Flow:
 * - Uses Clerk's currentUser() to verify authentication
 * - Redirects unauthenticated users to Clerk-hosted sign-in page
 * - All child pages automatically inherit auth protection
 *
 * Integration:
 * - PostHog analytics tracking is handled by Providers in root layout
 * - Sentry error boundary is included in DashboardShell
 * - All existing services (ElevenLabs, Backblaze, Stripe) remain accessible
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ============================================
  // Authentication Guard
  // ============================================
  // Fetch current user from Clerk.
  // This is a server-side check that runs on every request.
  const user = await currentUser();

  // If no authenticated user, redirect to Clerk sign-in.
  // The /sign-in route is configured in Clerk middleware.
  if (!user) {
    redirect("/sign-in");
  }

  // ============================================
  // Render Dashboard Layout
  // ============================================
  // The DashboardShell component provides:
  // - Responsive sidebar navigation
  // - Header with user menu
  // - Sentry error boundary for content
  return <DashboardShell>{children}</DashboardShell>;
}
