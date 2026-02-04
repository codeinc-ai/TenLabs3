import React, { useState } from 'react';
import {
  Mic,
  MessageSquare,
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  ArrowUpDown,
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
  Bookmark,
  Copy,
  AlertCircle } from
'lucide-react';
const categories = [
{
  icon: MessageCircle,
  label: 'Conversational'
},
{
  icon: Play,
  label: 'Narration'
},
{
  icon: Users,
  label: 'Characters'
},
{
  icon: Smartphone,
  label: 'Social Media'
},
{
  icon: GraduationCap,
  label: 'Educational'
},
{
  icon: Megaphone,
  label: 'Advertisement'
}];

const trendingVoices = [
{
  name: 'Adam',
  category: 'Narration',
  language: 'English',
  extra: '+8',
  color: 'bg-blue-500'
},
{
  name: 'Hale - Smooth, Confident and Persu...',
  category: 'Advertisement',
  language: 'English',
  extra: '+15',
  color: 'bg-emerald-500'
},
{
  name: 'Ava – Eager, Helpful and Understand...',
  category: 'Conversational',
  language: 'English',
  extra: '',
  color: 'bg-orange-400'
},
{
  name: 'Quentin - Narrator and Educator',
  category: 'Educational',
  language: 'English',
  extra: '+11',
  color: 'bg-blue-500'
},
{
  name: 'Ana Rita - Smooth, Expressive and B...',
  category: 'Narration',
  language: 'English',
  extra: '+17',
  color: 'bg-emerald-500'
},
{
  name: 'Amelia - Enthusiastic and Expressive',
  category: 'Narration',
  language: 'English',
  extra: '+10',
  color: 'bg-purple-500'
}];

const useCaseCards = [
{
  title: 'Best voices for Eleven v3',
  bg: 'bg-gray-900',
  text: 'V3',
  textColor: 'text-gray-600'
},
{
  title: 'Popular Tiktok voices',
  bg: 'bg-pink-500',
  icon: '♪',
  textColor: 'text-white'
},
{
  title: 'Studio-Quality Conversational Voices',
  bg: 'bg-gray-800',
  textColor: 'text-white'
},
{
  title: 'Engaging Characters for Video Games',
  bg: 'bg-emerald-700',
  textColor: 'text-white'
}];

const spotlightVoices = [
{
  name: 'Xavier - Dominating, Metalic Announcer',
  description: 'Gaming – Unreal Tonemanagement 2003 - The...',
  language: 'English',
  extra: '+8',
  accent: 'American',
  category: 'Characters',
  age: '2y',
  uses: '41.7K'
},
{
  name: 'Jessica Anne Bogart - Eloquent Villain',
  description: 'Jessica Anne Bogart - Character and Animation -...',
  language: 'English',
  extra: '+16',
  accent: 'American',
  category: 'Characters',
  age: '2y',
  uses: '113.1K'
},
{
  name: 'Matthew Schmitz - Hissing and Sinister',
  description: 'Matthew Schmitz - Reptilian Argonian Monster -...',
  language: 'English',
  extra: '+5',
  accent: 'Arabic',
  category: 'Characters',
  age: '2y',
  uses: '11.9K'
},
{
  name: 'Maria Mysh',
  description: 'A soft, clear voice with a smooth timbre, calm but...',
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Conversational',
  age: '2y',
  uses: '1.3K'
},
{
  name: 'Dante - Growly and Menacing Monster',
  description: 'Ancient Monster - Evil & Scary - A deep, menacing...',
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Characters',
  age: '2y',
  uses: '12.2K'
},
{
  name: 'Toby - Little Mythical Monster',
  description: 'Creature - Goblin Mythical Monster - A goblin...',
  language: 'English',
  extra: '+5',
  accent: 'American',
  category: 'Characters',
  age: '2y',
  uses: '8.3K'
}];

const languageCollections = [
{
  language: 'Arabic',
  subtitle: 'Top picks',
  bg: 'bg-gray-800',
  text: 'أصوات'
},
{
  language: 'Bulgarian',
  subtitle: 'Top picks',
  bg: 'bg-rose-400',
  text: 'гласове'
},
{
  language: 'Chinese',
  subtitle: 'Top picks',
  bg: 'bg-gray-900',
  text: '声音'
},
{
  language: 'Czech',
  subtitle: 'Top picks',
  bg: 'bg-gray-700',
  text: 'hlasy'
}];

