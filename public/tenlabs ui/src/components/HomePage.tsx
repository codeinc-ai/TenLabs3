import React from 'react';
import {
  Home as HomeIcon,
  MessageSquare,
  Bell,
  ChevronRight,
  Moon,
  Mic,
  BookOpen,
  Image as ImageIcon,
  Bot,
  Music,
  Languages,
  Play,
  Plus,
  Library,
  Sparkles,
  CheckCircle2 } from
'lucide-react';
export function HomePage() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-y-auto">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3 text-black">
          <HomeIcon size={20} className="text-gray-500" />
          <h1 className="font-medium">Home</h1>
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

      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* Banner */}
        <div className="flex items-center justify-between mb-12">
          <button className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-gray-200 hover:border-gray-300 transition-colors group">
            <span className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded-full">
              New
            </span>
            <span className="text-sm font-medium text-gray-700">
              Introducing the Eleven Album
            </span>
            <ChevronRight
              size={14}
              className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />

          </button>
          <button className="text-gray-400 hover:text-black transition-colors">
            <Moon size={20} />
          </button>
        </div>

        {/* Greeting */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              CodeINC's Workspace
            </div>
            <h2 className="text-3xl font-bold text-black">Good morning, Kim</h2>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white"></div>
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                C
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              Talk to EI
            </span>
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-6 gap-4 mb-16">
          <FeatureCard
            icon={<Mic size={24} className="text-blue-500" />}
            label="Instant speech"
            badge={
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full"></div>
            } />

          <FeatureCard
            icon={<BookOpen size={24} className="text-orange-500" />}
            label="Audiobook"
            badge={
            <div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full"></div>
            } />

          <FeatureCard
            icon={<ImageIcon size={24} className="text-green-500" />}
            label="Image & Video" />

          <FeatureCard
            icon={<Bot size={24} className="text-purple-500" />}
            label="Tenlabs Agents"
            badge={
            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full"></div>
            } />

          <FeatureCard
            icon={<Music size={24} className="text-amber-500" />}
            label="Music" />

          <FeatureCard
            icon={<Languages size={24} className="text-teal-500" />}
            label="Dubbed video"
            badge={
            <div className="absolute top-2 right-2 w-2 h-2 bg-teal-400 rounded-full"></div>
            } />

        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Latest from library */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-6">
              Latest from the library
            </h3>
            <div className="space-y-6">
              <LibraryItem
                name="Joe Inglewood - Magnetic and Captivating"
                description="Joe Inglewood - A velvety smooth middle age American Voice which is..."
                color="from-orange-400 to-red-500" />

              <LibraryItem
                name="David - Movie Trailer Narrator"
                description="David - Epic Movie Trailer - Middle aged Male with a deep voice. Suitable fo..."
                color="from-pink-500 to-rose-500" />

              <LibraryItem
                name="Archie - Social Media Narrator"
                description="Archie - English teen youth - A young British English male voice; warm, dee..."
                color="from-green-400 to-emerald-600" />

              <LibraryItem
                name="David Boles - Well-spoken and Calm"
                description="David Boles - David Boles host of the Human Meme podcast."
                color="from-red-400 to-orange-500" />

              <LibraryItem
                name="Hope - Clear, Relatable and Charismatic"
                description="Hope - The podcaster - A clear, relatable, and conversational voice—easy t..."
                color="from-pink-400 to-purple-500" />

            </div>
            <button className="mt-8 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Explore Library
            </button>
          </div>

          {/* Right: Create or clone a voice */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-6">
              Create or clone a voice
            </h3>
            <div className="space-y-4">
              <CreateCard
                icon={
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                }
                title="Voice Design"
                description="Design an entirely new voice from a text prompt" />

              <CreateCard
                icon={
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                    <Plus size={20} />
                  </div>
                }
                title="Clone your Voice"
                description="Create a realistic digital clone of your voice" />

              <CreateCard
                icon={
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <Library size={20} />
                  </div>
                }
                title="Voice Collections"
                description="Curated AI voices for every use case" />

            </div>
          </div>
        </div>
      </div>
    </main>);

}
function FeatureCard({
  icon,
  label,
  badge




}: {icon: React.ReactNode;label: string;badge?: React.ReactNode;}) {
  return (
    <button className="flex flex-col items-center gap-4 group">
      <div className="relative w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        {badge}
      </div>
      <span className="text-sm font-medium text-black">{label}</span>
    </button>);

}
function LibraryItem({
  name,
  description,
  color




}: {name: string;description: string;color: string;}) {
  return (
    <div className="flex gap-4 group cursor-pointer">
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex-shrink-0 border-2 border-white shadow-sm group-hover:scale-105 transition-transform`}>

        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
          <CheckCircle2 size={10} className="text-white fill-current" />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
          {name}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-1">{description}</p>
      </div>
    </div>);

}
function CreateCard({
  icon,
  title,
  description




}: {icon: React.ReactNode;title: string;description: string;}) {
  return (
    <button className="w-full p-4 bg-gray-50 rounded-2xl flex items-center gap-4 hover:bg-gray-100 transition-colors text-left group">
      <div className="group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>);

}