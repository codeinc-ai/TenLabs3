# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

**Ten Labs** is an AI Text-to-Speech platform using Next.js 16, TypeScript, MongoDB, Clerk authentication, ElevenLabs API, and Backblaze B2 storage.

### Route Groups (Next.js App Router)
- `(root)/` - Public pages (landing, pricing, docs, terms, privacy)
- `(auth)/` - Clerk authentication pages (sign-in, sign-up)
- `(app)/` - Authenticated dashboard (TTS, voices, projects, billing, settings)

### Core Flow
1. API route receives request → Clerk authenticates user
2. Service (e.g., `ttsService.ts`) is called with validated `TTSRequest`
3. Service reads constants/types, calls ElevenLabs API, uploads audio to Backblaze
4. MongoDB models updated (usage, generation records)
5. Returns structured `TTSResponse`

### Key Directories
- `src/constants/` - App-wide constants (plans, voices, TTS defaults)
- `src/types/` - TypeScript interfaces (`TTSRequest`, `TTSResponse`, `UsageUpdate`, `StripePayload`)
- `src/models/` - Mongoose schemas (`User`, `Generation`, `Voice`, `Usage`)
- `src/lib/services/` - Business logic (stateless, uses models and constants)
- `src/lib/mongodb.ts` - Singleton MongoDB connection

### Separation of Concerns
- **Models** handle MongoDB schema and typing only
- **Services** handle business logic (TTS generation, uploads, usage tracking)
- **Constants/Types** are input/output references - read these before modifying services

### UI Stack
- Tailwind CSS 4 with CSS variables
- shadcn/ui (new-york style, lucide icons)
- Components alias: `@/components/ui`

## Environment Variables

Required in `.env`:
```
MONGODB_URI=
ELEVENLABS_API_KEY=
B2_KEY_ID=
B2_APP_KEY=
B2_BUCKET_ID=
B2_BUCKET_NAME=
```

Clerk variables also required (see Clerk docs).

## Path Aliases

`@/*` maps to `./src/*`
