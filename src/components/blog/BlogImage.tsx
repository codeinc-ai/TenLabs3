"use client";

import Image from "next/image";

/**
 * Blog image component that handles both local and external URLs.
 * - Local paths: use Next.js Image
 * - Backblaze B2 URLs: use proxy to get signed URL (required for private buckets)
 * - Other external URLs: use native img
 */
export function BlogImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  const isBackblaze = isExternal && src.includes("backblazeb2.com");

  // Use proxy for Backblaze URLs (handles private buckets via signed URLs)
  const imgSrc = isBackblaze
    ? `/api/blog/image?url=${encodeURIComponent(src)}`
    : src;

  if (isExternal) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        style={
          fill
            ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
            : undefined
        }
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 800}
      height={height ?? 400}
      className={className}
    />
  );
}
