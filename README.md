# EnHub — AI-Powered Unified Inbox for Real Estate

EnHub is an AI-first lead management platform for real estate agents. It consolidates enquiries from email, SMS, WhatsApp, web forms, social media, and property portals into a single unified inbox. An AI agent reads and responds to incoming messages, while a second agent continuously evaluates conversation history to classify leads as **hot**, **warm**, or **cold** — surfacing ready-to-call buyers in real time.

---

## Product Overview

### Core Value Proposition

Real estate agents lose deals because they respond too slowly or miss high-intent signals buried in a flood of enquiries. EnHub solves this by:

1. **Auto-responding** to inbound enquiries with context-aware, on-brand replies (agent reviews/approves before send).
2. **Scoring leads** in real time — tagging hot leads with evidence ("pre-approved finance", "requested private inspection") so agents know exactly who to call first.
3. **Unifying all channels** — no more switching between email, WhatsApp, portal inboxes, and DMs.

### Key Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Landing | `/` | Marketing page with product overview, how-it-works, and CTA |
| Dashboard | `/dashboard` | Greeting, stats (auto-handled, promoted, waiting), priority call queue |
| Inbox | `/inbox` | Three-column unified inbox: enquiry list → conversation thread → context panel |
| Settings | `/settings` | Profile, integrations, AI behaviour, notification preferences |

### Lead Classification (to be further decided)

| Temperature | Meaning | Action |
|-------------|---------|--------|
| 🔥 Hot | High-intent buyer/seller with strong signals | Call now — appears in dashboard priority queue |
| 🟡 Warm | Engaged but still exploring | AI continues nurturing conversation |
| 🔵 Cold | Low intent or informational | AI handles autonomously |

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | **Next.js** (React) | Recycled from Lovable prototype; Tailwind CSS + shadcn/ui + Framer Motion |
| Backend / API | **Next.js API Routes** | Lightweight REST endpoints for the frontend |
| Database | **Supabase** (PostgreSQL) | Auth, real-time subscriptions, row-level security |
| AI / Workflows | **n8n** (cloud or self-hosted) | Hosts email-reading agent, reply-drafting agent, and lead-scoring agent |
| Deployment | **Vercel** | Frontend + API routes |
| Email Integration | **IMAP/SMTP via n8n** | Initial channel; others follow post-MVP |

---

## Architecture
(from AI Gen ASCII)
```
┌─────────────────────────────────────────────────────────┐
│                     VERCEL (Next.js)                    │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Landing   │  │  Dashboard   │  │  Unified Inbox   │ │
│  │  /         │  │  /dashboard  │  │  /inbox          │ │
│  └───────────┘  └──────────────┘  └──────────────────┘ │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Next.js API Routes                     │   │
│  │  /api/enquiries  /api/messages  /api/leads        │   │
│  │  /api/auth/*     /api/webhooks/n8n                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐    ┌──────────────────────────┐
│    SUPABASE      │    │       n8n (Workflows)    │
│  ┌────────────┐  │    │  ┌────────────────────┐  │
│  │  Auth      │  │    │  │ Email Reader Agent  │  │
│  │  Database  │◄─┼────┼──│ Reply Drafter Agent │  │
│  │  Realtime  │  │    │  │ Lead Scorer Agent   │  │
│  └────────────┘  │    │  └────────────────────┘  │
└──────────────────┘    └──────────────────────────┘
```

**Data flow:**
1. n8n polls/receives inbound emails (IMAP or webhook).
2. Email Reader agent parses the message, extracts intent, and stores it in Supabase as a new enquiry/message.
3. Reply Drafter agent generates a context-aware draft reply, stored with `status: pending_approval`.
4. Frontend receives real-time update via Supabase Realtime; agent sees draft in inbox.
5. Agent approves/edits → API route triggers n8n to send the email via SMTP.
6. Lead Scorer agent runs periodically (or on new message) across all conversations, updating temperature + generating `callBrief` and `whyHot` signals.

---

## Database Schema (Supabase) (Need corss checking with @WeslyYong)

