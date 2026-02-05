# MindFlow

> AI-powered personalized meditation app with voice synthesis

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Generate unique meditation sessions tailored to your mood, goals, and available time. Each session is crafted by AI and delivered with natural voice synthesis.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and fill in your keys
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI Text**: Kimi (Moonshot) / DeepSeek
- **Voice**: ElevenLabs TTS
- **Payments**: Stripe

## Setup

### 1. Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run migration in SQL Editor: `supabase/migrations/001_initial.sql`
3. Create storage bucket named `meditations`
4. Copy URL and keys to `.env.local`

### 2. AI (Kimi)

1. Get API key from [moonshot.cn](https://moonshot.cn)
2. Add `KIMI_API_KEY` to `.env.local`

### 3. Voice (ElevenLabs)

1. Get API key from [elevenlabs.io](https://elevenlabs.io)
2. Add `ELEVENLABS_API_KEY` to `.env.local`
3. Set `GENERATE_AUDIO=true` to enable

### 4. Payments (Stripe)

1. Get keys from [stripe.com](https://stripe.com)
2. Create products and prices
3. Setup webhook endpoint: `/api/webhooks/stripe`

## Project Structure

```
mindflow/
├── app/
│   ├── page.tsx              # Landing
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Styles
│   ├── onboarding/           # 5-step onboarding
│   ├── meditate/             # Meditation player
│   ├── history/              # Past meditations & stats
│   └── api/
│       ├── generate/         # AI meditation generation
│       ├── voice/            # TTS synthesis
│       └── webhooks/stripe/  # Stripe webhooks
├── lib/
│   ├── kimi.ts               # Kimi/DeepSeek AI client
│   ├── elevenlabs.ts         # ElevenLabs TTS client
│   └── supabase.ts           # Database client
├── supabase/
│   └── migrations/           # Database schema
├── package.json
├── next.config.js
├── tailwind.config.ts
└── .env.example
```

## Features

- 5-step onboarding (stress level, goals, duration, time, triggers)
- AI-generated personalized meditation scripts
- Natural voice synthesis (Polish language)
- Mood tracking before/after
- History and statistics
- Freemium model with Stripe

## Meditation Philosophy

Based on advanced techniques:
- Heart-centered awareness (shifting perception from head to heart)
- Chakra work (root/red, heart/green, crown/white)
- Smiling to atoms - visualizing body cells responding to inner smile
- Bubbles of love - wrapping thoughts and experiences in love
- Gratitude/love amplification ("How would it feel 2x stronger?")
- Earth/Universe energy connection
- Infinity mindset - abundance for all

## License

MIT

---

Built by [Exhuman](https://github.com/exhuman777)
