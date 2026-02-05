# AGENTS.md

## Overview

MindFlow - Next.js application with Supabase backend and Stripe payments.

## Status: In Development

Port 3004

## Commands

```bash
npm install
npm run dev      # Development on port 3004
npm run build    # Production build
npm run lint     # ESLint
```

## Stack

```
Framework:   Next.js 16
Auth/DB:     Supabase
Payments:    Stripe
State:       Zustand
Animation:   Framer Motion
Audio:       Howler.js
UI:          Tailwind CSS, Lucide icons
Language:    TypeScript
```

## Architecture

```
mindflow/
  app/           # Next.js app router
  components/    # React components
  lib/           # Utilities, Supabase client
  knowledge/     # Content/docs
```

## Environment

Required env vars (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Code Style

- TypeScript strict mode
- Tailwind + CVA for styling
- Zustand for state
- `clsx` + `tailwind-merge` for class composition

## Before Committing

```bash
npm run lint
npm run build
```

## Don't Touch

- `.env.local` (secrets)
- `node_modules/`
- Supabase migrations (coordinate with team)
