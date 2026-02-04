"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, Settings, User, MessageSquare, Bell } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebarTrigger } from "@/components/dashboard/mobile-sidebar";

interface DashboardHeaderProps {
  /** Page title to display */
  title?: string;
  /** Page icon */
  icon?: React.ReactNode;
  /** Callback to open mobile sidebar */
  onMobileMenuClick: () => void;
}

/**
 * Dashboard Header Component
 *
 * Renders the top header bar for the authenticated dashboard.
 * Features ElevenLabs-style design with feedback, docs, and user menu.
 */
export function DashboardHeader({ title, icon, onMobileMenuClick }: DashboardHeaderProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  /**
   * Get user initials for avatar fallback.
   */
  const getInitials = (): string => {
    if (!user) return "U";

    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (firstName) {
      return firstName[0].toUpperCase();
    }

    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    return email[0]?.toUpperCase() ?? "U";
  };

  /**
   * Get display name for user menu.
   */
  const getDisplayName = (): string => {
    if (!user) return "User";

    if (user.firstName) {
      return user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName;
    }

    return user.emailAddresses?.[0]?.emailAddress ?? "User";
  };

  /**
   * Get email for display under name.
   */
  const getEmail = (): string => {
    return user?.emailAddresses?.[0]?.emailAddress ?? "";
  };

  /**
   * Handle sign out with redirect to home.
   */
  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0 bg-white">
      {/* Left side: Mobile menu trigger and page title */}
      <div className="flex items-center gap-3 text-black">
        <MobileSidebarTrigger onClick={onMobileMenuClick} />
        {icon && <span className="text-gray-500">{icon}</span>}
        {title && <h1 className="font-medium">{title}</h1>}
      </div>

      {/* Right side: Actions and user menu */}
      <div className="flex items-center gap-3">
        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors hidden sm:block">
          Feedback
        </button>
        <Link
          href="/docs"
          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors hidden sm:block"
        >
          Docs
        </Link>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hidden md:flex">
          <MessageSquare size={16} />
          Talk to AI
        </button>
        
        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block" />
        
        <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors">
          <Bell size={20} />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full p-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.imageUrl}
                  alt={getDisplayName()}
                />
                <AvatarFallback className="bg-green-700 text-white text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {getDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {getEmail()}
                </p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
