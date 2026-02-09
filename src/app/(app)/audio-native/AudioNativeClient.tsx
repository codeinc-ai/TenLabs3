"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Volume2,
  RotateCcw,
  RotateCw,
  Radio,
  TrendingUp,
  Settings,
  BarChart3,
  Plus,
  Loader2,
  Copy,
  Check,
  X,
  ChevronDown,
  Mic2,
} from "lucide-react";
import Link from "next/link";

interface AudioNativeProject {
  _id: string;
  name: string;
  title?: string;
  author?: string;
  voiceId?: string;
  htmlSnippet: string;
  status: "processing" | "ready";
  createdAt: string;
}

interface VoiceOption {
  voiceId: string;
  name: string;
  category?: string;
}

const features = [
  {
    icon: TrendingUp,
    title: "Increase engagement and time on page",
    description:
      "Boost engagement and reduce churn with an audio player that automatically narrates your content, keeping visitors on your page longer and improving SEO.",
  },
  {
    icon: Settings,
    title: "Fully customize your player",
    description:
      "The Audio Native player can be customized to match your brand and configured to narrate your content in any voice you select.",
  },
  {
    icon: BarChart3,
    title: "Track performance and increase user insights",
    description:
      "Monitor your player's performance by reviewing detailed metrics on listens, engagement, and devices across different web pages.",
  },
];

interface AudioNativeClientProps {
  userPlan: "free" | "starter" | "creator" | "pro";
}