```sql
-- Users / Agents
create table profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  email text,
  phone text,
  agency_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Contacts (clients/leads)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  name text not null,
  email text,
  phone text,
  created_at timestamptz default now()
);

-- Enquiries (conversations)
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  contact_id uuid references contacts(id),
  channel text not null default 'email',
  subject text,
  temperature text not null default 'cold',  -- hot | warm | cold
  property_address text,
  property_price_guide text,
  property_status text default 'available',
  is_read boolean default false,
  last_activity_at timestamptz default now(),
  call_brief jsonb,  -- stores CallBrief object
  created_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references enquiries(id) on delete cascade,
  sender text not null,          -- 'client' | 'ai' | 'agent'
  content text not null,
  channel text not null,
  status text default 'sent',    -- 'pending_approval' | 'sent' | 'edited' | 'failed'
  metadata jsonb,                -- original email headers, message-id, etc.
  created_at timestamptz default now()
);

-- Indexes
create index idx_enquiries_profile on enquiries(profile_id);
create index idx_enquiries_temperature on enquiries(temperature);
create index idx_messages_enquiry on messages(enquiry_id);
create index idx_messages_created on messages(created_at);
```

---

## Project Structure (Next.js) (MVP only!)

```
enhub/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing
│   │   ├── dashboard/page.tsx         # Dashboard
│   │   ├── inbox/page.tsx             # Unified Inbox
│   │   ├── settings/page.tsx          # Settings
│   │   └── api/
│   │       ├── auth/[...supabase]/route.ts
│   │       ├── enquiries/route.ts     # GET list, POST new
│   │       ├── enquiries/[id]/route.ts
│   │       ├── messages/route.ts      # GET by enquiry, POST new
│   │       ├── messages/[id]/approve/route.ts
│   │       └── webhooks/
│   │           └── n8n/route.ts       # Inbound from n8n
│   ├── components/
│   │   ├── AppSidebar.tsx
│   │   ├── EnquiryList.tsx
│   │   ├── EnquiryDetail.tsx
│   │   ├── CallBriefPanel.tsx
│   │   ├── PropertyCard.tsx
│   │   └── ui/                        # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client
│   │   │   └── server.ts              # Server client
│   │   ├── channelConfig.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useEnquiries.ts
│   │   ├── useMessages.ts
│   │   └── useRealtimeInbox.ts
│   └── types/
│       └── enquiry.ts
├── supabase/
│   └── migrations/
├── .env.local
├── next.config.js
├── tailwind.config.ts
└── package.json
```

---

## Getting Started quickly

### Prerequisites

- Node.js 18+
- Supabase project (free tier works for MVP)
- n8n instance (cloud or Docker)
- Vercel account

### Installation

```bash
git clone https://github.com/<your-org>/enhub.git
cd enhub
npm install
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n webhook URL (for sending approved replies)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/send-reply
N8N_WEBHOOK_SECRET=shared-secret-for-auth

# Email config (used by n8n, listed here for reference)
# IMAP_HOST, IMAP_USER, IMAP_PASSWORD
# SMTP_HOST, SMTP_USER, SMTP_PASSWORD
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## n8n Workflows

### 1. Email Ingestion Workflow
- **Trigger:** IMAP polling (every 1–2 min) or email webhook
- **Steps:** Parse email → Match to existing enquiry or create new → Store message in Supabase → Trigger reply drafting

### 2. Reply Drafting Workflow
- **Trigger:** New client message stored in Supabase
- **Steps:** Load conversation history → LLM generates reply draft → Store as message with `status: pending_approval` → (Optional) notify agent via push/email

### 3. Lead Scoring Workflow
- **Trigger:** Scheduled (every 5 min) or on new message event
- **Steps:** Load all active enquiries → LLM evaluates conversation history for buying signals → Update `temperature` + `call_brief` in Supabase

### 4. Send Reply Workflow
- **Trigger:** Webhook from Next.js API (agent approved/sent message)
- **Steps:** Load message → Send via SMTP → Update message `status: sent`

---

## MVP Scope

### In Scope (MVP)
- Email channel only (IMAP/SMTP)
- Supabase auth (magic link or email/password)
- Unified inbox with real-time updates
- AI draft replies with approve/edit/send flow
- Lead temperature scoring (hot/warm/cold)
- Dashboard with priority call queue
- Call brief generation for hot leads
- Basic settings (profile, AI toggle)

### Out of Scope (Post-MVP)
- WhatsApp, SMS, social media channels
- Property portal integrations (REA, Domain)
- Team/multi-agent support
- Advanced analytics & reporting
- Mobile app
- Custom AI training / fine-tuning
- Billing / subscription management

---

## Team

| Role | Focus Areas |
|------|-------------|
| **Dev A (@Chenuka-Garusinghe)** (n8n + Backend) | n8n workflows, Supabase schema/RLS, API routes, email integration |
| **Dev B (@WeslyYong)** (Frontend + DB) | Next.js migration, UI components, Supabase client, real-time subscriptions |

---

## License

Proprietary — all rights reserved.
