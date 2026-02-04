Ten Labs – Developer & AI-Agent Focused README (Full Stack)

Ten Labs is an AI Text-to-Speech SaaS platform built with:

Next.js + TypeScript

MongoDB (Mongoose)

Clerk (auth)

ElevenLabs API (TTS)

Backblaze B2 (audio storage)

Stripe (billing & subscription)

PostHog (analytics)

Sentry (error tracking)

Vitest (unit & integration tests)

Coderabbit (AI assistant for coding)

ShadCN/Tailwind (UI components)

Core principle: Every new feature or page must integrate all relevant services, observability, testing, and UI standards.

1️⃣ Folder Structure (Current)
src/
├── app/
│   ├── api/tts/route.ts         # TTS API route
│   ├── (auth)/                  # Clerk auth UI (sign-in, sign-up)
│   ├── (root)/                  # Public pages: landing, pricing, docs, gallery, terms, privacy, features
│   └── (app)/                   # Authenticated pages
│       ├── dashboard
│       ├── tts
│       ├── library
│       ├── voices
│       ├── usage
│       ├── billing
│       ├── settings
│       └── support
│
├── constants/
│   └── index.ts                 # App-wide constants: plans, voices, TTS defaults
│
├── types/
│   ├── TTSRequest.ts
│   ├── TTSResponse.ts
│   ├── StripePayload.ts
│   └── UsageUpdate.ts
│
├── models/
│   ├── User.ts
│   ├── Generation.ts
│   ├── Voice.ts
│   └── Usage.ts
│
└── lib/
    ├── services/
    │   ├── ttsService.ts        # ElevenLabs TTS + Backblaze
    │   ├── backblazeService.ts  # Audio storage
    │   ├── posthogClient.ts     # Analytics
    │   └── stripeService.ts     # Payments & subscriptions
    │
    ├── sentry.client.config.ts  # Frontend Sentry
    └── sentry.server.config.ts  # Backend Sentry

2️⃣ Development Guidelines
2.1 When Adding a Page or Feature

Read constants/types/models first.

Integrate Clerk auth if the page is under (app).

Use services, don’t duplicate logic:

ttsService.ts for ElevenLabs + Backblaze

stripeService.ts for billing

posthogClient.ts for analytics

Track errors in Sentry:

try {
  // your logic
} catch (err) {
  Sentry.captureException(err)
  throw err
}


Track analytics in PostHog:

Example: posthog.capture("tts_generated", { userId, voiceId, length })

Use ShadCN components for UI consistency.

Write Vitest tests for all new logic:

Mock ElevenLabs, Backblaze, Stripe, MongoDB

Test success/failure paths

AI Assistant (Coderabbit) usage:

Can generate boilerplate

Must follow existing services, types, constants

Ensure generated code respects auth, observability, testing, and DRY principles

2.2 Services Integration Checklist
Feature Type	Required Services
TTS generation	ElevenLabs API, Backblaze B2, Usage model, Sentry, PostHog
Audio library	MongoDB Generation model, Backblaze, PostHog, Sentry
Voice management	Voice model, PostHog, Sentry
Payments / Billing	Stripe, Usage model, Sentry, PostHog
Any page/component	Clerk auth, ShadCN UI, Sentry, PostHog, Vitest tests
2.3 Testing Guidelines

Vitest for everything new:

Unit test services

Component test frontend

Mock external dependencies:

ElevenLabs, Backblaze, Stripe

Coverage required: vitest run --coverage

Follow AAA pattern: Arrange → Act → Assert

Tag tests clearly (e.g., ttsService.test.ts)

2.4 Observability & Analytics

Sentry: capture all exceptions and critical errors

PostHog: track user interactions, feature usage, TTS events

Always add tags: userId, feature, plan

2.5 Environment Variables
MONGO_URI=
ELEVENLABS_API_KEY=
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET_ID=
B2_BUCKET_NAME=
CLERK_FRONTEND_API=
CLERK_API_KEY=
SENTRY_DSN=
SENTRY_ENVIRONMENT=
POSTHOG_API_KEY=
POSTHOG_API_HOST=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CODERABBIT_API_KEY=


Always load env variables before initializing services.

3️⃣ Recommended Workflow for Adding Features

Plan page → required models + services + UI.

Create page/component under (root) or (app).

Integrate all relevant services:

ElevenLabs, Backblaze, Stripe, PostHog, Sentry

Use ShadCN for UI consistency.

Write Vitest tests (unit & integration).

Test manually → check Sentry and PostHog.

Deploy once coverage and observability are confirmed.

4️⃣ Principles for AI Agents / Developers

Read constants, types, models first.

Keep services stateless, reusable, and typed.

Track all events and errors (PostHog + Sentry) before returning.

Write tests for every new feature/service.

Do not hardcode secrets (always use .env).

Keep code DRY, modular, and consistent with ShadCN.# tenlabs
# tenlabsupadted
