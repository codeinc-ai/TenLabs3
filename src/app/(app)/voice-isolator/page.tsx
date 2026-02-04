"use client";

import {
  Search,
  Upload,
  Mic,
  Download,
  AudioWaveform,
  ArrowUp,
  Film,
} from "lucide-react";

const historyItems = [
  {
    name: "Podcast Interview - Clean Vocals",
    duration: "3m 5s",
    format: "mp3",
    type: "audio",
  },
  {
    name: "YouTube Tutorial - Remove Background",
    duration: "4m 2s",
    format: "mp4",
    type: "video",
  },
  {
    name: "Lecture Recording - Speaker Only",
    duration: "5m 17s",
    format: "mp3",
    type: "audio",
  },
  {
    name: "Music Track - Vocals Only",
    duration: "3m 21s",
    format: "wav",
    type: "audio",
  },
  {
    name: "Zoom Call - Isolated Voice",
    duration: "2m 34s",
    format: "mp3",
    type: "audio",
  },
];

/**
 * Voice Isolator Page
 *
 * Remove background noise and isolate voices from audio/video.
 */
export default function VoiceIsolatorPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-bold text-black mb-8">Voice Isolator</h1>

        {/* Drop Zone */}
        <div className="mb-6">
          <div className="h-[180px] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-gray-300 hover:bg-gray-100/50 transition-colors cursor-pointer group">
            <span className="text-gray-400 group-hover:text-gray-500 transition-colors">
              Drop files here
            </span>
          </div>

          {/* Upload Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Upload size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Mic size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                0 credits / 60,000 credits
              </span>
              <button className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                <ArrowUp size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search history"
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_80px_50px] gap-4 px-4 py-3 text-xs font-medium text-gray-500">
          <div>Name</div>
          <div className="text-right">Duration</div>
          <div className="text-right">Format</div>
          <div></div>
        </div>

        {/* History List */}
        <div className="divide-y divide-gray-100">
          {historyItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_100px_80px_50px] gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors group"
              style={{ opacity: 1 - index * 0.15 }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.type === "video" ? (
                    <Film size={18} className="text-gray-400" />
                  ) : (
                    <AudioWaveform size={18} className="text-gray-400" />
                  )}
                </div>
                <span className="text-sm text-gray-900 truncate">
                  {item.name}
                </span>
              </div>

              <div className="text-right text-sm text-gray-500">
                {item.duration}
              </div>

              <div className="text-right text-sm text-gray-500">
                {item.format}
              </div>

              <div className="flex justify-end">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
