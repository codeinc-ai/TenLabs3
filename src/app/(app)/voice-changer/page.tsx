"use client";

import { useState } from "react";
import {
  Upload,
  Mic,
  Download,
  Trash2,
  X,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

/**
 * Voice Changer Page
 *
 * Allows users to upload audio and change the voice.
 * Features:
 * - Drag and drop upload zone
 * - Record audio option
 * - Settings panel with voice/model selection
 */
export default function VoiceChangerPage() {
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [removeNoise, setRemoveNoise] = useState(false);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Upload Zone */}
          <div className="w-full max-w-2xl">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center hover:border-gray-300 hover:bg-gray-50/50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-gray-200 transition-colors">
                <Upload size={24} className="text-gray-500" />
              </div>

              <h3 className="text-base font-medium text-gray-900 mb-2">
                Click to upload, or drag and drop
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Audio or video files up to 50MB each
              </p>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-gray-200"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="h-px w-12 bg-gray-200"></div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <Mic size={16} />
                Record audio
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="h-16 border-t border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
            <span>10,000 credits remaining</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">0:00 total duration</span>

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Trash2 size={18} />
              </button>
            </div>

            <button className="px-5 py-2.5 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
              Generate speech
            </button>
          </div>
        </div>
      </main>

      {/* Settings Panel */}
      <aside className="w-[380px] bg-white border-l border-gray-200 flex-col h-full overflow-y-auto flex-shrink-0 hidden lg:flex">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button className="py-4 mr-6 text-sm font-medium text-black border-b-2 border-black">
            Settings
          </button>
          <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-800">
            History
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Promo Banner */}
          <div className="relative p-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white overflow-hidden group cursor-pointer">
            <button className="absolute top-3 right-3 text-white/80 hover:text-white">
              <X size={16} />
            </button>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <div className="w-6 h-6 border-2 border-white rounded-sm" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Try Studio 3.0</h3>
                <p className="text-xs text-white/90 leading-relaxed">
                  Voiceovers, Eleven Music and SFX in one editor - now with
                  video support.
                </p>
              </div>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Voice</label>
            <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xs font-bold">
                  R
                </div>
                <span className="text-sm font-medium text-gray-900">Rachel</span>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-400 group-hover:text-gray-600"
              />
            </button>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Model</label>
            <button className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="px-1.5 py-0.5 rounded-full border border-black text-[10px] font-bold text-black">
                  V2
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Eleven Multilingual v2
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-400 group-hover:text-gray-600"
              />
            </button>
          </div>

          {/* Settings Sliders */}
          <div className="space-y-6">
            <SliderControl
              label="Stability"
              leftLabel="More variable"
              rightLabel="More stable"
              defaultValue={75}
            />
            <SliderControl
              label="Similarity"
              leftLabel="Low"
              rightLabel="High"
              defaultValue={90}
            />
            <SliderControl
              label="Style Exaggeration"
              leftLabel="None"
              rightLabel="Exaggerated"
              defaultValue={0}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black underline decoration-dotted underline-offset-4 decoration-gray-300 cursor-help">
                Remove Background Noise
              </span>
              <button
                onClick={() => setRemoveNoise(!removeNoise)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  removeNoise ? "bg-black" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    removeNoise ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">
                Speaker boost
              </span>
              <button
                onClick={() => setSpeakerBoost(!speakerBoost)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  speakerBoost ? "bg-black" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    speakerBoost ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset */}
          <div className="pt-4 flex justify-end">
            <button className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black transition-colors">
              <RotateCcw size={14} />
              Reset values
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SliderControl({
  label,
  leftLabel,
  rightLabel,
  defaultValue,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  defaultValue: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-black underline decoration-dotted underline-offset-4 decoration-gray-300 cursor-help">
          {label}
        </label>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="relative h-1.5 bg-gray-100 rounded-full group cursor-pointer">
        <div
          className="absolute h-full bg-black rounded-full"
          style={{ width: `${defaultValue}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-black rounded-full shadow-sm cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{
            left: `${defaultValue}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    </div>
  );
}
