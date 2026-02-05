// src/types/BlogTypes.ts

/**
 * Blog post categories matching the existing chip categories
 */
export type BlogCategory =
  | "Featured"
  | "API Platform Stories"
  | "Affiliates"
  | "Agents Platform Stories"
  | "Company"
  | "Creative Platform Stories"
  | "Customer Stories"
  | "Developer"
  | "Impact"
  | "Product"
  | "Research";

/**
 * Blog post interface for client-side use
 */
export interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: BlogCategory;
  author: string;
  authorRole?: string;
  coverImage?: string;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request body for creating a new blog post
 */
export interface CreateBlogRequest {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: BlogCategory;
  author: string;
  authorRole?: string;
  coverImage?: string;
  featured?: boolean;
  published?: boolean;
}

/**
 * Request body for updating a blog post
 */
export interface UpdateBlogRequest {
  title?: string;
  description?: string;
  content?: string;
  category?: BlogCategory;
  author?: string;
  authorRole?: string;
  coverImage?: string;
  featured?: boolean;
  published?: boolean;
}

/**
 * Response for blog list endpoint
 */
export interface BlogListResponse {
  posts: BlogPost[];
  total: number;
}

/**
 * Response for single blog endpoint
 */
export interface BlogResponse {
  post: BlogPost;
}

/**
 * Response for image upload
 */
export interface ImageUploadResponse {
  url: string;
  filename: string;
}
