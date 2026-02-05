"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Upload,
  X,
  Eye,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import { BlogCategory } from "@/types/BlogTypes";
import { ADMIN_EMAILS } from "@/constants/admin";

const CATEGORIES: BlogCategory[] = [
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
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewBlogPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<BlogCategory>("Company");
  const [author, setAuthor] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const email = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = email && ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isLoaded, isAdmin, router]);

  useEffect(() => {
    if (user) {
      setAuthor(user.fullName || user.firstName || "");
    }
  }, [user]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      setSlug(generateSlug(title));
    } else {
      setSlug("");
    }
  }, [title]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/blog/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      setCoverImage(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!title || !slug || !description || !content || !category || !author) {
      setError("Please fill in all required fields");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          description,
          content,
          category,
          author,
          authorRole: authorRole || undefined,
          coverImage: coverImage || undefined,
          featured,
          published: publish,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-6 animate-spin text-white/50" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <AlertTriangle className="size-12 text-yellow-500 mb-4" />
          <h1 className="text-xl font-semibold mb-2">Access Denied</h1>
          <p className="text-white/60 mb-6">
            You don&apos;t have permission to access this page.
          </p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">New Blog Post</h1>
            <p className="text-white/60 mt-1">Create a new blog article</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition text-white/70"
          >
            <Eye className="size-4" />
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition text-white/70 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {preview ? (
        /* Preview Mode */
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 mb-4">
            {category}
          </span>
          <h1 className="text-3xl font-semibold mb-4">{title || "Untitled"}</h1>
          <p className="text-white/60 mb-6">{description || "No description"}</p>
          {coverImage && (
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-6">
              <img src={coverImage} alt={title} className="object-cover w-full h-full" />
            </div>
          )}
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
            {content || "No content yet..."}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Cover Image
            </label>
            {coverImage ? (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10">
                <img src={coverImage} alt="Cover" className="object-cover w-full h-full" />
                <button
                  onClick={() => setCoverImage("")}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[16/9] rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition cursor-pointer flex flex-col items-center justify-center"
              >
                {uploading ? (
                  <Loader2 className="size-8 animate-spin text-white/50" />
                ) : (
                  <>
                    <ImageIcon className="size-12 text-white/20 mb-3" />
                    <p className="text-white/50 text-sm">
                      Drop an image here or click to upload
                    </p>
                    <p className="text-white/30 text-xs mt-1">
                      Supports JPEG, PNG, WebP, GIF (max 10MB)
                    </p>
                  </>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {/* Slug (auto-generated from title) */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              readOnly
              placeholder="Auto-generated from title"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.01] text-white/70 font-mono text-sm cursor-default"
            />
            <p className="text-xs text-white/40 mt-1">
              Auto-generated from title. URL: /company/blog/{slug || "..."}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-black">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for preview cards..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Content (Markdown) <span className="text-red-400">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content in Markdown...

## Heading 2
### Heading 3

**Bold text** and *italic text*

- List item 1
- List item 2

> Blockquote

[Link text](https://example.com)

![Image alt](https://example.com/image.jpg)"
              rows={20}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none font-mono text-sm"
            />
          </div>

          {/* Author Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Author <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Author Role
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                placeholder="e.g., CEO, Engineering Lead"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="size-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/20"
            />
            <label htmlFor="featured" className="text-sm text-white/70">
              Feature this post (shows prominently on blog page)
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