const poeticVoices = [
{
  name: 'Leoni Vergara - Soothing and Eloquent',
  description: 'Leoni Vergara - International Cosmopolitan and...',
  language: 'English',
  extra: '+14',
  accent: 'Spanish',
  category: 'Conversational',
  age: '2y',
  uses: '10.8K'
},
{
  name: 'Ralf Eisend - Deep and Gravely',
  description: 'Ralf Eisend - An international audio book speaker...',
  language: 'English',
  extra: '',
  accent: 'German',
  category: 'Narration',
  age: '90d',
  uses: '20.1K'
},
{
  name: 'Seer Morganna - Intimidating, and Clear',
  description: 'Seer Morganna - The voice of an old wise seer...',
  language: 'English',
  extra: '+13',
  accent: '',
  category: 'Characters',
  age: '2y',
  uses: '19K'
},
{
  name: 'Kitten Kaley Rose',
  description: "This woman's voice—cool, passionate, confident,...",
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Narration',
  age: '90d',
  uses: '2.3K'
},
{
  name: 'Jen - Soothing Gentle Thoughtful Melancholy',
  description: 'A calm, somber, thoughtful, reflective, velvety,...',
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Narration',
  age: '2y',
  uses: ''
}];

const defaultVoices = [
{
  name: 'Bella - Professional, Bright, Warm',
  description: 'This voice is warm, bright, and professional,...',
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Educational',
  color: 'bg-blue-500'
},
{
  name: 'Roger - Laid-Back, Casual, Resonant',
  description: 'Easy going and perfect for casual conversations.',
  language: 'English',
  extra: '+4',
  accent: 'American',
  category: 'Conversational',
  color: 'bg-emerald-500'
},
{
  name: 'Sarah - Mature, Reassuring, Confident',
  description: 'Young adult woman with a confident and warm,...',
  language: 'English',
  extra: '+5',
  accent: 'American',
  category: 'Entertainment',
  color: 'bg-pink-500'
},
{
  name: 'Laura - Enthusiast, Quirky Attitude',
  description: 'This young adult female voice delivers sunny...',
  language: 'English',
  extra: '+4',
  accent: 'American',
  category: 'Social Media',
  color: 'bg-purple-500'
},
{
  name: 'Charlie - Deep, Confident, Energetic',
  description: 'A young Australian male with a confident and...',
  language: 'English',
  extra: '+4',
  accent: 'Australian',
  category: 'Conversational',
  color: 'bg-orange-500'
},
{
  name: 'George - Warm, Captivating Storyteller',
  description: 'Warm resonance that instantly captivates listeners.',
  language: 'English',
  extra: '+7',
  accent: 'British',
  category: 'Narration',
  color: 'bg-blue-600'
},
{
  name: 'Callum - Husky Trickster',
  description: 'Deceptively gravelly, yet unsettling edge.',
  language: 'English',
  extra: '+2',
  accent: 'American',
  category: 'Characters',
  color: 'bg-teal-500'
},
{
  name: 'River - Relaxed, Neutral, Informative',
  description: 'A relaxed, neutral voice ready for narrations or...',
  language: 'English',
  extra: '+4',
  accent: 'American',
  category: 'Conversational',
  color: 'bg-indigo-500'
},
{
  name: 'Harry - Fierce Warrior',
  description: 'An animated warrior ready to charge forward.',
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Characters',
  color: 'bg-red-500'
},
{
  name: 'Liam - Energetic, Social Media Creator',
  description: 'A young adult with energy and warmth - suitable fo...',
  language: 'English',
  extra: '+6',
  accent: 'American',
  category: 'Social Media',
  color: 'bg-cyan-500'
},
{
  name: 'Alice - Clear, Engaging Educator',
  description: 'Clear and engaging, friendly woman with a British...',
  language: 'English',
  extra: '+6',
  accent: 'British',
  category: 'Educational',
  color: 'bg-rose-500'
},
{
  name: 'Matilda - Knowledgable, Professional',
  description: 'A professional woman with a pleasing alto pitch....',
  language: 'English',
  extra: '+5',
  accent: 'American',
  category: 'Educational',
  color: 'bg-violet-500'
},
{
  name: 'Will - Relaxed Optimist',
  description: 'Conversational and laid back.',
  language: 'English',
  extra: '+9',
  accent: 'American',
  category: 'Conversational',
  color: 'bg-amber-500'
}];

