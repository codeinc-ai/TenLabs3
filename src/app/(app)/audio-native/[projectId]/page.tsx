"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  Check,
  Loader2,
  Upload,
  FileText,
  X,
  Radio,
  Clock,
  Palette,
} from "lucide-react";

interface LocalProject {
  _id: string;
  name: string;
  elevenLabsProjectId: string;
  title?: string;
  author?: string;
  voiceId?: string;
  modelId?: string;
  textColor?: string;
  backgroundColor?: string;
  htmlSnippet: string;
  status: "processing" | "ready";
  autoConvert: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RemoteSettings {
  [key: string]: unknown;
}

export default function AudioNativeProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const [localProject, setLocalProject] = useState<LocalProject | null>(null);
  const [remoteSettings, setRemoteSettings] = useState<RemoteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [settingsRes, listRes] = await Promise.all([
          fetch(`/api/audio-native/${projectId}`),
          fetch("/api/audio-native"),
        ]);

        if (!settingsRes.ok) {
          throw new Error(`Failed to fetch project settings (${settingsRes.status})`);
        }
        if (!listRes.ok) {
          throw new Error(`Failed to fetch projects (${listRes.status})`);
        }

        const settingsJson = await settingsRes.json();
        const listJson = await listRes.json();

        if (cancelled) return;

        setRemoteSettings(settingsJson.data ?? null);

        const projects: LocalProject[] = listJson.data ?? [];
        const match = projects.find((p) => p._id === projectId);
        setLocalProject(match ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load project");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleCopySnippet = async () => {
    if (!localProject?.htmlSnippet) return;
    try {
      await navigator.clipboard.writeText(localProject.htmlSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  const handleUpload = async () => {
    if (!file || !projectId) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("autoConvert", "true");

      const res = await fetch(`/api/audio-native/${projectId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Upload failed (${res.status})`);
      }

      setUploadSuccess(true);
      setFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <Link
            href="/audio-native"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={16} />
            Back to Audio Native
          </Link>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!localProject) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
          <Link
            href="/audio-native"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={16} />
            Back to Audio Native
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        {/* Back */}
        <Link
          href="/audio-native"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back to Audio Native
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-1">
              {localProject.name}
            </h1>
            {(localProject.title || localProject.author) && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {localProject.title}
                {localProject.title && localProject.author && " · "}
                {localProject.author}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              localProject.status === "ready"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                localProject.status === "ready" ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            {localProject.status === "ready" ? "Ready" : "Processing"}
          </span>
        </div>

        {/* Embed Code */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-black dark:text-white">Embed Code</h2>
            <button
              onClick={handleCopySnippet}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="relative">
            <pre className="p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
              {localProject.htmlSnippet}
            </pre>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Voice & Model */}
          <div className="p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Radio size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-black dark:text-white">Voice & Model</span>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Voice ID</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-mono text-xs truncate ml-4 max-w-[180px]">
                  {localProject.voiceId || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Model ID</dt>
                <dd className="text-gray-900 dark:text-gray-100 font-mono text-xs truncate ml-4 max-w-[180px]">
                  {localProject.modelId || "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Colors */}
          <div className="p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-black dark:text-white">Colors</span>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Text</dt>
                <dd className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded border border-gray-200 dark:border-[#333]"
                    style={{ backgroundColor: localProject.textColor || "#000000" }}
                  />
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                    {localProject.textColor || "#000000"}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Background</dt>
                <dd className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded border border-gray-200 dark:border-[#333]"
                    style={{ backgroundColor: localProject.backgroundColor || "#ffffff" }}
                  />
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                    {localProject.backgroundColor || "#ffffff"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Timestamps */}
          <div className="p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-black dark:text-white">Timestamps</span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {formatDate(localProject.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Updated</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {formatDate(localProject.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Remote Settings */}
        {remoteSettings && (
          <details className="mb-6">
            <summary className="text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors">
              ElevenLabs Settings (raw)
            </summary>
            <pre className="mt-2 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
              {JSON.stringify(remoteSettings, null, 2)}
            </pre>
          </details>
        )}

        {/* Preview */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-black dark:text-white mb-2">Preview</h2>
          <div className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
            <iframe
              ref={iframeRef}
              srcDoc={localProject.htmlSnippet}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-48 bg-white"
              title="Audio Native Preview"
            />
          </div>
        </div>

        {/* Update Content */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-black dark:text-white mb-2">Update Content</h2>
          <div className="p-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl space-y-4">
            {file ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#333] rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-[#333] rounded-xl cursor-pointer hover:border-gray-400 dark:hover:border-[#555] transition-colors">
                <Upload size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a .txt or .html file
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  This will replace the current project content
                </span>
                <input
                  type="file"
                  accept=".txt,.html"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setUploadSuccess(false);
                    setUploadError(null);
                  }}
                  className="hidden"
                />
              </label>
            )}

            {uploadError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-600 dark:text-green-400">
                Content updated successfully.
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                uploading || !file
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Update Content"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
