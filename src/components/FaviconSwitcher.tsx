"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

/**
 * Switches favicon based on theme: favblack for light, favwhite for dark.
 */
export function FaviconSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) return;

    const href = resolvedTheme === "dark" ? "/favwhite.png" : "/favblack.png";
    if (!link.href.endsWith(href)) {
      link.href = href;
    }
  }, [resolvedTheme]);

  return null;
}
