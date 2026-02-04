import React, { useState, Suspense } from 'react';
import {
  X,
  ChevronRight,
  RotateCcw,
  ArrowLeft,
  Search,
  Play,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
  Mic,
  Bookmark,
  AlertCircle,
  Copy } from
'lucide-react';
const voicesList = [
{
  id: 1,
  name: 'Adam',
  description: 'A middle aged American male voice with...',
  color: 'from-blue-400 to-cyan-400'
},
{
  id: 2,
  name: 'Hale - Smooth, Confident and Persuasive',
  description: 'Hale - Great for Commercials! - Confide...',
  color: 'from-emerald-400 to-teal-400'
},
{
  id: 3,
  name: 'Ava – Eager, Helpful and Understanding',
  description: 'Ava – Natural AI Voice - Clear, helpful...',
  color: 'from-blue-500 to-indigo-400'
},
{
  id: 4,
  name: 'Fernando Martínez - Rapid, Persuasive',
  description: 'Fernando Martinez - Middle aged casual...',
  color: 'from-orange-400 to-amber-400'
},
{
  id: 5,
  name: 'Quentin - Narrator and Educator',
  description: 'Quentin - Narrator and Educator - A dee...',
  color: 'from-orange-300 to-yellow-400'
},
{
  id: 6,
  name: 'Ana Rita - Smooth, Expressive and Bright',
  description: 'Ana-Rita - A Young British Female Voice,...',
  color: 'from-green-400 to-emerald-400'
},
{
  id: 7,
  name: 'Amelia - Enthusiastic and Expressive',
  description: "Amelia - A young British English woman'...",
  color: 'from-pink-400 to-rose-400'
},
{
  id: 8,
  name: 'Drew - Casual, Curious & Fun',
  description: 'Food & travel. Tips & ideas. Social media...',
  color: 'from-purple-400 to-violet-400'
},
{
  id: 9,
  name: 'Laksh - Soft and Emotional',
  description: 'Laksh - Young, Soft & Emotional - Laksh ...',
  color: 'from-pink-500 to-rose-500'
},
{
  id: 10,
  name: 'Oliver - Clean, British and Steady',
  description: 'Oliver Haddington - A mature voice whic...',
  color: 'from-teal-400 to-cyan-400'
},
{
  id: 11,
  name: 'Jay Wayne - Wise University Professor',
  description: 'Jay Wayne - A confident, semi-deep,...',
  color: 'from-amber-500 to-yellow-500'
},
{
  id: 12,
  name: 'Ayesha - Confident and Encouraging',
  description: 'Ayesha - Energetic Hindi Voice - Ayesha ...',
  color: 'from-green-500 to-emerald-500'
},
{
  id: 13,
  name: 'Ian Cartwell - Suspense and Mystery',
  description: 'Ian Cartwell - Suspense, Mystery and...',
  color: 'from-amber-600 to-orange-500'
},
{
  id: 14,
  name: 'Kishan - Clear and Steady',
  description: 'Kishan – Clear & Confident Hindi Narrato...',
  color: 'from-yellow-500 to-amber-500'
},
{
  id: 15,
  name: 'Victor - Deep, Malevolent and Ancient',
  description: 'Kallisius - Monster & Demon Adversari...',
  color: 'from-emerald-500 to-green-500'
},
{
  id: 16,
  name: 'Rachel',
  description: 'A warm, professional female voice...',
  color: 'from-pink-400 to-rose-300'
}];

