// src/lib/services/blogService.ts
import "server-only";

import { connectToDB } from "@/lib/mongodb";
import Blog, { IBlog } from "@/models/Blog";
import { BlogPost, CreateBlogRequest, UpdateBlogRequest } from "@/types/BlogTypes";

/**
 * ==========================================
 * Blog Service
 * ==========================================
 * Handles all blog CRUD operations.
 * Stateless by design.
 */

/**
 * Convert MongoDB document to client-safe BlogPost
 */
function toClientBlog(doc: IBlog): BlogPost {
  return {
    _id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    content: doc.content,
    category: doc.category,
    author: doc.author,
    authorRole: doc.authorRole,
    coverImage: doc.coverImage,
    featured: doc.featured,
    published: doc.published,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Get all published blog posts
 */
export async function getAllBlogs(includeUnpublished = false): Promise<BlogPost[]> {
  await connectToDB();

  const query = includeUnpublished ? {} : { published: true };
  const blogs = await Blog.find(query)
    .sort({ createdAt: -1 })
    .lean<IBlog[]>();

  return blogs.map(toClientBlog);
}

/**
 * Get latest N published blogs (for homepage)
 */
export async function getLatestBlogs(limit = 3): Promise<BlogPost[]> {
  await connectToDB();

  const blogs = await Blog.find({ published: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<IBlog[]>();

  return blogs.map(toClientBlog);
}

/**
 * Get a single blog post by slug
 */
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  await connectToDB();

  const blog = await Blog.findOne({ slug: slug.toLowerCase() }).lean<IBlog>();

  if (!blog) return null;

  return toClientBlog(blog);
}

/**
 * Create a new blog post
 */
export async function createBlog(data: CreateBlogRequest): Promise<BlogPost> {
  await connectToDB();

  // Check for existing slug
  const existing = await Blog.findOne({ slug: data.slug.toLowerCase() });
  if (existing) {
    throw new Error("A blog post with this slug already exists");
  }

  const blog = await Blog.create({
    slug: data.slug.toLowerCase(),
    title: data.title,
    description: data.description,
    content: data.content,
    category: data.category,
    author: data.author,
    authorRole: data.authorRole,
    coverImage: data.coverImage,
    featured: data.featured ?? false,
    published: data.published ?? false,
  });

  return toClientBlog(blog);
}

/**
 * Update an existing blog post
 */
export async function updateBlog(
  slug: string,
  data: UpdateBlogRequest
): Promise<BlogPost | null> {
  await connectToDB();

  const blog = await Blog.findOneAndUpdate(
    { slug: slug.toLowerCase() },
    { $set: data },
    { new: true, runValidators: true }
  ).lean<IBlog>();

  if (!blog) return null;

  return toClientBlog(blog);
}

/**
 * Delete a blog post
 */
export async function deleteBlog(slug: string): Promise<boolean> {
  await connectToDB();

  const result = await Blog.deleteOne({ slug: slug.toLowerCase() });
  return result.deletedCount > 0;
}

/**
 * Get featured blog post
 */
export async function getFeaturedBlog(): Promise<BlogPost | null> {
  await connectToDB();

  const blog = await Blog.findOne({ featured: true, published: true })
    .sort({ createdAt: -1 })
    .lean<IBlog>();

  if (!blog) return null;

  return toClientBlog(blog);
}

/**
 * Get blogs by category
 */
export async function getBlogsByCategory(category: string): Promise<BlogPost[]> {
  await connectToDB();

  const blogs = await Blog.find({ category, published: true })
    .sort({ createdAt: -1 })
    .lean<IBlog[]>();

  return blogs.map(toClientBlog);
}
