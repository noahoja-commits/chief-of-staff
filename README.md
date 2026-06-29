# Chief of Staff

AI-powered relationship and task management system — your personal command center.

## What was built

This is a full-stack Next.js 14 web app that continues the Manus chat task that stopped at step 4/6.

### Architecture
- **Frontend**: Next.js 14 App Router + React + Tailwind CSS (dark "command center" theme)
- **Backend**: tRPC v11 with type-safe API routes
- **Auth**: NextAuth.js with Credentials provider (email/password)
- **Database**: Prisma ORM + SQLite (easy to swap to PostgreSQL)
- **AI**: User-provided OpenAI or Anthropic API keys, encrypted at rest with AES-256-GCM

### Features
- **Dashboard** — Daily briefing with tasks, reminders, follow-ups, and stats
- **AI Assistant** — Natural language creation of contacts, tasks, reminders, follow-ups
- **CRM** — Contacts & companies management
- **Tasks & Reminders** — Create, track, toggle completion, set priorities
- **Follow-ups** — Track relationship follow-ups linked to contacts
- **Calendar** — Month view with events from tasks, reminders, and follow-ups
- **Settings** — Per-user encrypted API keys (OpenAI/Anthropic), timezone, provider preference

### File structure
```
chief-of-staff/
  prisma/schema.prisma          # Database schema
  src/
    app/                        # Next.js App Router pages
      api/
        auth/[...nextauth]/     # NextAuth handler
        auth/register/          # Sign-up API
        trpc/[trpc]/            # tRPC API handler
      dashboard/                # Dashboard page
      assistant/                # AI chat page
      crm/                      # Contacts & companies
      tasks/                    # Tasks & reminders
      follow-ups/               # Follow-ups tracker
      calendar/                 # Calendar view
      settings/                 # API keys & preferences
      layout.tsx                # Root layout with dark theme
      page.tsx                  # Login / Sign-up page
      providers.tsx             # TRPC + QueryClient + NextAuth providers
    components/
      Sidebar.tsx               # App navigation sidebar
      Calendar.tsx              # Calendar month grid (7-column fix)
    lib/
      aiAssistant.ts            # NL parsing + action execution
      providerLLM.ts            # OpenAI & Anthropic API wrappers
      crypto.ts                 # AES-256-GCM encrypt/decrypt
    server/
      db.ts                     # Prisma client singleton
      auth.ts                   # NextAuth config
      api/
        trpc.ts                 # tRPC context + middleware
        root.ts                 # Router merger
        routers/                # 8 tRPC routers
```

## Getting started

### 1. Copy environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```bash
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-32-char-random-string"
APP_ENCRYPTION_KEY="any-32-char-random-string"
```

### 2. Install dependencies
```bash
cd chief-of-staff
npm install
```

### 3. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run the dev server
```bash
npm run dev
```

### 5. Sign up
Go to `http://localhost:3000`, create an account, then go to **Settings** to add your OpenAI or Anthropic API key.

## Security notes
- API keys are encrypted with AES-256-GCM using `APP_ENCRYPTION_KEY` before being stored in the database.
- Decryption happens server-side only.
- `APP_ENCRYPTION_KEY` must be at least 32 characters and kept secret.

## To deploy
1. Change `DATABASE_URL` to a PostgreSQL or MySQL connection string.
2. Update `NEXTAUTH_URL` to your production URL.
3. Set `APP_ENCRYPTION_KEY` in your hosting environment secrets.
4. Run `prisma generate && prisma db push` on the server.
