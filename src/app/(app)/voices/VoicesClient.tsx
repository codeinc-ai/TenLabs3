"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {
  Mic,
  Search,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  Sparkles,
  MessageCircle,
  Play,
  Users,
  Smartphone,
  GraduationCap,
  Megaphone,
  Folder,
  X,
  Loader2,
  Mic2,
  Wand2,
  ChevronDown,
  Crown,
} from "lucide-react";

import type { VoiceListResponse, VoiceItem } from "@/lib/services/voiceService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InstantCloneDialog } from "@/components/voices/InstantCloneDialog";
import { VoiceDesignDialog } from "@/components/voices/VoiceDesignDialog";
import { ProfessionalCloneDialog } from "@/components/voices/ProfessionalCloneDialog";

const categories = [
  { icon: MessageCircle, label: "Conversational" },
  { icon: Play, label: "Narration" },
  { icon: Users, label: "Characters" },
  { icon: Smartphone, label: "Social Media" },
  { icon: GraduationCap, label: "Educational" },
  { icon: Megaphone, label: "Advertisement" },
];

const useCaseCards = [
  { title: "Best voices for Eleven v3", bg: "bg-gray-900", textColor: "text-white" },
  { title: "Popular Tiktok voices", bg: "bg-pink-500", textColor: "text-white" },
  { title: "Studio-Quality Conversational Voices", bg: "bg-gray-800", textColor: "text-white" },
  { title: "Engaging Characters for Video Games", bg: "bg-emerald-700", textColor: "text-white" },
];

interface VoicesClientProps {
  initialData: VoiceListResponse;
  canUsePVC?: boolean;
}

