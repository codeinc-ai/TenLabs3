"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * TenLabs logo that switches based on theme:
 * - Dark mode: white/light logo
 * - Light mode: dark logo
 */
interface TenLabsLogoProps {
  /** Height of the logo in pixels */
  height?: number;
  /** Optional href to wrap the logo in a link */
  href?: string;
  /** Additional className for the wrapper */
  className?: string;
}

const LOGO_DARK = "/tenlabsdark.png"; // For light mode (dark logo on light bg)
const LOGO_WHITE = "/tenlabs%20white%20.png"; // For dark mode (white logo on dark bg)

export function TenLabsLogo({ height = 32, href, className = "" }: TenLabsLogoProps) {
  const img = (
    <div className={`relative flex items-center justify-center ${className}`} style={{ height }}>
      {/* Dark logo - visible in light mode */}
      <Image
        src={LOGO_DARK}
        alt="TenLabs"
        width={height * 4}
        height={height}
        className="h-auto w-auto object-contain object-center dark:hidden"
        style={{ maxHeight: height }}
        priority
      />
      {/* White logo - visible in dark mode */}
      <Image
        src={LOGO_WHITE}
        alt="TenLabs"
        width={height * 4}
        height={height}
        className="hidden h-auto w-auto object-contain object-center dark:block"
        style={{ maxHeight: height }}
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="TenLabs home" className="shrink-0">
        {img}
      </Link>
    );
  }

  return img;
}
