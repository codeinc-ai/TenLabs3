"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PostHogProvider } from "posthog-js/react";
import { useUser } from "@clerk/nextjs";

import { capturePosthogBrowserEvent, initPosthogBrowser, posthog } from "@/lib/posthogBrowser";
import { ThemeProvider } from "@/components/theme-provider";
import { IntroVideo } from "@/components/IntroVideo";
import { FaviconSwitcher } from "@/components/FaviconSwitcher";

function pageNameFromPath(pathname: string | null): string {
  if (!pathname || pathname === "/") return "home";

  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "unknown";
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();

  // Init PostHog once on the client.
  useEffect(() => {
    initPosthogBrowser();
  }, []);

  // Identify the user (Clerk userId) when available.
  useEffect(() => {
    if (!user?.id) {
      // If a user signs out, reset the browser identity.
      posthog.reset();
      return;
    }

    initPosthogBrowser();
    posthog.identify(user.id);
  }, [user?.id]);

  // Track page views in the App Router.
  useEffect(() => {
    if (!pathname) return;

    capturePosthogBrowserEvent("page_view", {
      feature: "navigation",
      pageName: pageNameFromPath(pathname),
      route: pathname,
      userId: user?.id,
    });
  }, [pathname, user?.id]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PostHogProvider client={posthog}>{children}</PostHogProvider>
      <IntroVideo />
      <FaviconSwitcher />
    </ThemeProvider>
  );
}
