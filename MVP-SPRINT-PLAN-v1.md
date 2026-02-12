# EnHub MVP Sprint Plan

**Timeline:** Feb 12 – Mar 14, 2026 (4.5 weeks)
**Team:** Dev A (n8n, DB, backend) · Dev B (React, frontend, DB)
**Goal:** Production-ready MVP with email-only unified inbox, AI auto-reply drafts, and lead scoring.

**For refference** Dev A - @Chenuka-Garusinghe, Dev B - Wesly

---

## High-Level Milestones

| Date         | Milestone             | Gate                                                                      |
| ------------ | --------------------- | ------------------------------------------------------------------------- |
| Feb 14 (Fri) | **M0 — Foundations**  | Repo setup, DB schema live, Supabase auth working, n8n instance running   |
| Feb 21 (Fri) | **M1 — Data Layer**   | Frontend reads/writes real data; n8n ingests emails into Supabase         |
| Feb 28 (Fri) | **M2 — Core Loop**    | End-to-end: email arrives → AI drafts reply → agent approves → email sent |
| Mar 7 (Fri)  | **M3 — Intelligence** | Lead scoring live; dashboard shows real hot leads; call briefs generated  |
| Mar 14 (Fri) | **M4 — Ship**         | Polish, edge cases, deploy to production, real email account connected    |

---

## Sprint 0 — Foundations (Feb 12–14, 3 days)

**Goal:** Everyone can develop independently by end of day Friday.

### Dev A (n8n + Backend)

| Task                                                          | Est. | Notes                                                        |
| ------------------------------------------------------------- | ---- | ------------------------------------------------------------ |
| Set up n8n instance (cloud or Docker on a VPS)                | 2h   | Cloud is faster; self-host if you need IMAP node flexibility |
| Create test email account (Gmail or custom domain)            | 30m  | This is what n8n will poll                                   |
| Build skeleton n8n workflow: IMAP trigger → log to console    | 1h   | Prove email ingestion works                                  |
| Create Supabase project, run migration SQL from README        | 2h   | Tables: profiles, contacts, enquiries, messages              |
| Set up Row Level Security (RLS) policies                      | 2h   | Basic: users can only read/write their own data              |
| Test: insert a mock enquiry + messages via Supabase dashboard | 30m  |                                                              |

### Dev B (Frontend)

| Task                                                                             | Est. | Notes                                                                      |
| -------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------- |
| Init Next.js 14 project (App Router) with TypeScript                             | 1h   | `npx create-next-app@latest --typescript --tailwind --app`                 |
| Port Tailwind config, CSS variables, and shadcn/ui components from Lovable       | 3h   | Copy `tailwind.config.ts`, `index.css`, and entire `components/ui/` folder |
| Port pages: Landing, Home, Index (Inbox), Settings                               | 3h   | Adapt `react-router-dom` → Next.js App Router (file-based routing)         |
| Replace `react-router-dom` with Next.js `Link` / `useRouter` / `useSearchParams` | 2h   |                                                                            |
| Install Supabase client: `@supabase/supabase-js`, `@supabase/ssr`                | 1h   | Set up `lib/supabase/client.ts` and `lib/supabase/server.ts`               |
| Verify app runs locally with mock data                                           | 1h   |                                                                            |

### Shared

| Task                                                      | Est. | Notes                                |
| --------------------------------------------------------- | ---- | ------------------------------------ |
| Create GitHub repo with branch protection on `main`       | 30m  | Work on feature branches, PR to main |
| Set up `.env.local` with Supabase keys                    | 15m  |                                      |
| Agree on API contract: endpoints, request/response shapes | 1h   | See README for proposed routes       |

**Sprint 0 Deliverable:** Next.js app running locally with ported UI. Supabase DB provisioned with schema. n8n receiving test emails.

---

## Sprint 1 — Data Layer (Feb 15–21, 7 days)

**Goal:** Frontend reads real data from Supabase. n8n writes inbound emails to Supabase.

### Dev A