export function AudioNativeClient({ userPlan }: AudioNativeClientProps) {
  const hasAccess = userPlan === "creator" || userPlan === "pro";

  const [projects, setProjects] = useState<AudioNativeProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createAuthor, setCreateAuthor] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Snippet copy
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch projects
  const fetchProjects = useCallback(() => {
    if (!hasAccess) return;
    setLoadingProjects(true);
    fetch("/api/audio-native")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setProjects(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, [hasAccess]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch voices when dialog opens
  const fetchVoices = useCallback(async () => {
    setLoadingVoices(true);
    try {
      // Fetch default voices and user's custom voices in parallel
      const [defaultRes, myRes] = await Promise.all([
        fetch("/api/voices?defaultOnly=true&limit=100&sortBy=name"),
        fetch("/api/voices/my-voices").catch(() => null),
      ]);

      const allVoices: VoiceOption[] = [];
      const seen = new Set<string>();

      // User's custom voices first
      if (myRes && myRes.ok) {
        const myJson = await myRes.json();
        for (const v of myJson.voices ?? []) {
          if (v.voiceId && v.name && !seen.has(v.voiceId)) {
            seen.add(v.voiceId);
            allVoices.push({ voiceId: v.voiceId, name: v.name, category: v.category });
          }
        }
      }

      // Default voices
      if (defaultRes.ok) {
        const defaultJson = await defaultRes.json();
        for (const v of defaultJson.voices ?? []) {
          if (v.voiceId && v.name && !seen.has(v.voiceId)) {
            seen.add(v.voiceId);
            allVoices.push({ voiceId: v.voiceId, name: v.name, category: v.category });
          }
        }
      }

      setVoices(allVoices);
      if (allVoices.length > 0 && !selectedVoiceId) {
        setSelectedVoiceId(allVoices[0].voiceId);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingVoices(false);
    }
  }, [selectedVoiceId]);

  const openCreate = () => {
    setShowCreate(true);
    setCreateError(null);
    fetchVoices();
  };

  // Create project
  const handleCreate = async () => {
    if (!createName.trim() || creating) return;
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/audio-native", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          title: createTitle.trim() || undefined,
          author: createAuthor.trim() || undefined,
          voiceId: selectedVoiceId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create project");
      }

      setShowCreate(false);
      setCreateName("");
      setCreateTitle("");
      setCreateAuthor("");
      fetchProjects();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const copySnippet = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Separate custom voices from default
  const customVoices = voices.filter((v) =>
    ["Designed", "Cloned", "Remixed", "Custom"].includes(v.category || "")
  );
  const defaultVoices = voices.filter(
    (v) => !["Designed", "Cloned", "Remixed", "Custom"].includes(v.category || "")
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Audio Native</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Automatically voices content of a web page using ElevenLabs&apos;
          text-to-speech service
        </p>

        {/* Demo Card — only show if no projects */}
        {projects.length === 0 && (
          <div className="border border-gray-200 dark:border-[#333] rounded-2xl p-8 mb-6">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border border-gray-200 dark:border-[#333] rounded-xl flex items-center justify-center">
                <Radio size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-center text-black dark:text-white mb-2">
              Get started with Audio Native
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8 max-w-lg mx-auto">
              An embedded player that automatically parses the content of your
              blog posts and voices it using text-to-speech.
            </p>

            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl p-4 mb-6 max-w-xl mx-auto">
              <div className="flex items-center gap-4 mb-3">
                <button className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  <Play size={20} className="text-white dark:text-black ml-1" fill="currentColor" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">ElevenLabs</span>
                    <span className="text-gray-400 dark:text-gray-500">—</span>
                    <span>Audio</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">00:00</span>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-[#333] rounded-full">
                      <div className="w-1 h-full bg-black dark:bg-white rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">00:04</span>
                    <Volume2 size={16} className="text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <RotateCcw size={16} />
                </button>
                <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors font-medium">
                  1.0x
                </button>
                <button className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  <RotateCw size={16} />
                </button>
              </div>
              <div className="text-right mt-2">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  Ten Labs
                </span>
              </div>
            </div>

            <div className="relative max-w-xl mx-auto">
              <div className="space-y-2 blur-[2px] select-none">
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  Scientific and technological fields. As research advances, the
                  potential to harness sound waves for new applications continues
                  to grow, promising exciting developments in medicine,
                  communication, and technology.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                  The study of sound waves is not only pivotal in understanding
                  auditory experiences but also extends to various scientific and
                  technological fields.
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Play video
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Banner */}
        {hasAccess ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl mb-10">
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-1">
                Audio Native is ready
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a project and choose which voice narrates your content.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} />
              Create a project
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl mb-10">
            <div>
              <h3 className="font-semibold text-black dark:text-white mb-1">
                Upgrade your subscription
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You need to be subscribed to at least the Creator tier to access
                Audio Native.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/billing"
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Upgrade
              </Link>
              <Link
                href="/support"
                className="px-4 py-2 bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#333] transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        )}

        {/* Projects List */}
        {hasAccess && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
              Your Projects
            </h2>

            {loadingProjects ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : projects.length === 0 ? (
              <div className="border border-dashed border-gray-300 dark:border-[#333] rounded-xl p-8 text-center">
                <Radio size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No projects yet. Create your first Audio Native project.
                </p>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <Plus size={16} />
                  Create a project
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="border border-gray-200 dark:border-[#333] rounded-xl p-5 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-black dark:text-white truncate">
                            {project.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              project.status === "ready"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {project.status === "ready" ? "Ready" : "Processing"}
                          </span>
                        </div>
                        {(project.title || project.author) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {[project.title, project.author].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => copySnippet(project._id, project.htmlSnippet)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525] transition-colors flex-shrink-0"
                      >
                        {copiedId === project._id ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy Embed
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 dark:bg-black/30 rounded-lg overflow-x-auto">
                      <code className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-all font-mono">
                        {project.htmlSnippet.length > 200
                          ? project.htmlSnippet.slice(0, 200) + "..."
                          : project.htmlSnippet}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <Icon size={20} className="text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-black dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trusted By */}
        <div className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Trusted by</p>
          <div className="flex items-center justify-center gap-12 flex-wrap">
            <span className="text-xl font-serif font-bold text-black dark:text-white tracking-tight">
              THE NEW YORKER
            </span>
            <span className="text-xl font-serif font-bold text-black dark:text-white tracking-tight">
              The New York Times
            </span>
            <span className="text-xl font-serif italic text-black dark:text-white">
              The Atlantic
            </span>
          </div>
        </div>
      </div>

      {/* Create Project Dialog */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold text-black dark:text-white mb-1">
              Create Audio Native Project
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Set up a new embedded player. Choose a voice from your library.
            </p>

            <div className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="My Blog Audio"
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-[#333] rounded-lg text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#555] transition"
                />
              </div>

              {/* Voice Picker */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <Mic2 size={12} className="inline mr-1" />
                  Voice
                </label>
                {loadingVoices ? (
                  <div className="flex items-center gap-2 h-10 px-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-[#333] rounded-lg">
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Loading voices...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedVoiceId}
                      onChange={(e) => setSelectedVoiceId(e.target.value)}
                      className="w-full h-10 px-3 pr-8 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-[#333] rounded-lg text-sm text-black dark:text-white appearance-none focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#555] transition"
                    >
                      {customVoices.length > 0 && (
                        <optgroup label="My Voices">
                          {customVoices.map((v) => (
                            <option key={v.voiceId} value={v.voiceId}>
                              {v.name} {v.category ? `(${v.category})` : ""}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {defaultVoices.length > 0 && (
                        <optgroup label="Default Voices">
                          {defaultVoices.map((v) => (
                            <option key={v.voiceId} value={v.voiceId}>
                              {v.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  Use your designed, cloned, or default voices.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Article or page title"
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-[#333] rounded-lg text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#555] transition"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  Author (optional)
                </label>
                <input
                  type="text"
                  value={createAuthor}
                  onChange={(e) => setCreateAuthor(e.target.value)}
                  placeholder="Author name"
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-[#333] rounded-lg text-sm text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-[#555] transition"
                />
              </div>

              {createError && (
                <p className="text-sm text-red-500">{createError}</p>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 h-10 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!createName.trim() || creating}
                  className="flex-1 h-10 px-4 flex items-center justify-center gap-2 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
