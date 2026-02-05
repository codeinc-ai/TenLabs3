import { currentUser } from "@clerk/nextjs/server";
import {
  Mic,
  BookOpen,
  Image as ImageIcon,
  Bot,
  Music,
  Languages,
  Plus,
  Library,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/services/dashboardService";

/**
 * Dashboard Page (Home)
 *
 * The main landing page for authenticated users.
 * Features ElevenLabs-style design with:
 * - Greeting with user's name
 * - Feature cards grid
 * - Latest from library
 * - Create voice options
 */
export default async function DashboardPage() {
  const user = await currentUser();
  const clerkId = user?.id;

  // Fetch dashboard stats from database
  const stats = clerkId ? await getDashboardStats(clerkId) : null;

  const displayName = user?.firstName ?? "there";

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Banner */}
      <div className="flex items-center justify-between mb-12">
        <Link
          href="/billing"
          className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#444] transition-colors group"
        >
          <span className="bg-black dark:bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            New
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Upgrade to Pro for more features
          </span>
          <ChevronRight
            size={14}
            className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
          />
        </Link>
      </div>

      {/* Greeting */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {stats?.user.plan === "pro" ? "Pro" : "Free"} Plan
          </div>
          <h2 className="text-3xl font-bold text-black dark:text-white">
            {getGreeting()}, {displayName}
          </h2>
        </div>
        <Link
          href="/support"
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-full shadow-sm dark:shadow-none hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Talk to Support
          </span>
        </Link>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-16">
        <FeatureCard
          href="/tts"
          icon={<Mic size={24} className="text-blue-500" />}
          label="Text to Speech"
          hasNotification
        />
        <FeatureCard
          href="/stt"
          icon={<BookOpen size={24} className="text-orange-500" />}
          label="Speech to Text"
          hasNotification
        />
        <FeatureCard
          href="/studio"
          icon={<ImageIcon size={24} className="text-green-500" />}
          label="Studio"
        />
        <FeatureCard
          href="/voice-changer"
          icon={<Bot size={24} className="text-purple-500" />}
          label="Voice Changer"
          hasNotification
        />
        <FeatureCard
          href="/sound-effects"
          icon={<Music size={24} className="text-amber-500" />}
          label="Sound Effects"
        />
        <FeatureCard
          href="/dubbing"
          icon={<Languages size={24} className="text-teal-500" />}
          label="Dubbing"
          hasNotification
        />
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Latest from library */}
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
            Latest from the library
          </h3>
          <div className="space-y-6">
            {stats?.recentGenerations && stats.recentGenerations.length > 0 ? (
              stats.recentGenerations.slice(0, 5).map((gen) => (
                <LibraryItem
                  key={gen.id}
                  name={gen.voiceId}
                  description={
                    gen.text.length > 60
                      ? gen.text.slice(0, 60) + "..."
                      : gen.text
                  }
                  color="from-orange-400 to-red-500"
                />
              ))
            ) : (
              <>
                <LibraryItem
                  name="Sarah - Conversational Voice"
                  description="A warm, natural voice perfect for narration and podcasts..."
                  color="from-orange-400 to-red-500"
                />
                <LibraryItem
                  name="George - Professional Narrator"
                  description="Deep, authoritative voice ideal for documentaries and audiobooks..."
                  color="from-pink-500 to-rose-500"
                />
                <LibraryItem
                  name="Alice - Educational Content"
                  description="Clear, engaging British voice for tutorials and e-learning..."
                  color="from-green-400 to-emerald-600"
                />
              </>
            )}
          </div>
          <Link
            href="/library"
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            Explore Library
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Right: Create or clone a voice */}
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
            Create or clone a voice
          </h3>
          <div className="space-y-4">
            <CreateCard
              href="/voices"
              icon={
                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                  <Sparkles size={20} />
                </div>
              }
              title="Voice Design"
              description="Design an entirely new voice from a text prompt"
            />
            <CreateCard
              href="/voices"
              icon={
                <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <Plus size={20} />
                </div>
              }
              title="Clone your Voice"
              description="Create a realistic digital clone of your voice"
            />
            <CreateCard
              href="/voices"
              icon={
                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                  <Library size={20} />
                </div>
              }
              title="Voice Collections"
              description="Curated AI voices for every use case"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Generations"
            value={stats.usage.generationsUsed}
            limit={stats.usage.generationsLimit}
          />
          <StatCard
            label="Characters"
            value={stats.usage.charactersUsed}
            limit={stats.usage.charactersLimit}
          />
          <StatCard label="Voices" value={stats.voicesCount} />
          <StatCard label="This Week" value={stats.activityLast7Days} />
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  label,
  hasNotification,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hasNotification?: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-4 group">
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-[#252525] transition-colors">
        <div className="w-16 h-16 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-sm dark:shadow-none flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        {hasNotification && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full"></div>
        )}
      </div>
      <span className="text-sm font-medium text-black dark:text-white text-center">{label}</span>
    </Link>
  );
}

function LibraryItem({
  name,
  description,
  color,
}: {
  name: string;
  description: string;
  color: string;
}) {
  return (
    <div className="flex gap-4 group cursor-pointer">
      <div
        className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${color} flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-105 transition-transform`}
      >
        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white dark:border-gray-800">
          <CheckCircle2 size={10} className="text-white fill-current" />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          {name}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{description}</p>
      </div>
    </div>
  );
}

function CreateCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="w-full p-4 bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl flex items-center gap-4 hover:bg-gray-200 dark:hover:bg-[#252525] transition-colors text-left group"
    >
      <div className="group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

function StatCard({
  label,
  value,
  limit,
}: {
  label: string;
  value: number;
  limit?: number;
}) {
  return (
    <div className="p-4 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl">
      <div className="text-2xl font-bold text-black dark:text-white">
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {label}
        {limit !== undefined && ` / ${limit.toLocaleString()}`}
      </div>
    </div>
  );
}
