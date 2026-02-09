"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Upload,
  Plus,
  BookOpen,
  Podcast,
  Link as LinkIcon,
  FileText,
  Video,
  Music,
  Captions,
  Volume2,
  Wand2,
  LayoutGrid,
  List,
  Radio,
} from "lucide-react";

const audioTools = [
  {
    title: "New audiobook",
    description: "Start from scratch, or import files",
    color: "bg-emerald-500",
    icon: BookOpen,
  },
  {
    title: "Create a podcast",
    description: "Auto-generate a podcast from docs or URLs",
    color: "bg-teal-500",
    icon: Podcast,
  },
  {
    title: "URL to audio",
    description: "Create a voiceover from any webpage",
    color: "bg-purple-500",
    icon: LinkIcon,
  },
  {
    title: "AI Script Generator",
    description: "Generate a script from a prompt",
    color: "bg-blue-500",
    icon: FileText,
  },
];

const videoTools = [
  {
    title: "New video voiceover",
    description: "Add speech to your videos",
    color: "bg-orange-400",
    icon: Video,
  },
  {
    title: "Add SFX and music",
    description: "Add voiceovers, music, and sound effects",
    color: "bg-pink-500",
    icon: Music,
  },
  {
    title: "Add captions",
    description: "Automatic captions for your video",
    color: "bg-violet-500",
    icon: Captions,
  },
  {
    title: "Remove background noise",
    description: "Clean up noisy videos",
    color: "bg-red-400",
    icon: Volume2,
  },
  {
    title: "Fix voiceover mistakes",
    description: "Use speech correction to fix mistakes",
    color: "bg-rose-400",
    icon: Wand2,
  },
  {
    title: "AI Soundtrack Generator",
    description: "Auto-generate music for your video",
    color: "bg-purple-400",
    icon: Music,
  },
];

const recentProjects = [
  {
    title: "How To Incorporate AI Sound Effect Generators in Game ...",
    created: "2 hours ago",
    owner: "Owner",
  },
  {
    title: "How to Use ElevenLabs' Voice Changer",
    created: "3 hours ago",
    owner: "Owner",
  },
  {
    title: "A Definitive Guide To Video Game Dubbing",
    created: "6 hours ago",
    owner: "Owner",
  },
];

/**
 * Studio Page
 *
 * Create audiobooks, podcasts, video voiceovers, and more.
 */
interface AudioNativeProject {
  _id: string;
  name: string;
  title?: string;
  author?: string;
  status: "processing" | "ready";
  createdAt: string;
}

export default function StudioPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [audioNativeProjects, setAudioNativeProjects] = useState<AudioNativeProject[]>([]);
  const [audioNativeLoading, setAudioNativeLoading] = useState(true);

  useEffect(() => {
    async function fetchAudioNativeProjects() {
      try {
        const res = await fetch("/api/audio-native");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAudioNativeProjects(json.data);
        }
      } catch {
        // keep empty array
      } finally {
        setAudioNativeLoading(false);
      }
    }
    fetchAudioNativeProjects();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Title and Actions */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-black dark:text-white">Studio</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg transition-colors">
              <Upload size={16} />
              Upload
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 rounded-lg transition-colors">
              <Plus size={16} />
              New blank project
            </button>
          </div>
        </div>

        {/* Audio Section */}
        <div className="mb-10">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Audio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audioTools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </div>
        </div>

        {/* Video Section */}
        <div className="mb-10">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Video</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoTools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </div>
        </div>

        {/* Audio Native Section */}
        {!audioNativeLoading && audioNativeProjects.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Audio Native
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audioNativeProjects.map((project) => (
                <Link
                  key={project._id}
                  href={`/audio-native/${project._id}`}
                  className="text-left group block"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-[#1a1a1a] rounded-xl mb-3 overflow-hidden group-hover:bg-gray-200 dark:group-hover:bg-[#252525] transition-colors">
                    <div className="w-full h-full flex items-center justify-center">
                      <Radio size={32} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-black dark:group-hover:text-gray-200">
                      {project.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        project.status === "ready"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          project.status === "ready" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      />
                      {project.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {project.author && <>{project.author} · </>}
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects Section */}
        <div>
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">
            Recent Projects
          </h2>

          {/* Search and View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-gray-300 dark:focus:border-[#444] focus:ring-1 focus:ring-gray-200 dark:focus:ring-0"
              />
            </div>
            <div className="flex border border-gray-200 dark:border-[#333] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project, index) => (
              <ProjectCard key={index} {...project} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCard({
  title,
  description,
  color,
  icon: Icon,
}: {
  title: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <button className="flex items-center gap-4 p-4 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl hover:border-gray-300 dark:hover:border-[#444] hover:shadow-sm dark:hover:shadow-none transition-all text-left group">
      <div
        className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
      >
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
      </div>
    </button>
  );
}

function ProjectCard({
  title,
  created,
  owner,
}: {
  title: string;
  created: string;
  owner: string;
}) {
  return (
    <button className="text-left group">
      <div className="aspect-video bg-gray-100 dark:bg-[#1a1a1a] rounded-xl mb-3 overflow-hidden group-hover:bg-gray-200 dark:group-hover:bg-[#252525] transition-colors">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-2/3 h-2/3 bg-gray-200 dark:bg-[#252525] rounded-lg group-hover:bg-gray-300 dark:group-hover:bg-[#333] transition-colors"></div>
        </div>
      </div>
      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate mb-1 group-hover:text-black dark:group-hover:text-gray-200">
        {title}
      </h3>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Created {created} · {owner}
      </p>
    </button>
  );
}
