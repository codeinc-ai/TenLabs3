import React from 'react';
import {
  Video,
  MessageSquare,
  Bell,
  BookOpen,
  Plus,
  ChevronRight,
  Share2,
  Film,
  FileText,
  Captions,
  Languages,
  BookOpenCheck } from
'lucide-react';
const services = [
{
  title: 'Dub',
  readyIn: 'Ready in 7 days',
  description: '.MP4 and .WAV renders',
  color: 'bg-red-400',
  icon: Film
},
{
  title: 'Transcript',
  readyIn: 'Ready in 2 days',
  description: 'Multiple export options',
  color: 'bg-blue-500',
  icon: FileText
},
{
  title: 'Captions',
  readyIn: 'Ready in 3 days',
  description: '.SRT and .VTT exports',
  color: 'bg-pink-500',
  icon: Captions
},
{
  title: 'Translated subtitles',
  readyIn: 'Ready in 3 days',
  description: '.SRT and .VTT exports',
  color: 'bg-rose-500',
  icon: Languages
},
{
  title: 'Audiobook',
  readyIn: 'Ready in 3 weeks',
  description: '.WAV and .MP3 exports',
  color: 'bg-orange-500',
  icon: BookOpenCheck
}];

export function ProductionsPage() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 text-black">
          <Video size={20} className="text-gray-500" />
          <h1 className="font-medium">Productions</h1>
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
        <div className="p-8 max-w-6xl mx-auto">
          {/* Title and Actions */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-black">Productions</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
                <BookOpen size={16} />
                How it works
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
                <Plus size={16} />
                New order
              </button>
            </div>
          </div>

          {/* Service Cards */}
          <div className="relative mb-10">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {services.map((service, index) =>
              <div
                key={index}
                className="flex-shrink-0 w-[200px] p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group">

                  <div
                  className={`w-10 h-10 ${service.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>

                    <service.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-0.5">
                    {service.readyIn}
                  </p>
                  <p className="text-xs text-gray-400">{service.description}</p>
                </div>
              )}
            </div>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Items Section */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-lg font-semibold text-black">0 items</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              <Plus size={14} />
              New folder
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-6">
                <Share2 size={24} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-black mb-2">
                Order human-edited transcripts, captions, subtitles, and dubs
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Move existing Productions here or order a new one below
              </p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white border border-gray-200 rounded-lg transition-colors bg-white">
                  <BookOpen size={16} />
                  How it works
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
                  <Plus size={16} />
                  New Production
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>);

}