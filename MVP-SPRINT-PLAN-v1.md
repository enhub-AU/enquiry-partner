# EnHub MVP Sprint Plan (Simplified)

**Timeline:** Feb 12 – Mar 14, 2026 (4.5 weeks)
**Team:** Dev A (n8n, DB, backend) · Dev B (React, frontend, DB)
**Goal:** Email-only unified inbox with AI draft replies and hot lead surfacing.

---

## Milestones

| Date         | Milestone              | Gate                                                                |
| ------------ | ---------------------- | ------------------------------------------------------------------- |
| Feb 14 (Fri) | **M0 — Foundations**   | Repo, DB schema, auth, n8n running, UI ported                       |
| Feb 25 (Tue) | **M1 — Core Loop**     | Email → AI draft → agent approves → reply sent (end-to-end working) |
| Mar 7 (Fri)  | **M2 — Polish & Ship** | Hot leads surfaced, dashboard live, deployed to production          |
| Mar 14 (Fri) | **Buffer**             | Bug fixes, prompt tuning, edge cases                                |

---

## Sprint 0 — Foundations (Feb 12–14, 3 days)

**Goal:** Everyone can develop independently by Friday.

### Dev A (n8n + Backend)

| Task                                                  | Est. |
| ----------------------------------------------------- | ---- |
| Create Supabase project, run `001_initial_schema.sql` | 1h   |
| Run `002_seed_data.sql` with test user UUID           | 15m  |
| Set up n8n locally (Docker or npx)                    | 1h   |
| Create test email account for n8n to poll             | 30m  |
| Import `enhub-email-ingestion.json` into n8n          | 30m  |
| Import `enhub-send-reply.json` into n8n               | 30m  |
| Set n8n env vars (SUPABASE_URL, key, profile ID)      | 15m  |

### Dev B (Frontend)

| Task                                            | Est. |
| ----------------------------------------------- | ---- |
| Port Lovable UI to Next.js 14 (App Router)      | 3h   |
| Install Supabase client, set up `lib/supabase/` | 1h   |
| Verify app runs locally with mock data          | 1h   |
| Set up `.env.local` with Supabase + n8n keys    | 15m  |

### Shared

| Task                                              | Est. |
| ------------------------------------------------- | ---- |
| GitHub repo with branch protection                | 30m  |
| Agree on API contract (routes already scaffolded) | 30m  |

**Deliverable:** Next.js running locally. Supabase schema live. n8n receiving test emails.

---

## Sprint 1 — Core Loop (Feb 15–25, 11 days)

**Goal:** Full email round-trip working end-to-end.

### Dev A

| Task                                                   | Est. |
| ------------------------------------------------------ | ---- |
| n8n: Connect Outlook trigger, test email ingestion     | 3h   |
| n8n: Tune Clean HTML node for real email formats       | 2h   |
| n8n: Configure AI prompt for real estate context       | 3h   |
| n8n: Test send-reply workflow (approve → email sent)   | 2h   |
| API routes: Wire enquiries + messages to real Supabase | 3h   |
| Set up Supabase Auth (email/password)                  | 2h   |
| Test end-to-end: email → inbox → approve → reply sent  | 2h   |

### Dev B

| Task                                                  | Est. |
| ----------------------------------------------------- | ---- |
| Create `useEnquiries` hook (fetch from API)           | 2h   |
| Create `useMessages` hook (fetch from API)            | 2h   |
| Wire EnquiryList + EnquiryDetail to real data         | 3h   |
| Implement "Approve & Send" button (calls approve API) | 2h   |
| Implement "Edit" flow for AI drafts                   | 3h   |
| Implement manual reply composer                       | 2h   |
| Supabase Realtime subscription for new messages       | 2h   |
| Auth pages (login/signup) + route protection          | 3h   |

**Deliverable:** Send email → appears in inbox → AI drafts reply → agent approves → reply lands in sender's inbox.

---

## Sprint 2 — Polish & Ship (Feb 26–Mar 7, 10 days)

**Goal:** Dashboard live, hot leads surfaced, deployed.

### Dev A

| Task                                            | Est. |
| ----------------------------------------------- | ---- |
| n8n: Classify enquiries (price_only auto-sends) | 3h   |
| n8n: Simple hot lead promotion (reply = hot)    | 2h   |
| Connect production email account                | 2h   |
| n8n production deployment (cloud or VPS)        | 3h   |
| Edge cases: empty bodies, HTML-only, duplicates | 3h   |
| Security review: webhook auth, RLS, API auth    | 2h   |

### Dev B

| Task                                            | Est. |
| ----------------------------------------------- | ---- |
| Wire Dashboard to real data (`GET /api/stats`)  | 3h   |
| Wire Call Now queue to real hot leads           | 2h   |
| Deploy to Vercel                                | 1h   |
| Loading states, empty states, error handling    | 3h   |
| Toast notifications (draft ready, sent, failed) | 2h   |
| Settings page: connect inbox, AI mode toggle    | 2h   |
| Responsive polish (tablet minimum)              | 3h   |

### Shared

| Task                                | Est. |
| ----------------------------------- | ---- |
| End-to-end testing with real emails | 3h   |
| Bug bash                            | 2h   |

**Deliverable:** App deployed. Real emails flowing. Hot leads surfaced in dashboard.

---

## Buffer (Mar 8–14)

- AI prompt iteration (reply quality)
- Edge cases from real email testing
- Performance under load
- Security gaps found during review

---

## Architecture (Simplified)

```
Email → n8n (poll inbox) → Supabase (store message) → AI draft → Supabase
                                                                    ↓
                                                              Next.js UI (Realtime)
                                                                    ↓
                                                           Agent approves draft
                                                                    ↓
                                                    Next.js → n8n webhook → Send email
```

**Data flow:**

- n8n reads/writes Supabase directly (service_role key, no RPC)
- Next.js reads Supabase via API routes (user auth, RLS)
- Next.js → n8n: only one webhook call (approve → send reply)
- n8n → Next.js: none (Supabase Realtime handles UI updates)

**Schema:** 4 tables — `profiles`, `contacts`, `enquiries`, `messages`
**No:** RPC functions, webhook endpoints in Next.js, complex scoring, call briefs

---

## Decision Log

| Decision                               | Rationale                                             |
| -------------------------------------- | ----------------------------------------------------- |
| Email only for MVP                     | Fastest to integrate; proves core AI loop             |
| n8n for AI workflows                   | Visual builder; easy to iterate on prompts            |
| Next.js over Vite                      | Need API routes; Vercel deployment                    |
| Supabase over custom backend           | Auth + Realtime + PostgreSQL in one                   |
| `pending_approval` flow (no auto-send) | Safety net — agent always reviews (except price-only) |
| No RPC functions                       | Keep DB schema simple; logic in n8n Code nodes        |
| No webhook endpoint in Next.js         | Supabase Realtime handles UI updates directly         |
| 3 sprints instead of 5                 | Reduce scope, ship faster                             |
