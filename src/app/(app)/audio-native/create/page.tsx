"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Loader2,
  Upload,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";
import { DEFAULT_VOICES, ELEVENLABS_MODELS } from "@/constants";

export default function AudioNativeCreatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICES[0]?.id ?? "");
  const [modelId, setModelId] = useState<string>(ELEVENLABS_MODELS[0]?.id ?? "");
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [autoConvert, setAutoConvert] = useState(true);
  const [textNorm, setTextNorm] = useState<"auto" | "on" | "off" | "apply_english">("auto");
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (title) formData.append("title", title);
      if (author) formData.append("author", author);
      if (voiceId) formData.append("voiceId", voiceId);
      if (modelId) formData.append("modelId", modelId);
      if (textColor) formData.append("textColor", textColor);
      if (bgColor) formData.append("backgroundColor", bgColor);
      formData.append("autoConvert", String(autoConvert));
      formData.append("applyTextNormalization", textNorm);
      if (file) formData.append("file", file);

      const res = await fetch("/api/audio-native", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      router.push("/audio-native");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Link
          href="/audio-native"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back to Audio Native
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-2">
          Create Audio Native Project
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Set up a new embeddable audio player for your content.
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-black dark:text-white">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Blog Audio"
              className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black dark:text-white">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title displayed in the player"
              className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black dark:text-white">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name displayed in the player"
              className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Voice</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors cursor-pointer"
              >
                {DEFAULT_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Model</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors cursor-pointer"
              >
                {ELEVENLABS_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Text Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-[#333] cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-black dark:text-white">Background Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-[#333] cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black dark:text-white">Text Normalization</label>
            <select
              value={textNorm}
              onChange={(e) => setTextNorm(e.target.value as typeof textNorm)}
              className="w-full p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-[#555] transition-colors cursor-pointer"
            >
              <option value="auto">Auto</option>
              <option value="on">On</option>
              <option value="off">Off</option>
              <option value="apply_english">Apply English</option>
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Controls how text is normalized (e.g., spelling out numbers).
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-[#333] rounded-xl">
            <div>
              <span className="text-sm font-medium text-black dark:text-white">Auto Convert</span>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Automatically convert the project to audio after creation.
              </p>
            </div>
            <button
              onClick={() => setAutoConvert(!autoConvert)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                autoConvert ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full absolute top-0.5 transition-transform ${
                  autoConvert ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black dark:text-white">Content File</label>
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
                  HTML or plain text containing your article content
                </span>
                <input
                  type="file"
                  accept=".txt,.html"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
              creating || !name.trim()
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            }`}
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
