// src/models/Blog.ts
import mongoose, { Schema, Document } from "mongoose";

/**
 * Blog categories matching the UI chips
 */
const BLOG_CATEGORIES = [
  "Featured",
  "API Platform Stories",
  "Affiliates",
  "Agents Platform Stories",
  "Company",
  "Creative Platform Stories",
  "Customer Stories",
  "Developer",
  "Impact",
  "Product",
  "Research",
] as const;

export type BlogCategoryType = (typeof BLOG_CATEGORIES)[number];

/**
 * Blog Document Interface
 */
export interface IBlog extends Document {
  /** URL-friendly unique identifier */
  slug: string;
  /** Blog post title */
  title: string;
  /** Short description/excerpt */
  description: string;
  /** Full content in markdown format */
  content: string;
  /** Category/chip type */
  category: BlogCategoryType;
  /** Author name */
  author: string;
  /** Author role/title (optional) */
  authorRole?: string;
  /** Cover image URL */
  coverImage?: string;
  /** Whether this is a featured post */
  featured: boolean;
  /** Whether the post is published (false = draft) */
  published: boolean;
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Blog Schema
 */
const BlogSchema: Schema = new Schema<IBlog>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: BLOG_CATEGORIES,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    authorRole: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
BlogSchema.index({ published: 1, createdAt: -1 });
BlogSchema.index({ category: 1, published: 1 });
BlogSchema.index({ featured: 1, published: 1 });

/**
 * Blog Model
 */
const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
export { BLOG_CATEGORIES };
