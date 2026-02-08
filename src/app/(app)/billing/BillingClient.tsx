"use client";

import { useState } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import {
  CreditCard,
  Receipt,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  TrendingUp,
  Zap,
  Crown,
  ArrowRight,
  Tag,
} from "lucide-react";

import { BILLING_PLANS, PLANS } from "@/constants";
import type { BillingOverview } from "@/lib/services/billingService";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormattedNumber } from "@/components/dashboard/formatted-number";
import { FormattedDate } from "@/components/dashboard/formatted-date";

interface BillingClientProps {
  initialData: BillingOverview | null;
  userEmail?: string;
}

export function BillingClient({ initialData, userEmail }: BillingClientProps) {
  const [data, setData] = useState<BillingOverview | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<"starter" | "creator" | "pro">("pro");

  const subscription = data?.subscription;
  const currentPlan = subscription?.plan || "free";
  const isPaid = currentPlan !== "free";

  const planOrder = ["free", "starter", "creator", "pro"] as const;
  const currentPlanIndex = planOrder.indexOf(currentPlan as typeof planOrder[number]);

  // Usage calculations
  const charsUsed = subscription?.usage.charactersUsed || 0;
  const charsLimit = subscription?.usage.charactersLimit || PLANS.free.maxChars;
  const gensUsed = subscription?.usage.generationsUsed || 0;
  const gensLimit = subscription?.usage.generationsLimit || PLANS.free.maxGenerations;
  const charsPercent = Math.min((charsUsed / charsLimit) * 100, 100);
  const gensPercent = Math.min((gensUsed / gensLimit) * 100, 100);

  // Handle upgrade
  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedUpgradePlan }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upgrade");
      }

      // Refresh billing data
      const billingRes = await fetch("/api/billing");
      if (billingRes.ok) {
        const newData = await billingRes.json();
        setData(newData);
      }

      setSuccess(`Successfully upgraded to ${selectedUpgradePlan.charAt(0).toUpperCase() + selectedUpgradePlan.slice(1)} plan!`);
      setUpgradeDialogOpen(false);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      setError(e.message);
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle coupon redemption
  const handleRedeemCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to redeem coupon");
      }

      if (result.type === "direct_upgrade") {
        setCouponSuccess(`Coupon redeemed! You've been upgraded to the ${result.plan} plan for ${result.durationDays} days.`);
      } else {
        setCouponSuccess(`Coupon redeemed! You have a ${result.discountPercent}% discount on your next upgrade.`);
      }

      setCouponCode("");

      // Refresh billing data
      const billingRes = await fetch("/api/billing");
      if (billingRes.ok) {
        const newData = await billingRes.json();
        setData(newData);
      }
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      setCouponError(e.message);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/billing/subscription", {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to cancel");
      }

      // Refresh billing data
      const billingRes = await fetch("/api/billing");
      if (billingRes.ok) {
        const newData = await billingRes.json();
        setData(newData);
      }

      setSuccess("Subscription canceled. You'll retain access until the end of your billing period.");
      setCancelDialogOpen(false);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      setError(e.message);
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-500/10 text-green-600">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${isPaid ? "bg-primary/10" : "bg-muted"}`}>
                {isPaid ? (
                  <Crown className="h-5 w-5 text-primary" />
                ) : (
                  <Zap className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {BILLING_PLANS[currentPlan as keyof typeof BILLING_PLANS]?.name || "Free"} Plan
                  <Badge variant={isPaid ? "default" : "secondary"}>
                    {subscription?.status === "active" ? "Active" : subscription?.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {BILLING_PLANS[currentPlan as keyof typeof BILLING_PLANS]?.description || "Basic access with limited features"}
                </CardDescription>
              </div>
            </div>
            {isPaid && subscription?.price && (
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(subscription.price.amount)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{subscription.price.interval}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Applied Coupon Info */}
          {subscription?.appliedCoupon && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
              <Tag className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Coupon <span className="font-medium">{subscription.appliedCoupon}</span> applied
                {subscription.planExpiresAt && (
                  <> &middot; Plan expires <FormattedDate date={subscription.planExpiresAt} /></>
                )}
                {subscription.discountPercent && (
                  <> &middot; {subscription.discountPercent}% discount active</>
                )}
              </span>
            </div>
          )}

          {/* Usage Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Characters Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Characters Used</span>
                <span className="font-medium">
                  <FormattedNumber value={charsUsed} /> / <FormattedNumber value={charsLimit} />
                </span>
              </div>
              <Progress value={charsPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {charsPercent.toFixed(1)}% of monthly limit
              </p>
            </div>

            {/* Generations Usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generations Used</span>
                <span className="font-medium">
                  <FormattedNumber value={gensUsed} /> / <FormattedNumber value={gensLimit} />
                </span>
              </div>
              <Progress value={gensPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {gensPercent.toFixed(1)}% of monthly limit
              </p>
            </div>
          </div>

          {/* Billing Period */}
          {subscription && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Current Billing Period</p>
                  <p className="text-xs text-muted-foreground">
                    <FormattedDate date={subscription.currentPeriodStart} /> -{" "}
                    <FormattedDate date={subscription.currentPeriodEnd} />
                  </p>
                </div>
              </div>
              {data?.nextInvoice && (
                <div className="text-right">
                  <p className="text-sm font-medium">Next Invoice</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(data.nextInvoice.amount)} on{" "}
                    <FormattedDate date={data.nextInvoice.date} />
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {currentPlan !== "pro" && (
              <Button onClick={() => setUpgradeDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            )}
            {isPaid && (
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel Subscription
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/billing/payment-methods">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/billing/invoices">
                <Receipt className="mr-2 h-4 w-4" />
                View Invoices
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Code Redemption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Redeem Coupon Code
          </CardTitle>
          <CardDescription>
            Have a coupon or promo code? Enter it below to apply it to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {couponError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{couponError}</AlertDescription>
            </Alert>
          )}
          {couponSuccess && (
            <Alert className="mb-4 border-green-500/50 bg-green-500/10 text-green-600">
              <Check className="h-4 w-4" />
              <AlertDescription>{couponSuccess}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button
              onClick={handleRedeemCoupon}
              disabled={couponLoading || !couponCode.trim()}
            >
              {couponLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Tag className="mr-2 h-4 w-4" />
              )}
              Redeem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compare Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(["free", "starter", "creator", "pro"] as const).map((planKey) => {
            const plan = BILLING_PLANS[planKey];
            const isCurrentPlan = currentPlan === planKey;
            const planIdx = planOrder.indexOf(planKey);
            const isUpgrade = planIdx > currentPlanIndex;
            const isCreator = planKey === "creator";

            return (
              <Card
                key={planKey}
                className={`${isCurrentPlan ? "ring-2 ring-primary" : ""} ${isCreator && !isCurrentPlan ? "relative overflow-hidden" : ""}`}
              >
                {isCreator && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {planKey === "pro" && <Crown className="h-4 w-4 text-primary" />}
                      {plan.name}
                    </CardTitle>
                    {isCurrentPlan && <Badge>Current</Badge>}
                  </div>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <p className="text-2xl font-bold mt-2">
                    ${billingInterval === "month"
                      ? plan.price.monthly
                      : Math.round(plan.price.yearly / 12)}
                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {plan.limitations.map((limitation, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                  {isUpgrade && (
                    <Button
                      className="w-full mt-4"
                      size="sm"
                      onClick={() => {
                        setSelectedUpgradePlan(planKey as "starter" | "creator" | "pro");
                        setUpgradeDialogOpen(true);
                      }}
                    >
                      Upgrade
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex gap-2 mt-4 justify-center">
          <Button
            variant={billingInterval === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setBillingInterval("month")}
          >
            Monthly
          </Button>
          <Button
            variant={billingInterval === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setBillingInterval("year")}
          >
            Yearly
          </Button>
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/billing/invoices"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Invoice History</p>
                <p className="text-xs text-muted-foreground">
                  View and download invoices
                </p>
              </div>
            </Link>
            <Link
              href="/billing/payment-methods"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Payment Methods</p>
                <p className="text-xs text-muted-foreground">
                  Manage your cards
                </p>
              </div>
            </Link>
            <Link
              href="/usage"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Usage Details</p>
                <p className="text-xs text-muted-foreground">
                  View detailed usage stats
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Upgrade to {BILLING_PLANS[selectedUpgradePlan].name}
            </DialogTitle>
            <DialogDescription>
              {BILLING_PLANS[selectedUpgradePlan].description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{BILLING_PLANS[selectedUpgradePlan].name} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Billed {billingInterval === "month" ? "monthly" : "yearly"}
                  </p>
                </div>
                <p className="text-xl font-bold">
                  ${billingInterval === "month"
                    ? BILLING_PLANS[selectedUpgradePlan].price.monthly
                    : BILLING_PLANS[selectedUpgradePlan].price.yearly}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{billingInterval === "month" ? "mo" : "yr"}
                  </span>
                </p>
              </div>
            </div>
            {subscription?.discountPercent && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <p className="text-sm text-green-600">
                  Your {subscription.discountPercent}% coupon discount will be applied at checkout.
                </p>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Your subscription will start immediately. You can cancel anytime.</p>
              {userEmail && (
                <p className="mt-2">
                  Receipt will be sent to: <span className="font-medium">{userEmail}</span>
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Confirm Upgrade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your {BILLING_PLANS[currentPlan as keyof typeof BILLING_PLANS]?.name} subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm">
                You&apos;ll lose access to your current plan features and be downgraded to the Free plan.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your access will continue until the end of your current billing period.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={loading}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                "Cancel Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
