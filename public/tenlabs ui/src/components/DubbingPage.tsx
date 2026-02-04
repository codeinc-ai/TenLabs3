import React from 'react';
import { Film, MessageSquare, Bell, Play, MoreHorizontal } from 'lucide-react';
const learnCards = [
{
  title: 'Learn about the Dubbing editor',
  description: 'A professional app for dubbing content.'
},
{
  title: 'Importing YouTube videos',
  description: 'Learn how to dub any YouTube video.'
}];

const recentDubs = [
{
  name: 'Product Launch Video',
  language: 'Spanish',
  createdAt: '2 hours ago'
},
{
  name: 'Customer Testimonial',
  language: 'French',
  createdAt: '3 hours ago'
},
{
  name: 'Training Tutorial',
  language: 'German',
  createdAt: '6 hours ago'
},
{
  name: 'Marketing Campaign',
  language: 'Italian',
  createdAt: '2 days ago'
},
{
  name: 'Educational Content',
  language: 'Portuguese',
  createdAt: '2 weeks ago'
}];

export function DubbingPage() {
  return (
    <main className="flex-1 flex flex-col h-screen bg-white min-w-0 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3 text-black">
          <Film size={20} className="text-gray-500" />
          <h1 className="font-medium">Dubbing</h1>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-black">Dubbing</h1>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors">
              Create a Dub
            </button>
          </div>

          {/* Learn Section */}
          <div className="mb-10">
            <h2 className="text-sm font-medium text-gray-500 mb-4">Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learnCards.map((card, index) =>
              <button
                key={index}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left group">

                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                    <Play
                    size={18}
                    className="text-white ml-0.5"
                    fill="white" />

                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Recent Dubs Section */}
          <div>
            <h2 className="text-lg font-semibold text-black mb-6">
              Recent Dubs
            </h2>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_150px_150px_50px] gap-4 px-4 py-3 text-xs font-medium text-gray-500">
              <div>Name</div>
              <div>Language</div>
              <div>Created at</div>
              <div></div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-100">
              {recentDubs.map((dub, index) =>
              <div
                key={index}
                className="grid grid-cols-[1fr_150px_150px_50px] gap-4 px-4 py-4 items-center hover:bg-gray-50 transition-colors group"
                style={{
                  opacity: 1 - index * 0.15
                }}>

                  <div className="text-sm text-gray-900">{dub.name}</div>
                  <div className="text-sm text-gray-500">{dub.language}</div>
                  <div className="text-sm text-gray-500">{dub.createdAt}</div>
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
      </div>
    </main>);

}