| Task                                                                       | Est. | Notes                                              |
| -------------------------------------------------------------------------- | ---- | -------------------------------------------------- |
| n8n workflow: parse inbound email → extract sender, subject, body          | 3h   | Use n8n's Email Read (IMAP) node                   |
| n8n workflow: upsert contact in Supabase (match by email)                  | 2h   | Use n8n Supabase node or HTTP Request node         |
| n8n workflow: create enquiry if new, or find existing by contact+subject   | 3h   | Matching logic: same sender email + subject prefix |
| n8n workflow: insert message row (sender='client', status='sent')          | 2h   |                                                    |
| Create Next.js API routes: `GET /api/enquiries`, `GET /api/enquiries/[id]` | 3h   | Server-side Supabase queries with auth             |
| Create Next.js API route: `GET /api/messages?enquiry_id=X`                 | 2h   |                                                    |
| Create Next.js API route: `POST /api/messages` (agent sends manual reply)  | 2h   |                                                    |
| Set up Supabase Auth (email/password for MVP)                              | 2h   | Middleware to protect routes                       |

### Dev B

| Task                                                                      | Est. | Notes                                            |
| ------------------------------------------------------------------------- | ---- | ------------------------------------------------ |
| Create `useEnquiries` hook — fetches from API, replaces mock data         | 3h   | Use React Query (`@tanstack/react-query`)        |
| Create `useMessages` hook — fetches messages for selected enquiry         | 2h   |                                                  |
| Wire up `EnquiryList` to real data                                        | 2h   | Loading states, empty states                     |
| Wire up `EnquiryDetail` to real data                                      | 3h   | Messages from API, not mock                      |
| Implement Supabase Realtime subscription for new messages                 | 3h   | `supabase.channel('messages').on('INSERT', ...)` |
| Build auth pages: login, signup (simple — use Supabase Auth UI or custom) | 4h   | Redirect to `/dashboard` on success              |
| Protect routes with middleware (redirect to `/login` if unauthenticated)  | 2h   | Next.js middleware.ts                            |

**Sprint 1 Deliverable:** Send a test email → it appears in the inbox within 2 minutes. Agent can view real conversations. Auth works.

---

## Sprint 2 — Core Loop (Feb 22–28, 7 days)

**Goal:** Complete email round-trip. AI drafts replies. Agent approves and sends.

### Dev A

| Task                                                                                       | Est. | Notes                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| n8n workflow: Reply Drafting Agent                                                         | 6h   | Triggered when new client message is stored. Load conversation history from Supabase → LLM (OpenAI/Claude) generates reply → Store as message with `status: pending_approval` |
| n8n workflow: Send Reply via SMTP                                                          | 3h   | Triggered by webhook from Next.js. Load message → send via SMTP node → update message status to 'sent'                                                                        |
| Create Next.js API route: `POST /api/messages/[id]/approve`                                | 2h   | Updates status, calls n8n webhook to trigger SMTP send                                                                                                                        |
| Create Next.js API route: `PUT /api/messages/[id]` (edit draft)                            | 2h   | Agent edits AI draft before approving                                                                                                                                         |
| n8n: configure LLM prompt with system prompt (real estate context, tone, property details) | 3h   | Iterate on prompt quality — this is critical                                                                                                                                  |
| n8n: handle email threading (In-Reply-To / References headers)                             | 2h   | So replies appear in the same thread in client's inbox                                                                                                                        |
| Create webhook endpoint: `POST /api/webhooks/n8n`                                          | 2h   | For n8n to push updates to the app (e.g., draft ready notification)                                                                                                           |

### Dev B

| Task                                                                            | Est. | Notes                                                 |
| ------------------------------------------------------------------------------- | ---- | ----------------------------------------------------- |
| Implement "Approve & Send" button → calls approve API → optimistic UI update    | 3h   | Button already exists in Lovable code, wire it up     |
| Implement "Edit" flow for AI drafts — inline edit → save → approve              | 4h   | Textarea replaces message bubble, save calls PUT API  |
| Implement manual reply composer → calls POST /api/messages                      | 3h   | The textarea at bottom of conversation                |
| Real-time update when AI draft arrives (Supabase Realtime)                      | 2h   | Draft appears in conversation without refresh         |
| Add toast notifications for key events (draft ready, message sent, send failed) | 2h   | Already have Sonner/Toaster in the project            |
| Loading/sending states on all buttons                                           | 2h   | Disable button, show spinner while API call in flight |
| Error handling: display failures gracefully                                     | 2h   | Toast on API errors, retry option                     |

**Sprint 2 Deliverable:** Email arrives → AI drafts reply (visible in inbox) → agent approves → reply lands in sender's inbox. Full round-trip working.

---

## Sprint 3 — Intelligence (Mar 1–7, 7 days)

**Goal:** Lead scoring is live. Dashboard shows real prioritized leads. Call briefs generated.

### Dev A

