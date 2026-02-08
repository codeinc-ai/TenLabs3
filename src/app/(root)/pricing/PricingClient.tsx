"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";

import { BILLING_PLANS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PricingClientProps {
  currentPlan?: "free" | "starter" | "creator" | "pro" | null;
}

export function PricingClient({ currentPlan }: PricingClientProps) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "starter" | "creator" | "pro" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSelectPlan = (plan: "free" | "starter" | "creator" | "pro") => {
    if (!isSignedIn) {
      // Redirect to sign-up with return URL
      router.push(`/sign-up?redirect_url=/pricing`);
      return;
    }

    if (plan === currentPlan) {
      return; // Already on this plan
    }

    setSelectedPlan(plan);
    setError(null);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    setError(null);

    try {
      if (selectedPlan === "pro") {
        // Upgrade to pro
        const res = await fetch("/api/billing/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "pro" }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upgrade plan");
        }
      } else {
        // Downgrade to free
        const res = await fetch("/api/billing/subscription", {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to change plan");
        }
      }

      setSuccess(true);
      setDialogOpen(false);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Unknown error");
      setError(e.message);
      Sentry.captureException(e);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = (plan: "free" | "starter" | "creator" | "pro") => {
    if (!isSignedIn) {
      return plan === "pro" ? "Get Started" : "Sign Up Free";
    }
    if (plan === currentPlan) {
      return "Current Plan";
    }
    if (plan === "pro") {
      return "Upgrade to Pro";
    }
    return "Downgrade to Free";
  };

  const isCurrentPlan = (plan: "free" | "starter" | "creator" | "pro") => {
    return isSignedIn && plan === currentPlan;
  };

  return (
    <>
      {/* Success Message */}
      {success && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-green-600 shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span className="font-medium">Plan updated successfully! Redirecting...</span>
          </div>
        </div>
      )}

      {/* Billing Interval Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 p-1">
          <button
            onClick={() => setBillingInterval("month")}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              billingInterval === "month"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("year")}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              billingInterval === "year"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
        {/* Free Plan */}
        <div
          className={`relative rounded-2xl border bg-background p-8 transition-all ${
            isCurrentPlan("free")
              ? "border-primary ring-2 ring-primary/20"
              : "border-border/60 hover:border-border hover:shadow-lg"
          }`}
        >
          {isCurrentPlan("free") && (
            <div className="absolute -top-3 left-6">
              <Badge>Current Plan</Badge>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-muted p-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold">Free</h3>
          </div>

          <p className="text-muted-foreground mb-6">
            {BILLING_PLANS.free.description}
          </p>

          <div className="mb-8">
            <span className="text-5xl font-bold">$0</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          <Button
            variant={isCurrentPlan("free") ? "outline" : "default"}
            className="w-full mb-8"
            disabled={isCurrentPlan("free") || loading}
            onClick={() => handleSelectPlan("free")}
          >
            {getButtonText("free")}
          </Button>

          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              What&apos;s included
            </p>
            <ul className="space-y-3">
              {BILLING_PLANS.free.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {BILLING_PLANS.free.limitations.length > 0 && (
              <ul className="space-y-3 pt-4 border-t">
                {BILLING_PLANS.free.limitations.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-3 text-muted-foreground">
                    <X className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pro Plan */}
        <div
          className={`relative rounded-2xl border-2 bg-background p-8 transition-all ${
            isCurrentPlan("pro")
              ? "border-primary ring-2 ring-primary/20"
              : "border-primary hover:shadow-xl hover:shadow-primary/10"
          }`}
        >
          {!isCurrentPlan("pro") && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Most Popular
              </Badge>
            </div>
          )}
          {isCurrentPlan("pro") && (
            <div className="absolute -top-3 left-6">
              <Badge>Current Plan</Badge>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Pro</h3>
          </div>

          <p className="text-muted-foreground mb-6">
            {BILLING_PLANS.pro.description}
          </p>

          <div className="mb-2">
            <span className="text-5xl font-bold">
              ${billingInterval === "month"
                ? BILLING_PLANS.pro.price.monthly
                : Math.round(BILLING_PLANS.pro.price.yearly / 12)}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
          {billingInterval === "year" && (
            <p className="text-sm text-muted-foreground mb-6">
              Billed annually (${BILLING_PLANS.pro.price.yearly}/year)
            </p>
          )}
          {billingInterval === "month" && <div className="mb-6" />}

          <Button
            variant={isCurrentPlan("pro") ? "outline" : "default"}
            className={`w-full mb-8 ${
              !isCurrentPlan("pro")
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                : ""
            }`}
            disabled={isCurrentPlan("pro") || loading}
            onClick={() => handleSelectPlan("pro")}
          >
            {loading && selectedPlan === "pro" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : !isCurrentPlan("pro") ? (
              <Sparkles className="mr-2 h-4 w-4" />
            ) : null}
            {getButtonText("pro")}
            {!isCurrentPlan("pro") && !loading && (
              <ArrowRight className="ml-2 h-4 w-4" />
            )}
          </Button>

          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Everything in Free, plus
            </p>
            <ul className="space-y-3">
              {BILLING_PLANS.pro.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPlan === "pro" ? (
                <>
                  <Crown className="h-5 w-5 text-primary" />
                  Upgrade to Pro
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Switch to Free Plan
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan === "pro"
                ? "Get access to all premium features with the Pro plan."
                : "You'll lose access to premium features at the end of your billing period."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {selectedPlan === "pro" ? "Pro Plan" : "Free Plan"}
                  </p>
                  {selectedPlan === "pro" && (
                    <p className="text-sm text-muted-foreground">
                      Billed {billingInterval === "month" ? "monthly" : "yearly"}
                    </p>
                  )}
                </div>
                <p className="text-xl font-bold">
                  {selectedPlan === "pro" ? (
                    <>
                      ${billingInterval === "month"
                        ? BILLING_PLANS.pro.price.monthly
                        : BILLING_PLANS.pro.price.yearly}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingInterval === "month" ? "mo" : "yr"}
                      </span>
                    </>
                  ) : (
                    "$0"
                  )}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">
              {selectedPlan === "pro"
                ? "Your subscription will start immediately. You can cancel anytime."
                : "Your access to Pro features will end at the end of your current billing period."}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={selectedPlan === "free" ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedPlan === "pro" ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Confirm Upgrade
                </>
              ) : (
                "Confirm Downgrade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
