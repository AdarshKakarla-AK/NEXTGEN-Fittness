# NEXTGEN FITNESS

Premium gym management & fitness platform **demo** — a fully client-driven SaaS product for a single premium fitness club, built to showcase realistic, production-shaped flows end to end. The whole business runs on a local SQLite database that is auto-seeded with 120 days of believable demo data, so every screen is populated on first boot.

## Features

**Public website** (`/(site)`)
- Home, membership (4 tiers + comparison table), classes & weekly timetable, trainers, personal training, nutrition, about, success stories, gallery (lightbox), contact, FAQ, plus Coming-Soon pages for shop/blog/events/careers/corporate/franchise and full legal pages.
- Dark/light themes, generated SVG imagery, fully responsive.

**Authentication** (`/(auth)`)
- Login, 4-step registration wizard (personal → fitness → contact → plan + sandbox payment), and OTP-based password reset.
- Registration creates a real membership, payment, invoice, welcome/WhatsApp/invoice automations, coupon redemption and an audit trail.
- Signed, httpOnly session cookie; role-gated dashboards.

**Member portal** (`/portal`)
- Membership card with QR check-in, class booking (with waitlist + cancellation), progress charts (weight, workout volume, trends), nutrition plan + meal logs, alerts, support tickets, and achievements with XP/level/streak.

**Trainer portal** (`/portal/trainer`)
- Today's classes, PT sessions, coached-member progress cards (weight deltas), reviews.

**Receptionist portal** (`/portal/receptionist`)
- Live check-ins, today's bookings, follow-up leads, expiring memberships, support tickets, low-stock inventory.

**Admin portal** (`/portal/admin`)
- Business KPIs (MRR, ARPM, churn, retention, lead conversion), revenue/growth/attendance charts, plan distribution, lead funnel, payments ledger, recent audit activity, plus full admin tools: **Members** (search/filter, freeze/pause/renew/block), **Coupons** (create, enable/disable, usage tracking) and **Classes** (publish/hide, capacity, fill rate).

**Automation log** — every notification, OTP, invoice or booking confirmation is recorded in an `automationLogs` collection with a simulated/sent/failed status, visible to admins. Swap in real providers via webhooks (see `.env.example`).

## Tech stack

- **Next.js 16** (App Router, Turbopack, TypeScript strict)
- **Tailwind CSS v4** (design tokens, `night` dark surfaces, accent + volt theme)
- **SQLite** (`node:sqlite`, WAL mode) — zero external services
- **recharts**, **lucide-react**, **qrcode**, **bcryptjs**, **framer-motion**

## Getting started

Requires Node.js ≥ 20.

```bash
npm install
npm run dev        # http://localhost:3000
```

The database (`data/db.sqlite`) is created and seeded automatically on first boot. Session signing falls back to an auto-generated `data/secret.key` if `SESSION_SECRET` is unset.

```bash
npm run check      # eslint + tsc
npm run build      # production build (standalone)
npm run start      # production server (use: node .next/standalone/server.js)
```

> Note: the project builds with `output: "standalone"`, so `next start` will warn. Run the standalone server with `node .next/standalone/server.js` in production.

## Demo credentials

All accounts use password `demo123` (login page has one-click fill buttons).

| Role         | Email                        | Where |
| ------------ | ---------------------------- | ----- |
| Admin        | `admin@nextgenfitness.in`    | `/portal/admin` |
| Trainer      | `karan@nextgenfitness.in`    | `/portal/trainer` |
| Receptionist | `priya@nextgenfitness.in`    | `/portal/receptionist` |
| Member       | `rahul@example.com`          | `/portal` |

New members can also self-register at `/register` — payment runs in sandbox mode and instantly issues a Member ID, QR card and GST invoice.

## Reset the demo data

Delete the SQLite files and restart the server — it reseeds on boot:

```bash
rm data/db.sqlite data/db.sqlite-wal data/db.sqlite-shm
```

## Project structure

```
src/
  app/
    (site)/          public marketing pages
    (auth)/          login · register · reset
    portal/          authenticated dashboards (member, admin, trainer, receptionist)
    api/             route handlers: auth, contact, portal/*, admin/*
  components/
    site/            public marketing components
    auth/            login / register / reset forms
    portal/          dashboard components + charts
    ui.tsx           shared primitives (Button, Card, Badge, Field…)
  lib/
    db/              SQLite store, schema types, seed (120 days of demo data)
    auth.ts          session helpers           secret.ts  HMAC signing
    notify.ts        dispatch / notifications / audit
    analytics.ts     admin metrics (MRR, churn, retention, funnel…)
data/                runtime SQLite + auto-generated session secret (gitignored)
```

## Environment

See `.env.example` for every supported variable: session secret, Razorpay sandbox keys, outbound webhooks for WhatsApp/email automations, and analytics. Everything works out of the box with all of them unset.
