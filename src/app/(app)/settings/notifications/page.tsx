"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Bell, Check, Loader2 } from "lucide-react";

interface NotificationPref {
  id: string;
  title: string;
  desc: string;
  group: "Product" | "Account" | "Marketing";
  default: boolean;
}

const PREFERENCES: NotificationPref[] = [
  {
    id: "generation_complete",
    title: "Generation complete",
    desc: "Get notified when a long render or generation finishes.",
    group: "Product",
    default: true,
  },
  {
    id: "product_updates",
    title: "Product updates",
    desc: "New features, voices, and improvements.",
    group: "Product",
    default: true,
  },
  {
    id: "credit_alerts",
    title: "Low credit alerts",
    desc: "A heads-up when you're running low on credits.",
    group: "Account",
    default: true,
  },
  {
    id: "billing_receipts",
    title: "Billing & receipts",
    desc: "Invoices, payment confirmations, and renewals.",
    group: "Account",
    default: true,
  },
  {
    id: "security_alerts",
    title: "Security alerts",
    desc: "Important notices about your account security.",
    group: "Account",
    default: true,
  },
  {
    id: "tips",
    title: "Tips & tutorials",
    desc: "Occasional tips to help you get more out of TenLabs.",
    group: "Marketing",
    default: false,
  },
  {
    id: "offers",
    title: "Offers & promotions",
    desc: "Discounts and special offers. No spam, ever.",
    group: "Marketing",
    default: false,
  },
];

const STORAGE_KEY = "tenlabs_notification_prefs";
const GROUPS: NotificationPref["group"][] = ["Product", "Account", "Marketing"];

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved preferences (fall back to defaults).
  useEffect(() => {
    const defaults = Object.fromEntries(
      PREFERENCES.map((p) => [p.id, p.default])
    );
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPrefs({ ...defaults, ...JSON.parse(stored) });
      } else {
        setPrefs(defaults);
      }
    } catch {
      setPrefs(defaults);
    }
    setLoaded(true);
  }, []);

  const toggle = (id: string) => {
    setSaved(false);
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore storage errors
    }
    // Brief delay so the action feels intentional.
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 350);
  };

  if (!loaded) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-black/30 dark:text-white/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:py-10">
      <Link
        href="/settings"
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-black/60 transition hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to account
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
          <Bell className="h-5 w-5 text-black/70 dark:text-white/70" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
            Notifications
          </h1>
          <p className="text-sm text-black/55 dark:text-white/55">
            Choose what we email you about.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {GROUPS.map((group) => (
          <section
            key={group}
            className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10"
          >
            <div className="border-b border-black/10 bg-black/[0.02] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-black/45 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/45">
              {group}
            </div>
            {PREFERENCES.filter((p) => p.group === group).map((pref, i) => (
              <div
                key={pref.id}
                className={`flex items-center justify-between gap-4 bg-black/[0.01] px-5 py-4 dark:bg-white/[0.02] ${
                  i !== 0 ? "border-t border-black/10 dark:border-white/10" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black dark:text-white">
                    {pref.title}
                  </p>
                  <p className="text-xs text-black/45 dark:text-white/45">
                    {pref.desc}
                  </p>
                </div>
                <Toggle
                  on={!!prefs[pref.id]}
                  onClick={() => toggle(pref.id)}
                  label={pref.title}
                />
              </div>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save preferences
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  label,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-black dark:bg-white" : "bg-black/15 dark:bg-white/20"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform dark:bg-black ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
