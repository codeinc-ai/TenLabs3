"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, MoreHorizontal, RefreshCw, Download, Loader2 } from "lucide-react";
import { DubbingModal } from "./DubbingModal";
import { DUBBING_CONFIG } from "@/constants";

interface DubbingClientProps {
  userId?: string;
  userPlan?: "free" | "pro";
  currentUsage?: {
    dubbingsUsed: number;
  };
}

interface DubbingProject {
  _id: string;
  projectName: string;
  originalFileName: string;
  sourceLanguage: string;
  targetLanguages: string[];
  status: "pending" | "dubbing" | "dubbed" | "failed";
  errorMessage?: string;
  createdAt: string;
}

const learnCards = [
  {
    title: "Learn about the Dubbing editor",
    description: "A professional app for dubbing content.",
  },
  {
    title: "Importing YouTube videos",
    description: "Learn how to dub any YouTube video.",
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getLanguageName(code: string): string {
  return DUBBING_CONFIG.supportedLanguages.find((l) => l.code === code)?.name ?? code;
}

/**
 * Dubbing Client Component
 *
 * Create dubbed versions of videos in different languages.
 */
export function DubbingClient({ userId, userPlan, currentUsage }: DubbingClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dubbings, setDubbings] = useState<DubbingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const checkingRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchDubbings = useCallback(async () => {
    try {
      const res = await fetch("/api/dubbing?page=1&limit=20");
      if (!res.ok) return;
      const data = await res.json();
      setDubbings(data.dubbings ?? []);
    } catch {
      setDubbings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDubbings();
  }, [fetchDubbings]);

  const checkStatus = useCallback(async (projectId: string) => {
    if (checkingRef.current.has(projectId)) return;
    checkingRef.current.add(projectId);
    setCheckingIds((prev) => new Set(prev).add(projectId));

    try {
      const res = await fetch(`/api/dubbing/${projectId}/status`);
      if (!res.ok) return;
      const data = await res.json();
      setDubbings((prev) =>
        prev.map((d) =>
          d._id === projectId ? { ...d, status: data.status, errorMessage: data.error } : d
        )
      );
    } finally {
      checkingRef.current.delete(projectId);
      setCheckingIds((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  }, []);

  // Auto-poll for projects that are pending or dubbing
  useEffect(() => {
    const inProgress = dubbings.filter(
      (d) => d.status === "pending" || d.status === "dubbing"
    );
    if (inProgress.length === 0) return;

    const interval = setInterval(() => {
      inProgress.forEach((d) => checkStatus(d._id));
    }, 5000);

    return () => clearInterval(interval);
  }, [dubbings, checkStatus]);

  const handleSuccess = useCallback(() => {
    fetchDubbings();
  }, [fetchDubbings]);

  const handlePlayPreview = useCallback((projectId: string, lang: string) => {
    const key = `${projectId}-${lang}`;
    if (playingKey === key && audioRef.current) {
      audioRef.current.pause();
      setPlayingKey(null);
      return;
    }
    setPlayingKey(key);
    if (audioRef.current) {
      audioRef.current.src = `/api/dubbing/${projectId}/audio/${lang}`;
      audioRef.current.play().catch(() => setPlayingKey(null));
    }
  }, [playingKey]);

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={() => setPlayingKey(null)}
        onError={() => setPlayingKey(null)}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-black dark:text-white">Dubbing</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg transition-colors"
            >
              Create a Dub
            </button>
          </div>

          {/* Learn Section */}
          <div className="mb-10">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learnCards.map((card, index) => (
                <button
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#444] hover:shadow-sm dark:hover:shadow-none transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-gray-800 dark:bg-[#252525] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 dark:group-hover:bg-[#333] transition-colors">
                    <Play size={18} className="text-white ml-0.5" fill="white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{card.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Dubs Section */}
          <div>
            <h2 className="text-lg font-semibold text-black dark:text-white mb-6">Recent Dubs</h2>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_140px_100px_80px] gap-4 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
              <div>Name</div>
              <div>Languages</div>
              <div>Status</div>
              <div>Created</div>
              <div></div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100 dark:divide-[#333]">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Loading...
                </div>
              ) : dubbings.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No dubbing projects yet. Create your first dub above.
                </div>
              ) : (
                dubbings.map((dub) => (
                  <div
                    key={dub._id}
                    className="grid grid-cols-[1fr_120px_140px_100px_80px] gap-4 px-4 py-4 items-center hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="text-sm text-gray-900 dark:text-white truncate" title={dub.projectName}>
                      {dub.projectName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {dub.targetLanguages.map(getLanguageName).join(", ")}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={dub.status} errorMessage={dub.errorMessage} />
                      {(dub.status === "pending" || dub.status === "dubbing") && (
                        <button
                          onClick={() => checkStatus(dub._id)}
                          disabled={checkingIds.has(dub._id)}
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded transition-colors disabled:opacity-50"
                          title="Check status"
                        >
                          {checkingIds.has(dub._id) ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RefreshCw size={14} />
                          )}
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dub.createdAt)}
                    </div>
                    <div className="flex justify-end gap-1">
                      {dub.status === "dubbed" &&
                        dub.targetLanguages.map((lang) => {
                          const key = `${dub._id}-${lang}`;
                          const isPlaying = playingKey === key;
                          return (
                            <div key={lang} className="flex items-center gap-0.5">
                              <button
                                onClick={() => handlePlayPreview(dub._id, lang)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isPlaying
                                    ? "text-gray-900 dark:text-white bg-gray-200 dark:bg-[#333]"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525]"
                                }`}
                                title={isPlaying ? `Pause ${getLanguageName(lang)}` : `Preview ${getLanguageName(lang)}`}
                              >
                                {isPlaying ? (
                                  <Pause size={16} />
                                ) : (
                                  <Play size={16} className="ml-0.5" fill="currentColor" />
                                )}
                              </button>
                              <a
                                href={`/api/dubbing/${dub._id}/audio/${lang}`}
                                download={`${dub.projectName}_${lang}.mp3`}
                                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
                                title={`Download ${getLanguageName(lang)}`}
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          );
                        })}
                      <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <DubbingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        userId={userId}
        userPlan={userPlan}
        currentUsage={currentUsage}
      />
    </>
  );
}

function StatusBadge({
  status,
  errorMessage,
}: {
  status: DubbingProject["status"];
  errorMessage?: string;
}) {
  const config = {
    pending: { label: "Pending", className: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300" },
    dubbing: { label: "Dubbing...", className: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300" },
    dubbed: { label: "Done", className: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300" },
    failed: { label: "Failed", className: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300" },
  }[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
      title={status === "failed" ? errorMessage : undefined}
    >
      {config.label}
    </span>
  );
}
