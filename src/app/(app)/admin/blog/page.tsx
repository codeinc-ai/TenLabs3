"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { BlogPost } from "@/types/BlogTypes";
import { ADMIN_EMAILS } from "@/constants/admin";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminBlogPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog?all=true");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin]);

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeleting(slug);
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.slug !== slug));
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete post");
    } finally {
      setDeleting(null);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-6 animate-spin text-white/50" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
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
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Blog Management</h1>
          <p className="text-white/60 mt-1">
            Create, edit, and manage blog posts
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition font-medium"
        >
          <Plus className="size-4" />
          New Post
        </Link>
      </div>

      {/* Posts Table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Date
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/50">
                  No blog posts yet.{" "}
                  <Link href="/admin/blog/new" className="text-white hover:underline">
                    Create your first post
                  </Link>
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post._id}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-white">{post.title}</div>
                    <div className="text-sm text-white/50 mt-0.5 truncate max-w-xs">
                      {post.description}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/70">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-green-400">
                        <Eye className="size-3.5" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-white/50">
                        <EyeOff className="size-3.5" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-white/60">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/company/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
                        title="View"
                      >
                        <ArrowUpRight className="size-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="p-2 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
                        title="Edit"
                      >
                        <Edit className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        disabled={deleting === post.slug}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition text-white/60 hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === post.slug ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
