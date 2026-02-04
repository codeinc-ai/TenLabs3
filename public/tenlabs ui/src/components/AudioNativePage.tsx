import React from 'react';
import {
  Languages,
  MessageSquare,
  Bell,
  Play,
  Volume2,
  RotateCcw,
  RotateCw,
  Radio,
  TrendingUp,
  Settings,
  BarChart3 } from
'lucide-react';
const features = [
{
  icon: TrendingUp,
  title: 'Increase engagement and time on page',
  description:
  'Boost engagement and reduce churn with an audio player that automatically narrates your content, keeping visitors on your page longer and improving SEO.'
},
{
  icon: Settings,
  title: 'Fully customize your player',
  description:
  'The Audio Native player can be customized to match your brand and configured to narrate your content in any voice you select.'
},
{
  icon: BarChart3,
  title: 'Track performance and increase user insights',
  description:
  "Monitor your player's performance by reviewing detailed metrics on listens, engagement, and devices across different web pages."
}];

export function AudioNativePage() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 text-black">
          <Languages size={20} className="text-gray-500" />
          <h1 className="font-medium">Audio Native</h1>
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
        <div className="p-8 max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-2xl font-bold text-black mb-2">Audio Native</h1>
          <p className="text-gray-600 mb-8">
            Automatically voices content of a web page using ElevenLab's
            text-to-speech service
          </p>

          {/* Demo Card */}
          <div className="border border-gray-200 rounded-2xl p-8 mb-6">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center">
                <Radio size={24} className="text-gray-400" />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-xl font-semibold text-center text-black mb-2">
              Get started with Audio Native
            </h2>
            <p className="text-gray-500 text-center text-sm mb-8 max-w-lg mx-auto">
              An embedded player that automatically parses the content of your
              blog posts and voices it using text-to-speech.
            </p>

            {/* Audio Player */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 max-w-xl mx-auto">
              <div className="flex items-center gap-4 mb-3">
                <button className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-800 transition-colors">
                  <Play size={20} className="text-white ml-1" fill="white" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className="font-medium">ElevenLabs</span>
                    <span className="text-gray-400">—</span>
                    <span>Audio</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">00:00</span>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full">
                      <div className="w-1 h-full bg-black rounded-full"></div>
                    </div>
                    <span className="text-xs text-gray-500">00:04</span>
                    <Volume2 size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <RotateCcw size={16} />
                </button>
                <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors font-medium">
                  1.0x
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <RotateCw size={16} />
                </button>
              </div>
              <div className="text-right mt-2">
                <span className="text-[10px] text-gray-400 font-medium">
                  IIElevenLabs
                </span>
              </div>
            </div>

            {/* Blurred Content Preview */}
            <div className="relative max-w-xl mx-auto">
              <div className="space-y-2 blur-[2px] select-none">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Scientific and technological fields. As research advances, the
                  potential to harness sound waves for new applications
                  continues to grow, promising exciting developments in
                  medicine, communication, and technology.
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The study of sound waves is not only pivotal in understanding
                  auditory experiences but also extends to various scientific
                  and technological fields.
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Play video
                </button>
              </div>
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-xl mb-10">
            <div>
              <h3 className="font-semibold text-black mb-1">
                Upgrade your subscription
              </h3>
              <p className="text-sm text-gray-500">
                You need to be subscribed to at least the Creator tier to access
                Audio Native.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Upgrade
              </button>
              <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8 mb-12">
            {features.map((feature, index) =>
            <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <feature.icon size={20} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Trusted By */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-6">Trusted by</p>
            <div className="flex items-center justify-center gap-12">
              <span className="text-xl font-serif font-bold text-black tracking-tight">
                THE NEW YORKER
              </span>
              <span
                className="text-xl font-serif font-bold text-black tracking-tight"
                style={{
                  fontFamily: 'Georgia, serif'
                }}>

                The New York Times
              </span>
              <span className="text-xl font-serif italic text-black">
                The Atlantic
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>);

}