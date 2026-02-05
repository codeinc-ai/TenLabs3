// src/app/api/blog/upload/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/constants/admin";
import { uploadBlogImageToBackblaze } from "@/lib/services/backblazeService";

/**
 * ==========================================
 * Blog Image Upload API Route
 * ==========================================
 * POST - Upload an image to Backblaze B2 (admin only)
 */

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] || "jpg";
}

/**
 * POST /api/blog/upload
 * Upload an image for blog posts (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // 1) Authenticate user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2) Check admin access
    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!isAdmin(email)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // 3) Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 4) Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // 5) Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // 6) Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7) Generate unique image ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const imageId = `blog-${timestamp}-${randomSuffix}`;

    // 8) Upload to Backblaze
    const result = await uploadBlogImageToBackblaze({
      imageId,
      imageBuffer: buffer,
      extension: getExtensionFromMimeType(file.type),
      contentType: file.type,
    });

    // 9) Return the URL
    return NextResponse.json(
      {
        url: result.url,
        filename: result.fileName,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