export function VoicesPage() {
  const [activeTab, setActiveTab] = useState('explore');
  const getTabLabel = () => {
    switch (activeTab) {
      case 'my-voices':
        return 'My Voices';
      case 'default':
        return 'Default Voices';
      default:
        return 'Explore';
    }
  };
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'my-voices':
        return 'Search My Voices...';
      case 'default':
        return 'Search Default Voices...';
      default:
        return 'Search library voices...';
    }
  };
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2 text-black">
          <Mic size={20} className="text-gray-500" />
          <span className="font-medium">Voices</span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-gray-500">{getTabLabel()}</span>
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
          {/* Tabs and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('explore')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'explore' ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}>

                <Mic size={16} />
                Explore
              </button>
              <button
                onClick={() => setActiveTab('my-voices')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'my-voices' ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}>

                My Voices
              </button>
              <div className="relative group">
                <button
                  onClick={() => setActiveTab('default')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'default' ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}>

                  Default Voices
                </button>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg max-w-[200px] text-center">
                    ElevenLabs original voices available for everyone without
                    the need to use your voice slots
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">○ 0 / 3 slots used</span>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                <Sparkles size={16} />
                Create a Voice
              </button>
            </div>
          </div>

          {/* Search - varies by tab */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300" />

            </div>
            {activeTab === 'explore' &&
            <>
                <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Folder size={18} className="text-gray-400" />
                </button>
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-600">Filters</span>
                </button>
              </>
            }
            <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <ArrowUpDown size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Tab-specific content */}
          {activeTab === 'explore' && <ExploreContent />}
          {activeTab === 'my-voices' && <MyVoicesContent />}
          {activeTab === 'default' && <DefaultVoicesContent />}
        </div>
      </div>
    </main>);

}
function MyVoicesContent() {
  return (
    <>
      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6">
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
          <Bookmark size={14} />
          Collections
          <ChevronRight size={14} className="rotate-90" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
          Created by
          <ChevronRight size={14} className="rotate-90" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
          Type
          <ChevronRight size={14} className="rotate-90" />
        </button>
      </div>

      {/* Section Title */}
      <h2 className="text-lg font-semibold text-black mb-8">My Voices</h2>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-4 relative">
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <div className="w-6 h-6 border-t-2 border-l-2 border-gray-300 rounded-tl-full"></div>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <AlertCircle size={16} className="text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No voice found
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Add some from library
          <br />
          or create a new voice
        </p>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Plus size={16} />
          Create a voice
        </button>
      </div>
    </>);

}
function DefaultVoicesContent() {
  return (
    <>
      {/* Section Title */}
      <h2 className="text-lg font-semibold text-black mb-6">Default Voices</h2>

      {/* Voice List */}
      <div className="divide-y divide-gray-100">
        {defaultVoices.map((voice, i) =>
        <div
          key={i}
          className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors group">

            <div
            className={`w-10 h-10 ${voice.color} rounded-full flex items-center justify-center flex-shrink-0`}>

              <span className="text-white text-xs font-bold">II</span>
            </div>
            <div className="flex-1 min-w-0 grid grid-cols-[1fr_140px_120px_80px] gap-4 items-center">
              <div className="min-w-0">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {voice.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {voice.description}
                </p>
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1">
                  <span>🇺🇸</span>
                  <span className="text-gray-600">{voice.language}</span>
                  {voice.extra &&
                <span className="text-gray-400">{voice.extra}</span>
                }
                </div>
                <div className="text-gray-400">{voice.accent}</div>
              </div>
              <div className="text-xs text-gray-500">{voice.category}</div>
              <div className="flex items-center gap-2 justify-end">
                <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Copy size={14} className="text-gray-500" />
                </button>
                <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={14} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>);

}
function ExploreContent() {
  return (
    <>
      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 whitespace-nowrap">
          <span>🌐</span> Language
          <ChevronRight size={14} className="rotate-90" />
        </button>
        <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-400 whitespace-nowrap">
          Accent
          <ChevronRight size={14} className="rotate-90 inline ml-1" />
        </button>
        {categories.map((cat, i) =>
        <button
          key={i}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 whitespace-nowrap">

            <cat.icon size={14} />
            {cat.label}
          </button>
        )}
        <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Folder size={14} className="text-gray-400" />
        </button>
        <button className="p-1.5 text-gray-400 hover:text-gray-600">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Legendary Voices Banner */}
      <div className="flex items-center justify-between p-6 bg-gray-900 rounded-2xl mb-8 relative">
        <h3 className="text-white font-medium">
          Legendary voices for your creative projects
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) =>
            <div
              key={i}
              className="w-14 h-14 rounded-full bg-gray-700 border-2 border-gray-900 overflow-hidden">

                <div className="w-full h-full bg-gradient-to-b from-gray-600 to-gray-800"></div>
              </div>
            )}
          </div>
          <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors">
            Learn more
          </button>
        </div>
        <button className="absolute top-3 right-3 text-gray-500 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Trending Voices */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-black">Trending voices</h2>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingVoices.map((voice, i) =>
          <button
            key={i}
            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left">

              <div
              className={`w-10 h-10 ${voice.color} rounded-full flex items-center justify-center flex-shrink-0`}>

                <span className="text-white text-lg">🎭</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900 text-sm truncate">
                  {voice.name}
                </h4>
                <p className="text-xs text-gray-500">{voice.category}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs">🇺🇸</span>
                  <span className="text-xs text-gray-500">
                    {voice.language}
                  </span>
                  {voice.extra &&
                <span className="text-xs text-gray-400">{voice.extra}</span>
                }
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Handpicked for your use case */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">
            Handpicked for your use case
          </h2>
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
          {useCaseCards.map((card, i) =>
          <div
            key={i}
            className={`flex-shrink-0 w-[280px] h-[160px] ${card.bg} rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer`}>

              <div className="absolute inset-0 opacity-30">
                {card.text &&
              <span className="absolute bottom-0 left-0 text-[80px] font-bold text-gray-600 leading-none">
                    {card.text}
                  </span>
              }
              </div>
              <div></div>
              <div className="flex items-end justify-between relative z-10">
                <h3 className={`font-semibold ${card.textColor} max-w-[180px]`}>
                  {card.title}
                </h3>
                <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly spotlight - Character Voices */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-black">
            Weekly spotlight - Character Voices
          </h2>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
        <div className="divide-y divide-gray-100">
          {spotlightVoices.map((voice, i) =>
          <div
            key={i}
            className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors group">

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0"></div>
              <div className="flex-1 min-w-0 grid grid-cols-[1fr_120px_100px_60px_60px_80px] gap-4 items-center">
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {voice.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {voice.description}
                  </p>
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1">
                    <span>🇺🇸</span>
                    <span className="text-gray-600">{voice.language}</span>
                    {voice.extra &&
                  <span className="text-gray-400">{voice.extra}</span>
                  }
                  </div>
                  {voice.accent &&
                <div className="text-gray-400">{voice.accent}</div>
                }
                </div>
                <div className="text-xs text-gray-500">{voice.category}</div>
                <div className="text-xs text-gray-400">{voice.age}</div>
                <div className="text-xs text-gray-500">{voice.uses}</div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <Plus size={14} className="text-gray-500" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <MoreHorizontal size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Curated language collections */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">
            Curated language collections
          </h2>
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
          {languageCollections.map((col, i) =>
          <div
            key={i}
            className={`flex-shrink-0 w-[280px] h-[160px] ${col.bg} rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer`}>

              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <span className="text-[60px] font-bold text-white/50">
                  {col.text}
                </span>
              </div>
              <div></div>
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <h3 className="font-semibold text-white">{col.language}</h3>
                  <p className="text-sm text-white/70">{col.subtitle}</p>
                </div>
                <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Maya Angelou Poetic Voices Collection */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-black">
            Maya Angelou™ Poetic Voices Collection
          </h2>
          <ChevronRight size={18} className="text-gray-400" />
        </div>
        <div className="divide-y divide-gray-100">
          {poeticVoices.map((voice, i) =>
          <div
            key={i}
            className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors group">

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0"></div>
              <div className="flex-1 min-w-0 grid grid-cols-[1fr_120px_100px_60px_60px_80px] gap-4 items-center">
                <div className="min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {voice.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {voice.description}
                  </p>
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1">
                    <span>🇺🇸</span>
                    <span className="text-gray-600">{voice.language}</span>
                    {voice.extra &&
                  <span className="text-gray-400">{voice.extra}</span>
                  }
                  </div>
                  {voice.accent &&
                <div className="text-gray-400">{voice.accent}</div>
                }
                </div>
                <div className="text-xs text-gray-500">{voice.category}</div>
                <div className="text-xs text-gray-400">{voice.age}</div>
                <div className="text-xs text-gray-500">{voice.uses}</div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <Plus size={14} className="text-gray-500" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                    <MoreHorizontal size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>);

}