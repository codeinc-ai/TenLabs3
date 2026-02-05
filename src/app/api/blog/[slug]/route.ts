// src/app/api/blog/[slug]/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/constants/admin";
import { getBlogBySlug, updateBlog, deleteBlog } from "@/lib/services/blogService";
import { UpdateBlogRequest } from "@/types/BlogTypes";

type Params = Promise<{ slug: string }>;

/**
 * ==========================================
 * Single Blog API Route
 * ==========================================
 * GET    - Get a single blog by slug (public)
 * PUT    - Update a blog (admin only)
 * DELETE - Delete a blog (admin only)
 */

/**
 * GET /api/blog/[slug]
 * Get a single blog post by slug (public endpoint)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { slug } = await params;
    const post = await getBlogBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Check if trying to access unpublished post
    if (!post.published) {
      const user = await currentUser();
      const email = user?.emailAddresses?.[0]?.emailAddress;

      if (!user || !isAdmin(email)) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/blog/[slug]
 * Update a blog post (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Params }
) {
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
    const { slug } = await params;
    const body = (await req.json()) as UpdateBlogRequest;

    // 4) Update the blog post
    const post = await updateBlog(slug, body);

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/blog/[slug]
 * Delete a blog post (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Params }
) {
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

    // 3) Delete the blog post
    const { slug } = await params;
    const deleted = await deleteBlog(slug);

    if (!deleted) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
