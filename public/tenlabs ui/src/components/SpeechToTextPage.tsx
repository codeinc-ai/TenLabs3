import React from 'react';
import {
  Keyboard,
  MessageSquare,
  Bell,
  Search,
  FileText,
  MoreHorizontal } from
'lucide-react';
const transcripts = [
{
  title: 'Product Launch Presentation',
  createdAt: '2 hours ago'
},
{
  title: 'Quarterly Business Review Meeting',
  createdAt: '5 hours ago'
},
{
  title: 'Customer Interview Session',
  createdAt: 'yesterday'
},
{
  title: 'Podcast Episode 42: Future of AI',
  createdAt: '3 days ago'
},
{
  title: 'Team Training Workshop',
  createdAt: 'last week'
}];

export function SpeechToTextPage() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 text-black">
          <Keyboard size={20} className="text-gray-500" />
          <h1 className="font-medium">Speech to text</h1>
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
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-black">Speech to text</h1>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
              <FileText size={16} />
              Transcribe files
            </button>
          </div>

          <p className="text-gray-600 mb-8">
            Transcribe audio and video files with our{' '}
            <span className="underline underline-offset-2 cursor-pointer hover:text-black">
              industry-leading ASR model
            </span>
            .
          </p>

          {/* Promo Banner */}
          <div className="flex items-center gap-6 p-4 bg-white border border-gray-200 rounded-xl mb-8 hover:border-gray-300 transition-colors">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-600 via-emerald-700 to-amber-600 flex items-center justify-center">
              <div className="text-[8px] text-white font-medium text-center leading-tight px-1">
                <span className="opacity-80">IIScribe v2</span>
                <br />
                <span className="text-[10px] font-semibold">Realtime</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">
                Try Scribe Realtime v2
              </h3>
              <p className="text-sm text-gray-500">
                Experience lightning fast transcription with unmatched accuracy,
                across 92 languages.
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0">
              Try the demo
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search transcripts..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200" />

          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1fr_150px_50px] gap-4 px-4 py-3 text-xs font-medium text-gray-500">
            <div>Title</div>
            <div>Created at</div>
            <div></div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {transcripts.map((transcript, index) =>
            <div
              key={index}
              className="grid grid-cols-[1fr_150px_50px] gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors group"
              style={{
                opacity: 1 - index * 0.15
              }}>

                <div className="text-sm text-gray-900">{transcript.title}</div>
                <div className="text-sm text-gray-500">
                  {transcript.createdAt}
                </div>
                <div className="flex justify-end">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>);

}