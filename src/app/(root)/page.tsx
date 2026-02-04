import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Mic,
  Zap,
  Globe,
  Shield,
  Sparkles,
  Clock,
  ArrowRight,
  Play,
  Check,
  Volume2,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />

        <div className="container mx-auto px-4 md:px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Powered by ElevenLabs AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Transform Text into
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Natural Speech
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Create lifelike voiceovers, audiobooks, and podcasts with
              AI-powered text-to-speech. Ultra-realistic voices in multiple
              languages.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30">
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </SignedIn>
              <Link
                href="/docs"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-8 text-base font-semibold transition-colors hover:bg-muted"
              >
                <Play className="h-4 w-4" />
                View Demo
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-muted to-muted-foreground/20"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by <span className="font-semibold text-foreground">10,000+</span> creators worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-muted/20 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for voice generation
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade text-to-speech with cutting-edge AI technology
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border/60 bg-background p-8 transition-all hover:border-border hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps to perfect audio
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate professional voiceovers in seconds
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="border-t border-border/40 bg-muted/20 py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-border/60 bg-background p-8">
              <h3 className="text-2xl font-bold">Free</h3>
              <p className="mt-2 text-muted-foreground">Perfect for trying out</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {["10,000 characters/month", "10 generations/month", "Standard voices", "MP3 export"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="mt-8 w-full inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background font-semibold transition-colors hover:bg-muted">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="mt-8 w-full inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background font-semibold transition-colors hover:bg-muted"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-2xl border-2 border-primary bg-background p-8">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                Popular
              </div>
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="mt-2 text-muted-foreground">For serious creators</p>
              <div className="mt-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {["50,000 characters/month", "100 generations/month", "Premium voices", "All export formats", "Priority support"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="mt-8 w-full inline-flex h-11 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90">
                    Start Free Trial
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/billing"
                  className="mt-8 w-full inline-flex h-11 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                >
                  Upgrade to Pro
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="text-sm font-medium text-primary hover:underline"
            >
              View full pricing details
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 md:px-16 md:py-24 text-center">
            {/* Background pattern */}
            <div className="absolute inset-0 -z-10 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,white,transparent_50%)]" />
            </div>

            <div className="mx-auto max-w-2xl">
              <Volume2 className="h-12 w-12 mx-auto mb-6 text-primary-foreground/80" />
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to bring your text to life?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of creators using TenLabs for professional voice generation.
              </p>
              <div className="mt-10">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-8 text-base font-semibold text-primary shadow-lg transition-all hover:bg-background/90">
                      Start Creating for Free
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-8 text-base font-semibold text-primary shadow-lg transition-all hover:bg-background/90"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const features = [
  {
    title: "Ultra-Realistic Voices",
    description:
      "AI-powered voices that sound indistinguishable from human speech with natural intonation and emotion.",
    icon: Mic,
  },
  {
    title: "Lightning Fast",
    description:
      "Generate hours of audio content in seconds. Our optimized infrastructure delivers results instantly.",
    icon: Zap,
  },
  {
    title: "Multiple Languages",
    description:
      "Support for 29+ languages with native-sounding accents and pronunciations.",
    icon: Globe,
  },
  {
    title: "Secure & Private",
    description:
      "Enterprise-grade security with encrypted storage. Your content stays yours.",
    icon: Shield,
  },
  {
    title: "Custom Voices",
    description:
      "Clone any voice or create unique synthetic voices for your brand.",
    icon: Sparkles,
  },
  {
    title: "API Access",
    description:
      "Full REST API for seamless integration into your apps and workflows.",
    icon: Clock,
  },
];

const steps = [
  {
    title: "Enter Your Text",
    description:
      "Paste or type any text - from scripts to articles to book chapters.",
  },
  {
    title: "Choose a Voice",
    description:
      "Select from our library of premium AI voices or use your own custom voice.",
  },
  {
    title: "Download & Share",
    description:
      "Get your audio file instantly in MP3, WAV, or other formats.",
  },
];
