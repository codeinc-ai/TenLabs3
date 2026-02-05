// src/app/api/blog/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/constants/admin";
import { getAllBlogs, createBlog } from "@/lib/services/blogService";
import { CreateBlogRequest } from "@/types/BlogTypes";

/**
 * ==========================================
 * Blog API Route
 * ==========================================
 * GET  - List all published blogs (public)
 * POST - Create a new blog (admin only)
 */

/**
 * GET /api/blog
 * List all published blog posts (public endpoint)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeUnpublished = searchParams.get("all") === "true";

    // If requesting unpublished posts, verify admin
    if (includeUnpublished) {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress;

      if (!user || !isAdmin(email)) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const posts = await getAllBlogs(includeUnpublished);

    return NextResponse.json({ posts, total: posts.length }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/blog
 * Create a new blog post (admin only)
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

    // 3) Parse request body
    const body = (await req.json()) as CreateBlogRequest;

    // 4) Validate required fields
    if (!body.slug || !body.title || !body.description || !body.content || !body.category || !body.author) {
      return NextResponse.json(
        { error: "Missing required fields: slug, title, description, content, category, author" },
        { status: 400 }
      );
    }

    // 5) Create the blog post
    const post = await createBlog(body);

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