| Task                                                                      | Est. | Notes                                                                                                                                                                    |
| ------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| n8n workflow: Lead Scoring Agent                                          | 6h   | Runs on schedule (every 5 min) or triggered per new message. Loads active enquiries + messages → LLM evaluates for buying signals → outputs temperature + whyHot signals |
| n8n: store scoring results (update enquiry temperature, call_brief JSONB) | 2h   |                                                                                                                                                                          |
| n8n: define scoring prompt — signal taxonomy, evidence extraction         | 4h   | Key signals: finance pre-approval, inspection requests, urgency language, budget mention, timeline mention                                                               |
| n8n: Call Brief generation for hot leads                                  | 3h   | Generate: suggestedOpening, strategyAngle, whyHot[], budgetRange, timeframe, motivations, sensitivities                                                                  |
| Optimize n8n workflows: error handling, retries, logging                  | 3h   | Don't lose messages on transient failures                                                                                                                                |
| Set up n8n webhook for real-time score push (not just polling)            | 2h   | When score changes, push update to Supabase                                                                                                                              |

### Dev B

| Task                                                                                    | Est. | Notes                                                               |
| --------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------- |
| Wire Dashboard (`/dashboard`) to real data                                              | 4h   | Stats from API (auto-handled count, promoted count, waiting count)  |
| Wire priority call queue to real hot leads from Supabase                                | 3h   | Replace mockEnquiries with real query filtered by temperature='hot' |
| Display CallBrief panel in inbox detail (already built, wire to real data)              | 2h   |                                                                     |
| Display "Why Hot" signals banner in conversation thread                                 | 1h   | Already built, just needs real data                                 |
| Implement temperature badge updates in real-time (Supabase Realtime on enquiries table) | 2h   | When lead scorer updates temperature, UI reflects immediately       |
| Settings page: wire up AI auto-reply toggle                                             | 2h   | Store preference in profiles table, n8n checks before drafting      |
| Settings page: wire up notification preferences                                         | 2h   |                                                                     |
| Create API route: `GET /api/stats` for dashboard numbers                                | 2h   | Aggregate queries on enquiries/messages tables                      |

**Sprint 3 Deliverable:** Emails are scored. Hot leads surface in dashboard with call briefs. Agent sees real-time temperature changes.

---

## Sprint 4 — Ship (Mar 8–14, 7 days)

**Goal:** Production deployment. Polish. Real email account. Bug fixes.

### Dev A

