"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Loader2,
  Tag,
  TicketPercent,
  ArrowUpRight,
  Copy,
  Check,
} from "lucide-react";
import { ADMIN_EMAILS } from "@/constants/admin";

interface CouponData {
  _id: string;
  code: string;
  type: "direct_upgrade" | "discount";
  plan?: string;
  discountPercent?: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
}

interface CouponStats {
  total: number;
  active: number;
  expired: number;
  totalRedemptions: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function generateRandomCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function AdminCouponsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [stats, setStats] = useState<CouponStats>({ total: 0, active: 0, expired: 0, totalRedemptions: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState(generateRandomCode());
  const [formType, setFormType] = useState<"direct_upgrade" | "discount">("direct_upgrade");
  const [formPlan, setFormPlan] = useState<"starter" | "creator" | "pro">("pro");
  const [formDiscount, setFormDiscount] = useState(50);
  const [formMaxUses, setFormMaxUses] = useState(100);
  const [formExpiresAt, setFormExpiresAt] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formDurationDays, setFormDurationDays] = useState(30);

  const email = user?.emailAddresses?.[0]?.emailAddress;
  const isAdmin = email && ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isLoaded, isAdmin, router]);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
        setStats(data.stats || { total: 0, active: 0, expired: 0, totalRedemptions: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchCoupons();
    }
  }, [isAdmin, fetchCoupons]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode,
          type: formType,
          plan: formType === "direct_upgrade" ? formPlan : undefined,
          discountPercent: formType === "discount" ? formDiscount : undefined,
          maxUses: formMaxUses,
          expiresAt: new Date(formExpiresAt).toISOString(),
          durationDays: formDurationDays,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create coupon");
      }

      setSuccess(`Coupon ${formCode} created successfully!`);
      setShowForm(false);
      setFormCode(generateRandomCode());
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (code: string) => {
    setDeactivating(code);
    setError(null);

    try {
      const res = await fetch(`/api/coupons/${code}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to deactivate coupon");
      }

      setSuccess(`Coupon ${code} deactivated.`);
      fetchCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate coupon");
    } finally {
      setDeactivating(null);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isLoaded || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
          <p className="mt-1 text-muted-foreground">Create and manage coupon codes for your users.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Coupon
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Coupons", value: stats.total, icon: Tag },
          { label: "Active", value: stats.active, icon: ArrowUpRight },
          { label: "Expired / Inactive", value: stats.expired, icon: Trash2 },
          { label: "Total Redemptions", value: stats.totalRedemptions, icon: TicketPercent },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Create Coupon Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-lg font-semibold">Create New Coupon</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm tracking-wider uppercase"
                  placeholder="TENLABS2026"
                />
                <button
                  type="button"
                  onClick={() => setFormCode(generateRandomCode())}
                  className="shrink-0 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent transition-colors"
                >
                  Random
                </button>
              </div>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as "direct_upgrade" | "discount")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="direct_upgrade">Direct Plan Upgrade</option>
                <option value="discount">Percentage Discount</option>
              </select>
            </div>

            {/* Plan (for direct_upgrade) */}
            {formType === "direct_upgrade" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Plan</label>
                <select
                  value={formPlan}
                  onChange={(e) => setFormPlan(e.target.value as "starter" | "creator" | "pro")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="starter">Starter ($9/mo)</option>
                  <option value="creator">Creator ($22/mo)</option>
                  <option value="pro">Pro ($110/mo)</option>
                </select>
              </div>
            )}

            {/* Discount % (for discount type) */}
            {formType === "discount" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount Percentage</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(Number(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            {/* Max Uses */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Uses</label>
              <input
                type="number"
                min={1}
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Expires At</label>
              <input
                type="date"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Duration Days */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (days)</label>
              <input
                type="number"
                min={1}
                value={formDurationDays}
                onChange={(e) => setFormDurationDays(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                How long the plan/discount lasts after redemption
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={creating || !formCode}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Coupon
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Code</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan / Discount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Uses</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Expires</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    No coupons yet. Create your first one above.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiresAt) < new Date();
                  const isInactive = !coupon.isActive;
                  const isFull = coupon.usedCount >= coupon.maxUses;

                  return (
                    <tr key={coupon._id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold tracking-wider">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          coupon.type === "direct_upgrade"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}>
                          {coupon.type === "direct_upgrade" ? "Upgrade" : "Discount"}
                        </span>
                      </td>
                      <td className="px-4 py-3 capitalize">
                        {coupon.type === "direct_upgrade"
                          ? coupon.plan || "—"
                          : `${coupon.discountPercent}% off`}
                      </td>
                      <td className="px-4 py-3">
                        {coupon.usedCount} / {coupon.maxUses}
                      </td>
                      <td className="px-4 py-3">
                        {coupon.durationDays}d
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(coupon.expiresAt)}
                      </td>
                      <td className="px-4 py-3">
                        {isInactive ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-500/10 text-gray-400">
                            Inactive
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400">
                            Expired
                          </span>
                        ) : isFull ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-400">
                            Maxed
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {coupon.isActive && (
                          <button
                            onClick={() => handleDeactivate(coupon.code)}
                            disabled={deactivating === coupon.code}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Deactivate coupon"
                          >
                            {deactivating === coupon.code ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
