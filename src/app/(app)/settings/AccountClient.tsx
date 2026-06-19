"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Check,
  Pencil,
  Mail,
  ShieldCheck,
  CalendarDays,
  Gem,
  CreditCard,
  Bell,
  Lock,
  LogOut,
  Loader2,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AccountClientProps {
  plan: "free" | "starter" | "creator" | "pro";
  maxCredits: number;
  charactersUsed: number;
  generationsUsed: number;
}

const PLAN_LABELS: Record<AccountClientProps["plan"], string> = {
  free: "Free",
  starter: "Starter",
  creator: "Creator",
  pro: "Pro",
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function AccountClient({
  plan,
  maxCredits,
  charactersUsed,
  generationsUsed,
}: AccountClientProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEditing = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setSaveError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setEditing(false);
    } catch {
      setSaveError("Couldn't save your name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-black/30 dark:text-white/40" />
      </div>
    );
  }

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress ||
    "Your account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const emailVerified =
    user?.primaryEmailAddress?.verification?.status === "verified";
  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "") ||
    email[0]?.toUpperCase() ||
    "U";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const creditPct =
    maxCredits > 0
      ? Math.min(100, Math.round((charactersUsed / maxCredits) * 100))
      : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-10">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white sm:text-3xl">
          My Account
        </h1>
        <p className="mt-1 text-sm text-black/55 dark:text-white/55">
          Manage your profile, plan, and account preferences.
        </p>
      </div>

      <div className="space-y-5">
        {/* Profile card */}
        <section className="overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 shrink-0 ring-2 ring-black/5 dark:ring-white/10">
              <AvatarImage src={user?.imageUrl} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black/30 dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-white/30"
                    />
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black/30 dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-white/30"
                    />
                  </div>
                  {saveError && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {saveError}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      {saving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-black/70 transition hover:bg-black/5 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-black dark:text-white">
                      {displayName}
                    </h2>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-black/55 dark:text-white/55">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>
                  </div>
                  <button
                    onClick={startEditing}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-black/70 transition hover:bg-black/5 dark:border-white/15 dark:text-white/70 dark:hover:bg-white/10"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-1 gap-px border-t border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 sm:grid-cols-2">
            <div className="flex items-center gap-3 bg-black/[0.02] px-6 py-4 dark:bg-[#0a0a0a]">
              <ShieldCheck
                className={
                  emailVerified
                    ? "h-5 w-5 shrink-0 text-emerald-500"
                    : "h-5 w-5 shrink-0 text-black/30 dark:text-white/30"
                }
              />
              <div>
                <p className="text-xs text-black/45 dark:text-white/45">
                  Email status
                </p>
                <p className="text-sm font-medium text-black dark:text-white">
                  {emailVerified ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-black/[0.02] px-6 py-4 dark:bg-[#0a0a0a]">
              <CalendarDays className="h-5 w-5 shrink-0 text-black/40 dark:text-white/40" />
              <div>
                <p className="text-xs text-black/45 dark:text-white/45">
                  Member since
                </p>
                <p className="text-sm font-medium text-black dark:text-white">
                  {memberSince}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription card */}
        <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
                <Gem className="h-5 w-5 text-black/70 dark:text-white/70" />
              </span>
              <div>
                <p className="text-xs text-black/45 dark:text-white/45">
                  Current plan
                </p>
                <p className="text-base font-semibold text-black dark:text-white">
                  {PLAN_LABELS[plan]}
                </p>
              </div>
            </div>
            <Link
              href="/billing"
              className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-sm font-medium text-white transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {plan === "pro" ? "Manage plan" : "Upgrade"}
            </Link>
          </div>

          {/* Credit usage */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-black/60 dark:text-white/60">
                Credits used this period
              </span>
              <span className="font-medium tabular-nums text-black dark:text-white">
                {formatNumber(charactersUsed)} / {formatNumber(maxCredits)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-black transition-all dark:bg-white"
                style={{ width: `${creditPct}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-black/10 px-4 py-3 dark:border-white/10">
                <p className="text-xs text-black/45 dark:text-white/45">
                  Generations
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-black dark:text-white">
                  {formatNumber(generationsUsed)}
                </p>
              </div>
              <div className="rounded-xl border border-black/10 px-4 py-3 dark:border-white/10">
                <p className="text-xs text-black/45 dark:text-white/45">
                  Remaining credits
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-black dark:text-white">
                  {formatNumber(Math.max(0, maxCredits - charactersUsed))}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
          {[
            {
              href: "/billing",
              icon: CreditCard,
              title: "Billing & invoices",
              desc: "Payment methods, plans, and receipts",
            },
            {
              href: "/usage",
              icon: Gem,
              title: "Usage",
              desc: "Track your credits across every tool",
            },
            {
              href: "/settings/notifications",
              icon: Bell,
              title: "Notifications",
              desc: "Choose what we email you about",
            },
            {
              href: "/settings/security",
              icon: Lock,
              title: "Security",
              desc: "Password and account protection",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 bg-black/[0.02] px-5 py-4 transition hover:bg-black/[0.04] dark:bg-white/[0.02] dark:hover:bg-white/[0.05] ${
                  i !== 0
                    ? "border-t border-black/10 dark:border-white/10"
                    : ""
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10">
                  <Icon className="h-[18px] w-[18px] text-black/60 dark:text-white/60" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-black dark:text-white">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-black/45 dark:text-white/45">
                    {item.desc}
                  </p>
                </div>
                <span className="text-black/30 dark:text-white/30">›</span>
              </Link>
            );
          })}
        </section>

        {/* Sign out */}
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 px-5 py-3.5 text-sm font-medium text-red-600 transition hover:bg-red-500/5 dark:border-white/10 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