| Task                                                                         | Est. | Notes                           |
| ---------------------------------------------------------------------------- | ---- | ------------------------------- |
| Connect production email account (agent's real email)                        | 2h   | Update IMAP/SMTP creds in n8n   |
| Set up n8n production environment (if self-hosted: proper VPS, SSL, backups) | 4h   | Or use n8n Cloud for simplicity |
| Security review: webhook auth (shared secret), RLS policies, API route auth  | 3h   |                                 |
| Load testing: simulate 50+ emails, verify n8n handles queue without dropping | 3h   |                                 |
| Edge cases: duplicate emails, empty bodies, HTML-only emails, attachments    | 4h   | Parse gracefully, don't crash   |
| Monitoring: set up n8n execution alerts, Supabase alerts                     | 2h   |                                 |
| Write deployment docs for n8n workflows (export JSON, env vars)              | 2h   |                                 |

### Dev B

| Task                                                                       | Est. | Notes                                        |
| -------------------------------------------------------------------------- | ---- | -------------------------------------------- |
| Deploy to Vercel (connect GitHub repo)                                     | 1h   | Set env vars in Vercel dashboard             |
| Custom domain setup (if applicable)                                        | 1h   |                                              |
| Responsive/mobile polish — inbox should work on tablet at minimum          | 4h   | The Lovable UI is desktop-first              |
| Empty states, loading skeletons, error boundaries                          | 3h   |                                              |
| Keyboard shortcuts: ↑/↓ to navigate enquiries, Enter to open, Esc to close | 3h   | Nice-to-have but improves speed              |
| Final UI polish: animations, transitions, micro-interactions               | 3h   | Leverage existing Framer Motion setup        |
| Cross-browser testing (Chrome, Safari, Firefox)                            | 2h   |                                              |
| Write user-facing onboarding flow or tooltips                              | 2h   | First-time setup: connect email instructions |

### Shared

| Task                                         | Est. | Notes                        |
| -------------------------------------------- | ---- | ---------------------------- |
| End-to-end testing with real emails          | 4h   | Both devs test the full flow |
| Bug bash: each person tests the other's work | 3h   |                              |
| Demo prep / recording                        | 2h   |                              |

**Sprint 4 Deliverable:** App deployed to production. Real emails flowing. Demo-ready.

---

## Buffer / Overflow (Mar 15–18)

If anything slips, these 3 extra days catch:

- n8n prompt iteration (reply quality is never "done")
- Edge cases from real-world email testing
- Performance issues under load
- Any auth/security gaps found during review

---

## Risk Register

| Risk                                                         | Likelihood | Impact | Mitigation                                                                |
| ------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------- |
| n8n email parsing breaks on complex HTML emails              | High       | Medium | Use n8n's built-in HTML-to-text; test with diverse email clients early    |
| LLM reply quality isn't good enough                          | Medium     | High   | Start prompt iteration in Sprint 2, not Sprint 3. Use real email samples. |
| Supabase Realtime connection drops                           | Low        | Medium | Reconnection logic in the hook; fall back to polling every 10s            |
| Email threading doesn't work (replies appear as new threads) | Medium     | Medium | Prioritize In-Reply-To/References headers in Sprint 2                     |
| Scope creep (adding channels, features beyond MVP)           | High       | High   | Strict scope: email only, core loop only. Park everything else.           |
| One dev gets blocked/sick                                    | Medium     | High   | Both devs understand full stack; pair-program on critical paths           |

---

## Decision Log

| Decision                                | Rationale                                                                 | Date   |
| --------------------------------------- | ------------------------------------------------------------------------- | ------ |
| Email only for MVP                      | Fastest to integrate (IMAP/SMTP are universal); proves the core AI loop   | Feb 12 |
| n8n for AI workflows                    | Dev A has experience; visual workflow builder; easy to iterate on prompts | Feb 12 |
| Next.js over Vite                       | Need API routes for backend; Vercel deployment is seamless                | Feb 12 |
| Supabase over custom backend            | Auth + Realtime + PostgreSQL in one; minimal backend code needed          | Feb 12 |
| Recycle Lovable UI                      | Saves 2+ weeks of frontend design/build; focus effort on backend + AI     | Feb 12 |
| `pending_approval` flow (not auto-send) | Safety net for MVP — agent always reviews AI drafts before they go out    | Feb 12 |

---

## Daily Standup Template

Each morning (async or sync), answer:

1. What did I ship yesterday?
2. What am I shipping today?
3. Am I blocked on anything?

Track progress against the sprint task tables above. If a task is taking 2x longer than estimated, flag it immediately and discuss scope reduction.

---

## Key Technical Notes

### Migrating Lovable → Next.js

The Lovable codebase is a standard Vite + React Router app. Migration to Next.js App Router involves:

1. **Routing:** Replace `react-router-dom` `<Routes>` / `<Route>` with file-based routing (`app/page.tsx`, `app/dashboard/page.tsx`, etc.).
2. **Navigation:** Replace `useNavigate()` with `useRouter()` from `next/navigation`. Replace `<Link>` from react-router with Next.js `<Link>`.
3. **Search params:** Replace `useSearchParams` from react-router with `useSearchParams` from `next/navigation`.
4. **Static assets:** Move `public/` and `src/assets/` to Next.js `public/` directory.
5. **Components:** All shadcn/ui components, `EnquiryList`, `EnquiryDetail`, `AppSidebar`, etc. port directly — they're pure React with no router dependency (except navigation, handled above).
6. **CSS:** Copy `index.css` (with CSS variables) and `tailwind.config.ts` directly. Install same Tailwind plugins.
7. **Framer Motion:** Works identically in Next.js.
8. **Remove:** `vite.config.ts`, `react-router-dom`, `lovable-tagger`, Vite-specific imports.

### n8n ↔ Supabase Communication

Two patterns:

- **n8n → Supabase:** Use the Supabase node in n8n (or HTTP Request with service role key) to read/write data.
- **Supabase → n8n:** Use Supabase Database Webhooks (or Supabase Edge Functions) to call n8n webhook URLs when rows are inserted/updated.

### n8n ↔ Next.js Communication

- **n8n → Next.js:** n8n calls `POST /api/webhooks/n8n` with a shared secret in the header. Payload contains the event (e.g., "draft_ready", "score_updated").
- **Next.js → n8n:** API routes call n8n webhook URLs (e.g., to trigger "send reply" workflow when agent approves).
