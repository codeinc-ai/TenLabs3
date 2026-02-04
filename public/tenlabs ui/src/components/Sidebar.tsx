import React from 'react';
import {
  Home,
  Mic,
  Video,
  MonitorPlay,
  Languages,
  FileAudio,
  Keyboard,
  Film,
  Zap,
  ChevronDown,
  Sparkles,
  Wand2,
  AudioWaveform } from
'lucide-react';
type Page =
'home' |
'text-to-speech' |
'voice-changer' |
'sound-effects' |
'voice-isolator' |
'studio' |
'dubbing' |
'speech-to-text' |
'audio-native' |
'productions' |
'voices';
interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}
export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[240px] bg-white border-r border-gray-200 flex flex-col h-screen text-gray-600 text-sm flex-shrink-0">
      {/* Logo Area */}
      <div className="p-4 pb-2">
        <div className="font-bold text-lg text-black mb-4 px-2">
          IIElevenLabs
        </div>

        <button className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-black">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-white text-xs">
              <Wand2 size={12} />
            </div>
            <span className="font-medium text-sm">Creative Platform</span>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Main Nav */}
        <div className="space-y-0.5">
          <NavItem
            icon={<Home size={18} />}
            label="Home"
            active={activePage === 'home'}
            onClick={() => onNavigate('home')} />

          <NavItem
            icon={<Mic size={18} />}
            label="Voices"
            active={activePage === 'voices'}
            onClick={() => onNavigate('voices')} />

        </div>

        {/* Playground Section */}
        <div>
          <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Playground
          </div>
          <div className="space-y-0.5">
            <NavItem
              icon={<FileAudio size={18} />}
              label="Text to Speech"
              active={activePage === 'text-to-speech'}
              onClick={() => onNavigate('text-to-speech')} />

            <NavItem
              icon={<Wand2 size={18} />}
              label="Voice Changer"
              active={activePage === 'voice-changer'}
              onClick={() => onNavigate('voice-changer')} />

            <NavItem
              icon={<Sparkles size={18} />}
              label="Sound Effects"
              active={activePage === 'sound-effects'}
              onClick={() => onNavigate('sound-effects')} />

            <NavItem
              icon={<AudioWaveform size={18} />}
              label="Voice Isolator"
              active={activePage === 'voice-isolator'}
              onClick={() => onNavigate('voice-isolator')} />

          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Products
          </div>
          <div className="space-y-0.5">
            <NavItem
              icon={<MonitorPlay size={18} />}
              label="Studio"
              active={activePage === 'studio'}
              onClick={() => onNavigate('studio')} />

            <NavItem
              icon={<Film size={18} />}
              label="Dubbing"
              active={activePage === 'dubbing'}
              onClick={() => onNavigate('dubbing')} />

            <NavItem
              icon={<Keyboard size={18} />}
              label="Speech to Text"
              active={activePage === 'speech-to-text'}
              onClick={() => onNavigate('speech-to-text')} />

            <NavItem
              icon={<Languages size={18} />}
              label="Audio Native"
              active={activePage === 'audio-native'}
              onClick={() => onNavigate('audio-native')} />

            <NavItem
              icon={<Video size={18} />}
              label="Productions"
              active={activePage === 'productions'}
              onClick={() => onNavigate('productions')} />

          </div>
        </div>
      </div>

      {/* Bottom Area */}
      <div className="p-3 space-y-2 border-t border-gray-100">
        <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-3 cursor-pointer hover:border-gray-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-black truncate">
              The Eleven Album
            </div>
            <div className="text-xs text-gray-500">Find out more!</div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-black font-medium transition-colors">
          <Zap size={16} className="fill-black" />
          <span>Upgrade</span>
        </button>
      </div>
    </aside>);

}
function NavItem({
  icon,
  label,
  active = false,
  badge,
  onClick






}: {icon: React.ReactNode;label: string;active?: boolean;badge?: string;onClick?: () => void;}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
        ${active ? 'bg-gray-100 text-black font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-black'}
      `}>

      <div className="flex items-center gap-3">
        <span className={active ? 'text-black' : 'text-gray-500'}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge &&
      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded border border-gray-200">
          {badge}
        </span>
      }
    </button>);

}