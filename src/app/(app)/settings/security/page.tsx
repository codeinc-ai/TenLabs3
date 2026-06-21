"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ChevronLeft,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const { user, isLoaded } = useUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [signOutOthers, setSignOutOthers] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordEnabled = user?.passwordEnabled ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || saving) return;

    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    try {
      await user.updatePassword({
        newPassword,
        ...(passwordEnabled ? { currentPassword } : {}),
        signOutOfOtherSessions: signOutOthers,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { errors?: { message?: string }[] })?.errors?.[0]?.message;
      setError(message || "Couldn't update your password. Please try again.");
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

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8 sm:py-10">
      {/* Back + heading */}
      <Link
        href="/settings"
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-black/60 transition hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to account
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
          <ShieldCheck className="h-5 w-5 text-black/70 dark:text-white/70" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
            Security
          </h1>
          <p className="text-sm text-black/55 dark:text-white/55">
            Manage your password and account protection.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-black/60 dark:text-white/60" />
          <h2 className="text-base font-semibold text-black dark:text-white">
            {passwordEnabled ? "Change password" : "Set a password"}
          </h2>
        </div>

        {!passwordEnabled && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Your account currently signs in with a connected provider. Set a
              password to also sign in with your email.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {passwordEnabled && (
            <Field
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
          )}

          <Field
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew((v) => !v)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          <Field
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showNew}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
          />

          <label className="flex items-center gap-2.5 pt-1 text-sm text-black/70 dark:text-white/70">
            <input
              type="checkbox"
              checked={signOutOthers}
              onChange={(e) => setSignOutOthers(e.target.checked)}
              className="h-4 w-4 rounded border-black/20 accent-black dark:border-white/20 dark:accent-white"
            />
            Sign out of all other devices
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Your password has been updated.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {passwordEnabled ? "Update password" : "Set password"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow?: () => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-black/70 dark:text-white/70">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 pr-10 text-sm text-black outline-none transition focus:border-black/30 dark:border-white/15 dark:bg-black dark:text-white dark:focus:border-white/30"
        />
        {onToggleShow && (
          <button
            type="button"
            onClick={onToggleShow}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-black/40 transition hover:text-black dark:text-white/40 dark:hover:text-white"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
