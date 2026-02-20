# Link-in-Bio SaaS

A Link-in-Bio SaaS starter built with Next.js 14, Prisma, NextAuth, Tailwind CSS, and Stripe.

## Prerequisites

- Node.js 18.17+ (Node 20 LTS recommended)
- npm 9+
- A PostgreSQL database (local Postgres, Supabase, Neon, etc.)

## 1) Clone and install dependencies

```bash
git clone <your-repo-url>
cd link-in-bio
npm install
```

## 2) Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

If `.env.example` is not present, create `.env` manually with values like:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

# Optional auth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
EMAIL_SERVER=""
EMAIL_FROM=""

# Stripe (required only for billing features)
STRIPE_SECRET_KEY=""
STRIPE_PRO_PRICE_ID=""
STRIPE_WEBHOOK_SECRET=""
```

## 3) Generate Prisma client and run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

> `prisma:migrate` will create/apply migrations against your configured `DATABASE_URL`.

## 4) Start the app

```bash
npm run dev
```

Then open: `http://localhost:3000`

## Useful scripts

- `npm run dev` – start development server
- `npm run build` – create production build
- `npm run start` – start production server
- `npm run lint` – run Next.js linting
- `npm run prisma:generate` – generate Prisma client
- `npm run prisma:migrate` – run Prisma migrations in development

## Project structure

- `app/` – routes, pages, layouts, API routes
- `components/` – reusable UI/components
- `lib/` – shared utilities, auth, Prisma, Stripe helpers
- `prisma/` – schema and database configuration
