# GLAM'D Cebu — Setup Guide

## Live demo

**Production:** https://glamdcebu-six.vercel.app

## Local development

```bash
npm install
cp .env.example .env.local
# Paste the anon key from Supabase → Project Settings → API
npm run dev
```

Open **http://localhost:3000** — local uses the same Supabase database as production.

## Admin login

Works on **both** local and production (same Supabase project).

| | Local | Production |
|---|-------|------------|
| **URL** | http://localhost:3000/admin/login | https://glamdcebu-six.vercel.app/admin/login |

### Accounts

| Role | Email | Password |
|------|-------|----------|
| Christine (owner) | `christine@glamdcebu.com` | `GlamDAdmin2026!` |
| Developer (owner) | `admin@glamdcebu.com` | `GlamDAdmin2026!` |

Change these passwords after first login via [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Users.

In **Admin → Settings**, Christine can set the **Home Service Fee** for home-service bookings.

## Run Playwright tests

```bash
npx playwright install
npm run test:e2e
```

## Vercel environment variables

Set in Vercel project `glamdcebu`:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://cosejgazsghhvgdxwlfo.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Features

- Real booking with Supabase
- Live availability slots (1 hour per booking)
- Walk-in or home service
- Admin calendar with confirm/cancel
- Schedule overview (booking counts)
- PWA installable
- Playwright E2E test suite
