import React from 'react';
import {
  FileText,
  MessageSquare,
  BookOpen,
  Bell,
  User,
  Book,
  Smile,
  Mic,
  Languages,
  Clapperboard,
  Gamepad2,
  Radio,
  Flower } from
'lucide-react';
export function TextEditor() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 text-black">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
            <FileText size={16} className="text-gray-600" />
          </div>
          <h1 className="font-medium">Text to Speech</h1>
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

      {/* Editor Area */}
      <div className="flex-1 p-8 relative flex flex-col">
        <textarea
          className="w-full flex-1 resize-none outline-none text-lg text-gray-800 placeholder:text-gray-400 font-light leading-relaxed"
          placeholder="Start typing here or paste any text you want to turn into lifelike speech..." />


        {/* Suggestions / Quick Starts */}
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">Get started with</p>
          <div className="flex flex-wrap gap-3">
            <SuggestionChip icon={<Book size={16} />} label="Narrate a story" />
            <SuggestionChip
              icon={<Smile size={16} />}
              label="Tell a silly joke" />

            <SuggestionChip
              icon={<Mic size={16} />}
              label="Record an advertisement" />

            <SuggestionChip
              icon={<Languages size={16} />}
              label="Speak in different languages" />

            <SuggestionChip
              icon={<Clapperboard size={16} />}
              label="Direct a dramatic movie scene" />

            <SuggestionChip
              icon={<Gamepad2 size={16} />}
              label="Hear from a video game character" />

            <SuggestionChip
              icon={<Radio size={16} />}
              label="Introduce your podcast" />

            <SuggestionChip
              icon={<Flower size={16} />}
              label="Guide a meditation class" />

          </div>
        </div>
      </div>
    </main>);

}
function SuggestionChip({
  icon,
  label



}: {icon: React.ReactNode;label: string;}) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all">
      <span className="text-gray-500">{icon}</span>
      <span>{label}</span>
    </button>);

}