export function VoicesClient({ initialData, canUsePVC = false }: VoicesClientProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [data, setData] = useState<VoiceListResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"explore" | "my-voices" | "default">("explore");
  const [search, setSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Voice creation dialogs
  const [instantCloneOpen, setInstantCloneOpen] = useState(false);
  const [voiceDesignOpen, setVoiceDesignOpen] = useState(false);
  const [professionalCloneOpen, setProfessionalCloneOpen] = useState(false);

  const handleVoiceCreated = () => {
    fetchVoices(1);
    router.push("/voices/my-voices");
  };

  const fetchVoices = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });
        if (search) params.set("search", search);
        if (activeTab === "default") params.set("defaultOnly", "true");

        const res = await fetch(`/api/voices?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        setData(result);
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    },
    [search, activeTab]
  );

  // Refetch when tab changes between explore and default (skip initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (activeTab === "explore" || activeTab === "default") {
      fetchVoices(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVoices(1);
  };

  const handlePlay = (voice: VoiceItem) => {
    if (playingId === voice.voiceId) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      setPlayingId(voice.voiceId);
      if (audioRef.current) {
        audioRef.current.src = voice.previewUrl || "";
        audioRef.current.play().catch(() => setPlayingId(null));
      }
    }
  };

  const handleSave = async (voice: VoiceItem) => {
    setSavingId(voice.voiceId);
    try {
      if (voice.isSaved) {
        await fetch(`/api/voices/my-voices/${voice.voiceId}`, { method: "DELETE" });
      } else {
        await fetch("/api/voices/my-voices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voiceId: voice.voiceId }),
        });
      }
      setData((prev) => ({
        ...prev,
        voices: prev.voices.map((v) =>
          v.voiceId === voice.voiceId ? { ...v, isSaved: !v.isSaved } : v
        ),
      }));
    } catch (err) {
      Sentry.captureException(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleUseVoice = (voice: VoiceItem) => {
    router.push(`/tts?voice=${voice.voiceId}`);
  };

  const getVoiceColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-orange-400",
      "bg-purple-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-amber-500",
      "bg-indigo-500",
      "bg-rose-500",
      "bg-cyan-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} onError={() => setPlayingId(null)} />

      <div className="p-8 max-w-6xl mx-auto">
        {/* Tabs and Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "explore" ? "bg-gray-100 text-black" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Mic size={16} />
              Explore
            </button>
            <Link
              href="/voices/my-voices"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              My Voices
            </Link>
            <button
              onClick={() => setActiveTab("default")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "default" ? "bg-gray-100 text-black" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Default Voices
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">○ 0 / 3 slots used</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                  <Sparkles size={16} />
                  Create a Voice
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setInstantCloneOpen(true)} className="cursor-pointer">
                  <Mic2 className="mr-2 h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium">Instant Voice Clone</p>
                    <p className="text-xs text-muted-foreground">Clone from audio samples</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVoiceDesignOpen(true)} className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
                  <div>
                    <p className="font-medium">Design a Voice</p>
                    <p className="text-xs text-muted-foreground">Create from description</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => canUsePVC && setProfessionalCloneOpen(true)}
                  className={`cursor-pointer ${!canUsePVC ? "opacity-60" : ""}`}
                >
                  <Crown className="mr-2 h-4 w-4 text-amber-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Professional Clone</p>
                      {!canUsePVC && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">High-quality trained clone</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search library voices..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300"
            />
          </div>
          <button
            type="button"
            className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Folder size={18} className="text-gray-400" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">Filters</span>
          </button>
        </form>

        {/* Banner */}
        <div className="relative mb-8 p-6 bg-gray-900 rounded-2xl overflow-hidden">
          <button className="absolute top-3 right-3 text-gray-500 hover:text-white">
            <X size={16} />
          </button>
          <h3 className="text-white font-semibold text-lg mb-2">
            Legendary voices for your creative projects
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-full bg-gray-700 border-2 border-gray-900 overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800"></div>
                </div>
              ))}
            </div>
            <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
              Learn more
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <Icon size={16} className="text-gray-500" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Trending Voices */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-black">Trending voices</h2>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.voices.slice(0, 6).map((voice, i) => (
                <button
                  key={voice.voiceId}
                  onClick={() => handleUseVoice(voice)}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left"
                >
                  <div
                    className={`w-10 h-10 ${getVoiceColor(i)} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-white text-lg">🎭</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{voice.name}</h4>
                    <p className="text-xs text-gray-500">{voice.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Handpicked for your use case */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Handpicked for your use case</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {useCaseCards.map((card, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-[280px] h-[160px] ${card.bg} rounded-2xl p-5 flex flex-col justify-end relative overflow-hidden group cursor-pointer`}
              >
                <div className="flex items-end justify-between relative z-10">
                  <h3 className={`font-semibold ${card.textColor} max-w-[180px]`}>{card.title}</h3>
                  <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ChevronRight size={16} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice List */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-black">
              {activeTab === "default" ? "Default Voices" : "All Voices"}
            </h2>
            <span className="text-sm text-gray-500">({data.total})</span>
          </div>
          <div className="divide-y divide-gray-100">
            {data.voices.map((voice, i) => (
              <div
                key={voice.voiceId}
                className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-full ${getVoiceColor(i)} flex-shrink-0`}
                ></div>
                <div className="flex-1 min-w-0 grid grid-cols-[1fr_120px_100px_80px] gap-4 items-center">
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{voice.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{voice.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">{voice.category}</div>
                  <div className="text-xs text-gray-400">{voice.usageCount?.toLocaleString() || 0} uses</div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePlay(voice)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {playingId === voice.voiceId ? (
                        <Loader2 size={14} className="text-gray-500 animate-spin" />
                      ) : (
                        <Play size={14} className="text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSave(voice)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {savingId === voice.voiceId ? (
                        <Loader2 size={14} className="text-gray-500 animate-spin" />
                      ) : (
                        <Plus size={14} className="text-gray-500" />
                      )}
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                      <MoreHorizontal size={14} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchVoices(data.page - 1)}
                disabled={data.page <= 1 || loading}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={() => fetchVoices(data.page + 1)}
                disabled={data.page >= data.totalPages || loading}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Creation Dialogs */}
      <InstantCloneDialog
        open={instantCloneOpen}
        onOpenChange={setInstantCloneOpen}
        onSuccess={handleVoiceCreated}
      />
      <VoiceDesignDialog
        open={voiceDesignOpen}
        onOpenChange={setVoiceDesignOpen}
        onSuccess={handleVoiceCreated}
      />
      <ProfessionalCloneDialog
        open={professionalCloneOpen}
        onOpenChange={setProfessionalCloneOpen}
        onSuccess={handleVoiceCreated}
      />
    </div>
  );
}
