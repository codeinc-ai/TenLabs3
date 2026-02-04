import { auth } from "@clerk/nextjs/server";
import { Sparkles, HelpCircle } from "lucide-react";

import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PricingClient } from "./PricingClient";

async function getCurrentPlan(userId: string | null): Promise<"free" | "pro" | null> {
  if (!userId) return null;

  try {
    await connectToDB();
    const user = await User.findOne({ clerkId: userId }).lean<{ plan?: string }>();
    return (user?.plan as "free" | "pro") || "free";
  } catch {
    return null;
  }
}

export default async function PricingPage() {
  const { userId } = await auth();
  const currentPlan = await getCurrentPlan(userId);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />

        <div className="container mx-auto px-4 md:px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Simple, transparent pricing</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Choose your plan
            </h1>

            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Start free and upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <PricingClient currentPlan={currentPlan} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border/40 bg-muted/20 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.question} className="space-y-2">
                <h3 className="flex items-start gap-2 font-semibold">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-muted-foreground pl-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/30 px-8 py-16 md:px-16 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Need more?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Contact us for custom enterprise plans with higher limits,
                dedicated support, and custom integrations.
              </p>
              <a
                href="mailto:enterprise@tenlabs.ai"
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 text-base font-semibold transition-colors hover:bg-muted"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const faqs = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to all features. When downgrading, you'll retain Pro access until the end of your billing period.",
  },
  {
    question: "What happens when I reach my limit?",
    answer:
      "You'll receive a notification when you're approaching your monthly limit. Once reached, you can upgrade to Pro for more capacity or wait until your limit resets at the start of the next billing period.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "We offer a generous free tier so you can try our service before upgrading. This way, you can fully evaluate our platform without any commitment.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor. Enterprise customers can also pay via invoice.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time from your billing settings. You'll continue to have access to Pro features until the end of your current billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee for Pro subscriptions. If you're not satisfied, contact our support team for a full refund.",
  },
];
