// src/app/api/blog/image/route.ts
import { NextRequest, NextResponse } from "next/server";

import { getBackblazeDownloadUrl } from "@/lib/services/backblazeService";

/**
 * GET /api/blog/image?url=<encoded-b2-url>
 *
 * Proxies blog images from Backblaze B2. For private buckets, generates
 * a signed URL and redirects. For public buckets, redirects to the original URL.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urlParam = searchParams.get("url");

    if (!urlParam) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    let imageUrl: string;
    try {
      imageUrl = decodeURIComponent(urlParam);
    } catch {
      return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
    }

    // Only allow Backblaze B2 URLs
    if (!imageUrl.includes("backblazeb2.com")) {
      return NextResponse.json({ error: "Invalid image source" }, { status: 400 });
    }

    // Parse fileName from B2 URL: https://xxx.backblazeb2.com/file/bucketName/path/to/file
    const bucketName = process.env.B2_BUCKET_NAME;
    if (!bucketName) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const filePrefix = `/file/${bucketName}/`;
    const fileIndex = imageUrl.indexOf(filePrefix);
    if (fileIndex === -1) {
      return NextResponse.json({ error: "Invalid B2 URL format" }, { status: 400 });
    }

    let fileName = imageUrl.substring(fileIndex + filePrefix.length);
    // Strip query params if present
    const qIndex = fileName.indexOf("?");
    if (qIndex !== -1) fileName = fileName.substring(0, qIndex);
    if (!fileName) {
      return NextResponse.json({ error: "Invalid B2 URL format" }, { status: 400 });
    }

    // Decode the path (URL may have encoded segments like %2F for /)
    let decodedFileName: string;
    try {
      decodedFileName = decodeURIComponent(fileName);
    } catch {
      decodedFileName = fileName;
    }

    // Get signed URL (works for both public and private buckets)
    const signed = await getBackblazeDownloadUrl({
      fileName: decodedFileName,
      signed: true,
      expiresInSeconds: 3600, // 1 hour
    });

    // Redirect to the signed URL so the browser loads the image directly
    return NextResponse.redirect(signed.url, 302);
  } catch (error) {
    console.error("Blog image proxy error:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
