"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Home,
  Mic,
  FileAudio,
  Wand2,
  Sparkles,
  AudioWaveform,
  MonitorPlay,
  Film,
  Keyboard,
  Languages,
  Video,
  ChevronDown,
  Zap,
  MessageSquare,
  PenSquare,
  Music,
  Tag,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ADMIN_EMAILS } from "@/constants/admin";

/**
 * Navigation item configuration for the dashboard sidebar.
 */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Main navigation items (top section)
 */
const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/voices", label: "Voices", icon: Mic },
];

/**
 * Playground section items
 */
const PLAYGROUND_ITEMS: NavItem[] = [
  { href: "/tts", label: "Text to Speech", icon: FileAudio },
  { href: "/text-to-dialogue", label: "Text to Dialogue", icon: MessageSquare },
  { href: "/voice-changer", label: "Voice Changer", icon: Wand2 },
  { href: "/sound-effects", label: "Sound Effects", icon: Sparkles },
  { href: "/voice-isolator", label: "Voice Isolator", icon: AudioWaveform },
];

/**
 * Products section items
 */
const PRODUCTS_ITEMS: NavItem[] = [
  { href: "/studio", label: "Studio", icon: MonitorPlay },
  { href: "/music", label: "Music", icon: Music },
  { href: "/dubbing", label: "Dubbing", icon: Film },
  { href: "/stt", label: "Speech to Text", icon: Keyboard },
  { href: "/audio-native", label: "Audio Native", icon: Languages },
  { href: "/productions", label: "Productions", icon: Video },
];

/**
 * Admin section items (only visible to admins)
 */
const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin/blog", label: "Blog Management", icon: PenSquare },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
];

/**
 * Dashboard Sidebar Component
 *
 * Renders the main navigation sidebar for the authenticated dashboard.
 * Features ElevenLabs-style design with sections for Playground and Products.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Check if current user is an admin
  const email = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = email && ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === email.toLowerCase()
  );

  /**
   * Checks if a nav item is currently active.
   */
  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[240px] min-w-[240px] max-w-[240px] bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen text-gray-600 dark:text-gray-300 text-sm flex-shrink-0 overflow-hidden transition-colors">
      {/* Logo Area */}
      <div className="p-4 pb-2">
        <div className="font-bold text-lg text-black dark:text-white mb-4 px-2">
          Ten Labs
        </div>

        <button className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors text-black dark:text-white">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-white text-xs">
              <Wand2 size={12} />
            </div>
            <span className="font-medium text-sm">Creative Platform</span>
          </div>
          <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-2 overflow-x-hidden">
        <div className="space-y-6">
          {/* Main Nav */}
          <div className="space-y-0.5">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActive(item.href)}
              />
            ))}
          </div>

          {/* Playground Section */}
          <div>
            <div className="px-3 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Playground
            </div>
            <div className="space-y-0.5">
              {PLAYGROUND_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div>
            <div className="px-3 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Products
            </div>
            <div className="space-y-0.5">
              {PRODUCTS_ITEMS.map((item) => (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                />
              ))}
            </div>
          </div>

          {/* Admin Section (only visible to admins) */}
          {isAdmin && (
            <div>
              <div className="px-3 py-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Admin
              </div>
              <div className="space-y-0.5">
                {ADMIN_ITEMS.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Area */}
      <div className="p-3 space-y-2 border-t border-gray-100 dark:border-[#1a1a1a] min-w-0 overflow-hidden">
        <div className="p-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl flex items-center gap-3 cursor-pointer hover:border-gray-300 dark:hover:border-[#444] transition-colors min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="font-medium text-black dark:text-white truncate text-sm">
              Ten Labs Audio
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Find out more!</div>
          </div>
        </div>

        <Link
          href="/billing"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg text-black dark:text-white font-medium transition-colors min-w-0"
        >
          <Zap size={16} className="flex-shrink-0 fill-black dark:fill-white" />
          <span className="truncate">Upgrade</span>
        </Link>
      </div>
    </aside>
  );
}

/**
 * Individual navigation item component
 */
function NavItem({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
      )}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span>{item.label}</span>
      </div>
    </Link>
  );
}
