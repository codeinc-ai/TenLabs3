import React from 'react';
import {
  Wand2,
  MessageSquare,
  Bell,
  Upload,
  Mic,
  Download,
  Trash2 } from
'lucide-react';
export function VoiceChangerPage() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 text-black">
          <Wand2 size={20} className="text-gray-500" />
          <h1 className="font-medium">Voice Changer</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            Feedback
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            Docs
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageSquare size={16} />
            Talk to EI
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <button className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-medium">
            C
          </button>
        </div>
      </header>

      {/* Main Content */}
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
    </main>);

}