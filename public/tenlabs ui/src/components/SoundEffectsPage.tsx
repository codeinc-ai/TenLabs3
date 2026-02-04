import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  Bell,
  ChevronRight,
  Search,
  ChevronDown,
  Play,
  Share2,
  Download,
  Zap,
  Infinity,
  Clock,
  Send,
  Smile,
  Dog,
  Music,
  Bomb,
  Wind,
  Disc,
  Settings,
  ArrowUp } from
'lucide-react';
const categories = [
{
  name: 'Animals',
  color: 'from-orange-400 to-red-500',
  icon: Dog
},
{
  name: 'Bass',
  color: 'from-red-500 to-orange-600',
  icon: Music
},
{
  name: 'Booms',
  color: 'from-amber-500 to-orange-500',
  icon: Bomb
},
{
  name: 'Braams',
  color: 'from-orange-400 to-amber-500',
  icon: Wind
},
{
  name: 'Brass',
  color: 'from-yellow-400 to-orange-400',
  icon: Sparkles
},
{
  name: 'Cymbals',
  color: 'from-amber-400 to-yellow-500',
  icon: Disc
},
{
  name: 'Devices',
  color: 'from-orange-500 to-red-400',
  icon: Settings
}];

const soundEffects = [
{
  description:
  'The sound of a knight in medieval Fullplate armor walking on the floor with a swor...',
  category: 'Foley',
  subcategory: 'Prop',
  duration: '4s',
  downloads: 482,
  looping: false
},
{
  description:
  'Empty office ventilation system, HVAC air hiss, flickering fluorescent light buzz,...',
  category: 'Ambience',
  subcategory: 'Office',
  duration: '30s',
  downloads: 332,
  looping: true
},
{
  description:
  'A realistic soundscape of a person slowly walking through a cold, abandoned...',
  category: 'Ambience',
  subcategory: 'Underground',
  duration: '10.1s',
  downloads: 672,
  looping: false
},
{
  description: 'Epic dark background music...',
  category: 'Gore',
  subcategory: '',
  duration: '8s',
  downloads: 585,
  looping: false
},
{
  description: 'big explosion',
  category: 'Designed',
  subcategory: 'Boom',
  duration: '3s',
  downloads: 95,
  looping: false
}];

export function SoundEffectsPage() {
  const [activeTab, setActiveTab] = useState('explore');
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2 text-black">
          <Sparkles size={20} className="text-gray-500" />
          <span className="font-medium">Sound Effects</span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-600">Explore</span>
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
        <div className="p-8 max-w-7xl mx-auto">
          {/* Title and Tabs */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-black mb-6">
              Sound Effects
            </h1>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'explore' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>

                  Explore
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>

                  History
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'favorites' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>

                  Favorites
                </button>
              </div>

              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-black transition-colors">
                <Smile size={16} />
                Soundboard
              </button>
            </div>
          </div>

          {/* Category Cards */}
          <div className="relative mb-8">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat) =>
              <button
                key={cat.name}
                className="flex-shrink-0 w-[140px] h-[120px] rounded-2xl overflow-hidden relative group">

                  <div
                  className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`}>
                </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                    <cat.icon size={16} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                </button>
              )}
            </div>
            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search sound effects..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200" />

            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Trending
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mb-6">
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Looping
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <span>+</span> Duration
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <div>Description</div>
            <div className="text-right">Duration</div>
            <div className="text-right">Downloads</div>
            <div></div>
          </div>

          {/* Sound Effects List */}
          <div className="divide-y divide-gray-100">
            {soundEffects.slice(0, 1).map((sound, index) =>
            <SoundRow key={index} sound={sound} />
            )}

            {/* Upgrade Banner */}
            <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl my-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Zap size={20} className="text-white fill-white" />
                </div>
                <span className="font-medium text-gray-900">
                  Upgrade your plan to download sound effects
                </span>
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Upgrade plan
              </button>
            </div>

            {soundEffects.slice(1).map((sound, index) =>
            <SoundRow key={index + 1} sound={sound} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Input Bar */}
      <div className="border-t border-gray-100 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Describe a sound..."
              className="w-full pl-4 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white transition-colors" />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors">
                <ArrowUp size={18} className="text-white" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors">
                <Infinity size={14} />
                Off
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors">
                <Clock size={14} />
                Auto
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors">
                <Clock size={14} />
                30%
              </button>
            </div>
            <span className="text-xs text-gray-400">
              200 credits / 10,000 credits
            </span>
          </div>
        </div>
      </div>
    </main>);

}
function SoundRow({ sound }: {sound: (typeof soundEffects)[0];}) {
  return (
    <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-4 min-w-0">
        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
          <Play size={16} className="text-gray-600 ml-0.5" />
        </button>
        <div className="min-w-0">
          <p className="text-sm text-gray-900 truncate">{sound.description}</p>
          <p className="text-xs text-gray-500">
            {sound.category}
            {sound.subcategory &&
            <>
                <span className="mx-1">›</span>
                {sound.subcategory}
              </>
            }
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {/* Waveform placeholder */}
        <div className="w-16 h-6 flex items-center gap-px">
          {[...Array(20)].map((_, i) =>
          <div
            key={i}
            className="w-0.5 bg-gray-300 rounded-full"
            style={{
              height: `${Math.random() * 100}%`
            }} />

          )}
        </div>
        <span className="text-sm text-gray-600">{sound.duration}</span>
        {sound.looping && <Infinity size={14} className="text-gray-400" />}
      </div>

      <div className="text-right text-sm text-gray-600">{sound.downloads}</div>

      <div className="flex items-center justify-end gap-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Share2 size={16} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Download size={16} />
        </button>
      </div>
    </div>);

}