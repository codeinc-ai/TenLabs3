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
  Menu,
  Zap,
  MessageSquare,
  PenSquare,
  Tag,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TenLabsLogo } from "@/components/TenLabsLogo";
import { ADMIN_EMAILS } from "@/constants/admin";

/**
 * Navigation item configuration
 */
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/voices", label: "Voices", icon: Mic },
];

const PLAYGROUND_ITEMS: NavItem[] = [
  { href: "/tts", label: "Text to Speech", icon: FileAudio },
  { href: "/text-to-dialogue", label: "Text to Dialogue", icon: MessageSquare },
  { href: "/voice-changer", label: "Voice Changer", icon: Wand2 },
  { href: "/sound-effects", label: "Sound Effects", icon: Sparkles },
  { href: "/voice-isolator", label: "Voice Isolator", icon: AudioWaveform },
];

const PRODUCTS_ITEMS: NavItem[] = [
  { href: "/studio", label: "Studio", icon: MonitorPlay },
  { href: "/dubbing", label: "Dubbing", icon: Film },
  { href: "/stt", label: "Speech to Text", icon: Keyboard },
  { href: "/audio-native", label: "Audio Native", icon: Languages },
  { href: "/productions", label: "Productions", icon: Video },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin/blog", label: "Blog Management", icon: PenSquare },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile Sidebar Component
 *
 * Renders a slide-out navigation drawer for mobile devices.
 * Features ElevenLabs-style design with sections.
 */
export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // Check if current user is an admin
  const email = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = email && ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === email.toLowerCase()
  );

  const isActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-white dark:bg-black border-r-gray-200 dark:border-r-[#1a1a1a]">
        <SheetHeader className="border-b border-gray-200 dark:border-[#1a1a1a] px-4 py-4">
          <SheetTitle className="flex justify-center font-bold text-lg text-black dark:text-white">
            <Link href="/dashboard" onClick={() => onOpenChange(false)} className="flex justify-center">
              <TenLabsLogo height={28} />
            </Link>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] px-3 py-4">
          <div className="space-y-6">
            {/* Main Nav */}
            <div className="space-y-0.5">
              {MAIN_NAV_ITEMS.map((item) => (
                <MobileNavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onNavigate={() => onOpenChange(false)}
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
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                    onNavigate={() => onOpenChange(false)}
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
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    active={isActive(item.href)}
                    onNavigate={() => onOpenChange(false)}
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
                    <MobileNavItem
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                      onNavigate={() => onOpenChange(false)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Area */}
        <div className="p-3 border-t border-gray-100 dark:border-[#1a1a1a]">
          <Link
            href="/billing"
            onClick={() => onOpenChange(false)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg text-black dark:text-white font-medium transition-colors"
          >
            <Zap size={16} className="fill-black dark:fill-white" />
            <span>Upgrade</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Mobile navigation item component
 */
function MobileNavItem({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-gray-100 dark:bg-[#1a1a1a] text-black dark:text-white font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white"
      )}
    >
      <span className={active ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

/**
 * Mobile Sidebar Trigger Button
 */
export function MobileSidebarTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={onClick}
      aria-label="Open navigation menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