const defaultVoices = [
{
  id: 101,
  name: 'Bella - Professional, Bright, Warm',
  description: 'This voice is warm, bright, and professional,...',
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Educational',
  color: 'bg-blue-500'
},
{
  id: 102,
  name: 'Roger - Laid-Back, Casual, Resonant',
  description: 'Easy going and perfect for casual conversations.',
  language: 'English',
  extra: '+4',
  accent: 'American',
  category: 'Conversational',
  color: 'bg-emerald-500'
},
{
  id: 103,
  name: 'Sarah - Mature, Reassuring, Confident',
  description: 'Young adult woman with a confident and warm,...',
  language: 'English',
  extra: '+5',
  accent: 'American',
  category: 'Entertainment',
  color: 'bg-pink-500'
},
{
  id: 104,
  name: 'Laura - Enthusiast, Quirky Attitude',
  description: 'This young adult female voice delivers sunny...',
  language: 'English',
  extra: '+4',
  accent: 'American',
  category: 'Social Media',
  color: 'bg-purple-500'
},
{
  id: 105,
  name: 'Charlie - Deep, Confident, Energetic',
  description: 'A young Australian male with a confident and...',
  language: 'English',
  extra: '+4',
  accent: 'Australian',
  category: 'Conversational',
  color: 'bg-orange-500'
},
{
  id: 106,
  name: 'George - Warm, Captivating Storyteller',
  description: 'Warm resonance that instantly captivates listeners.',
  language: 'English',
  extra: '+7',
  accent: 'British',
  category: 'Narration',
  color: 'bg-blue-600'
},
{
  id: 107,
  name: 'Callum - Husky Trickster',
  description: 'Deceptively gravelly, yet unsettling edge.',
  language: 'English',
  extra: '+2',
  accent: 'American',
  category: 'Characters',
  color: 'bg-teal-500'
},
{
  id: 108,
  name: 'River - Relaxed, Neutral, Informative',
  description: 'A relaxed, neutral voice ready for narrations or...',
  language: 'English',
  extra: '+4',
  accent: 'American',
  category: 'Conversational',
  color: 'bg-indigo-500'
},
{
  id: 109,
  name: 'Harry - Fierce Warrior',
  description: 'An animated warrior ready to charge forward.',
  language: 'English',
  extra: '',
  accent: 'American',
  category: 'Characters',
  color: 'bg-red-500'
},
{
  id: 110,
  name: 'Liam - Energetic, Social Media Creator',
  description: 'A young adult with energy and warmth - suitable fo...',
  language: 'English',
  extra: '+6',
  accent: 'American',
  category: 'Social Media',
  color: 'bg-cyan-500'
},
{
  id: 111,
  name: 'Alice - Clear, Engaging Educator',
  description: 'Clear and engaging, friendly woman with a British...',
  language: 'English',
  extra: '+6',
  accent: 'British',
  category: 'Educational',
  color: 'bg-rose-500'
},
{
  id: 112,
  name: 'Matilda - Knowledgable, Professional',
  description: 'A professional woman with a pleasing alto pitch....',
  language: 'English',
  extra: '+5',
  accent: 'American',
  category: 'Educational',
  color: 'bg-violet-500'
},
{
  id: 113,
  name: 'Will - Relaxed Optimist',
  description: 'Conversational and laid back.',
  language: 'English',
  extra: '+9',
  accent: 'American',
  category: 'Conversational',
  color: 'bg-amber-500'
}];

const filterPills = [
{
  label: 'Languages',
  hasPlus: true
},
{
  label: 'Accent',
  hasPlus: true
},
{
  label: 'Category',
  hasPlus: true
},
{
  label: 'Gender',
  hasPlus: true
},
{
  label: 'Age',
  hasPlus: true
}];

