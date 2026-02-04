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

  const subscription = data?.subscription;
  const currentPlan = subscription?.plan || "free";
  const isPro = currentPlan === "pro";

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
        body: JSON.stringify({ plan: "pro" }),
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

      setSuccess("Successfully upgraded to Pro plan!");
      setUpgradeDialogOpen(false);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      setError(e.message);
      Sentry.captureException(e);
    } finally {
      setLoading(false);
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
              <div className={`rounded-full p-2 ${isPro ? "bg-primary/10" : "bg-muted"}`}>
                {isPro ? (
                  <Crown className="h-5 w-5 text-primary" />
                ) : (
                  <Zap className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {isPro ? "Pro Plan" : "Free Plan"}
                  <Badge variant={isPro ? "default" : "secondary"}>
                    {subscription?.status === "active" ? "Active" : subscription?.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {isPro
                    ? "Full access to all features"
                    : "Basic access with limited features"}
                </CardDescription>
              </div>
            </div>
            {isPro && subscription?.price && (
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
            {!isPro ? (
              <Button onClick={() => setUpgradeDialogOpen(true)}>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            ) : (
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

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Compare Plans</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <Card className={currentPlan === "free" ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Free</CardTitle>
                {currentPlan === "free" && (
                  <Badge>Current Plan</Badge>
                )}
              </div>
              <CardDescription>{BILLING_PLANS.free.description}</CardDescription>
              <p className="text-3xl font-bold mt-2">
                $0
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {BILLING_PLANS.free.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
                {BILLING_PLANS.free.limitations.map((limitation, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`${currentPlan === "pro" ? "ring-2 ring-primary" : ""} relative overflow-hidden`}>
            {currentPlan !== "pro" && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                Recommended
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Pro
                </CardTitle>
                {currentPlan === "pro" && (
                  <Badge>Current Plan</Badge>
                )}
              </div>
              <CardDescription>{BILLING_PLANS.pro.description}</CardDescription>
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">
                    ${billingInterval === "month"
                      ? BILLING_PLANS.pro.price.monthly
                      : Math.round(BILLING_PLANS.pro.price.yearly / 12)}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                  {billingInterval === "year" && (
                    <Badge variant="secondary" className="text-xs">
                      Save ~17%
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
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
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {BILLING_PLANS.pro.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {currentPlan !== "pro" && (
                <Button
                  className="w-full mt-6"
                  onClick={() => setUpgradeDialogOpen(true)}
                >
                  Upgrade to Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
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
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              Get unlimited access to all features with the Pro plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Billed {billingInterval === "month" ? "monthly" : "yearly"}
                  </p>
                </div>
                <p className="text-xl font-bold">
                  ${billingInterval === "month"
                    ? BILLING_PLANS.pro.price.monthly
                    : BILLING_PLANS.pro.price.yearly}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{billingInterval === "month" ? "mo" : "yr"}
                  </span>
                </p>
              </div>
            </div>
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
              Are you sure you want to cancel your Pro subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm">
                You&apos;ll lose access to:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• 50,000 characters per month</li>
                <li>• 100 generations per month</li>
                <li>• Premium voices</li>
                <li>• Commercial license</li>
                <li>• Priority support</li>
              </ul>
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