export function SettingsPanel() {
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const [languageOverride, setLanguageOverride] = useState(false);
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(
    voicesList.find((v) => v.name === 'Rachel') || voicesList[0]
  );
  const [dropdownTab, setDropdownTab] = useState('explore');
  const handleVoiceSelect = (voice: {
    id: number;
    name: string;
    description: string;
    color: string;
  }) => {
    setSelectedVoice(voice);
    setIsVoiceDropdownOpen(false);
  };
  const handleDefaultVoiceSelect = (voice: (typeof defaultVoices)[0]) => {
    setSelectedVoice({
      id: voice.id,
      name: voice.name,
      description: voice.description,
      color:
      voice.color.replace('bg-', 'from-') +
      ' to-' +
      voice.color.replace('bg-', '')
    });
    setIsVoiceDropdownOpen(false);
  };
  return (
    <aside className="w-[380px] bg-white border-l border-gray-200 flex flex-col h-screen overflow-hidden flex-shrink-0 relative">
      {/* Voice Selector Dropdown */}
      {isVoiceDropdownOpen &&
      <div className="absolute inset-0 bg-white z-50 flex flex-col">
          {/* Dropdown Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <button
            onClick={() => setIsVoiceDropdownOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors">

              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-900">
              Select a voice
            </span>
          </div>

          {/* Dropdown Tabs */}
          <div className="flex border-b border-gray-200 px-4">
            <button
            onClick={() => setDropdownTab('explore')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${dropdownTab === 'explore' ? 'text-black border-black' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>

              <Mic size={14} />
              Explore
            </button>
            <button
            onClick={() => setDropdownTab('my-voices')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${dropdownTab === 'my-voices' ? 'text-black border-black' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>

              My Voices
            </button>
            <button
            onClick={() => setDropdownTab('default')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${dropdownTab === 'default' ? 'text-black border-black' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>

              Default
            </button>
          </div>

          {/* Tab Content */}
          {dropdownTab === 'explore' &&
        <>
              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                  type="text"
                  placeholder="Start typing to search..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white" />

                  </div>
                  <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
                {filterPills.map((pill, i) =>
            <button
              key={i}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-600 whitespace-nowrap">

                    <Plus size={12} />
                    {pill.label}
                  </button>
            )}
                <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <SlidersHorizontal size={12} className="text-gray-400" />
                </button>
              </div>

              {/* Voice List */}
              <div className="flex-1 overflow-y-auto">
                {voicesList.map((voice) =>
            <button
              key={voice.id}
              onClick={() => handleVoiceSelect(voice)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selectedVoice.id === voice.id ? 'bg-gray-50' : ''}`}>

                    <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${voice.color} flex-shrink-0 relative overflow-hidden`}>

                      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white/40 rounded-full blur-sm"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {voice.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {voice.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors">

                        <Play size={14} className="text-gray-500" />
                      </button>
                      <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors">

                        <MoreHorizontal size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </button>
            )}
              </div>
            </>
        }

          {dropdownTab === 'my-voices' &&
        <>
              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                  type="text"
                  placeholder="Search My Voices..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white" />

                  </div>
                  <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-600 whitespace-nowrap">
                  <Bookmark size={12} />
                  Collections
                  <ChevronRight size={12} className="rotate-90" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-600 whitespace-nowrap">
                  Created by
                  <ChevronRight size={12} className="rotate-90" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs text-gray-600 whitespace-nowrap">
                  Type
                  <ChevronRight size={12} className="rotate-90" />
                </button>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-4 relative">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-gray-300 rounded-tl-full"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <AlertCircle size={16} className="text-gray-400" />
                  </div>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
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
            </>
        }

          {dropdownTab === 'default' &&
        <>
              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                  type="text"
                  placeholder="Search Default Voices..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white" />

                  </div>
                  <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <SlidersHorizontal size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Default Voices List */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Default Voices
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {defaultVoices.map((voice) =>
              <button
                key={voice.id}
                onClick={() => handleDefaultVoiceSelect(voice)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group">

                      <div
                  className={`w-10 h-10 ${voice.color} rounded-full flex items-center justify-center flex-shrink-0`}>

                        <span className="text-white text-xs font-bold">II</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {voice.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {voice.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
                        <span>{voice.category}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">

                          <Copy size={12} className="text-gray-500" />
                        </button>
                        <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">

                          <MoreHorizontal size={12} className="text-gray-500" />
                        </button>
                      </div>
                    </button>
              )}
                </div>
              </div>
            </>
        }
        </div>
      }

      {/* Main Panel Content */}
      <div
        className={`flex flex-col h-full ${isVoiceDropdownOpen ? 'invisible' : ''}`}>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button className="py-4 mr-6 text-sm font-medium text-black border-b-2 border-black">
            Settings
          </button>
          <button className="py-4 text-sm font-medium text-gray-500 hover:text-gray-800">
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
            <button
              onClick={() => setIsVoiceDropdownOpen(true)}
              className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group">

              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedVoice.color} flex items-center justify-center relative overflow-hidden`}>

                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent"></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {selectedVoice.name.split(' - ')[0]}
                </span>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-400 group-hover:text-gray-600" />

            </button>
          </div>

          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">Model</label>
            <div className="w-full p-1 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <span className="px-1.5 py-0.5 rounded border border-black text-[10px] font-bold text-black">
                    V2
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    Eleven Multilingual v2
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
              <div className="mt-1 p-2 bg-gradient-to-r from-gray-100 via-blue-50 to-purple-50 rounded-lg flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  The most expressive Text to Speech
                </span>
                <button className="px-3 py-1 bg-white rounded-full text-xs font-medium text-black shadow-sm border border-gray-100 hover:bg-gray-50">
                  Try Eleven v3
                </button>
              </div>
            </div>
          </div>

          {/* Settings Sliders */}
          <div className="space-y-6">
            <SliderControl
              label="Speed"
              leftLabel="Slower"
              rightLabel="Faster"
              defaultValue={50} />

            <SliderControl
              label="Stability"
              leftLabel="More variable"
              rightLabel="More stable"
              defaultValue={35} />

            <SliderControl
              label="Similarity"
              leftLabel="Low"
              rightLabel="High"
              defaultValue={75} />

            <SliderControl
              label="Style Exaggeration"
              leftLabel="None"
              rightLabel="Exaggerated"
              defaultValue={0} />

          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">
                Language Override
              </span>
              <button
                onClick={() => setLanguageOverride(!languageOverride)}
                className={`w-11 h-6 rounded-full transition-colors relative ${languageOverride ? 'bg-black' : 'bg-gray-200'}`}>

                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${languageOverride ? 'left-[22px]' : 'left-0.5'}`} />

              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">
                Speaker boost
              </span>
              <button
                onClick={() => setSpeakerBoost(!speakerBoost)}
                className={`w-11 h-6 rounded-full transition-colors relative ${speakerBoost ? 'bg-black' : 'bg-gray-200'}`}>

                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${speakerBoost ? 'left-[22px]' : 'left-0.5'}`} />

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
      </div>
    </aside>);

}
function SliderControl({
  label,
  leftLabel,
  rightLabel,
  defaultValue





}: {label: string;leftLabel: string;rightLabel: string;defaultValue: number;}) {
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
          style={{
            width: `${defaultValue}%`
          }} />

        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-black rounded-full shadow-sm opacity-100 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{
            left: `${defaultValue}%`,
            transform: 'translate(-50%, -50%)'
          }} />

      </div>
    </div>);

}