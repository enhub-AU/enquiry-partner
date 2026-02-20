Here's what you need to do to get this running end-to-end:

1. Supabase Project Setup

If you don't already have one, create a project at https://supabase.com. Then:

Run the migrations in order via the Supabase SQL Editor:

1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_seed_data.sql (optional — uses mock UUIDs, skip for now)
3. supabase/migrations/003_mvp_extensions.sql

4. Environment Variables

Copy the example and fill in real values:

cp .env.local.example .env.local

You need to set:

- NEXT_PUBLIC_SUPABASE_URL — from Supabase dashboard > Settings > API
- NEXT_PUBLIC_SUPABASE_ANON_KEY — same location
- SUPABASE_SERVICE_ROLE_KEY — same location (keep secret)
- N8N_WEBHOOK_SECRET — pick any strong string (e.g. openssl rand -hex 32)
- N8N_WEBHOOK_URL — leave empty for now unless you have n8n running
- NEXT_PUBLIC_APP_URL — http://localhost:3000

3. Supabase Auth Setup

In Supabase dashboard > Authentication > Providers:

- Enable Email provider (enable "Confirm email" or disable it for faster testing)
- Set the site URL to http://localhost:3000
- Add http://localhost:3000/api/auth/callback to redirect URLs

4. Start the App

npm run dev

5. Test Flow

Sign up & onboarding

1. Go to http://localhost:3000/login and sign up
2. You'll be redirected to /onboarding — select "Demo Agency"
3. You'll land on the dashboard (empty — no enquiries yet)

Create test data via webhook

Open a terminal and send a test enquiry:

curl -X POST http://localhost:3000/api/webhooks/inbound-enquiry \
 -H "Content-Type: application/json" \
 -H "Authorization: https://chenuka-garusinghe.app.n8n.cloud/webhook-test/send-reply" \
 -d '{
"agent_email": "chenukagarusinghe8@gmail.com",
"client_name": "Sarah Mitchell",
"client_email": "sarah.m@gmail.com",
"client_phone": "0412 345 678",
"subject": "Inspection request — 42 Harbour View Drive",
"body": "Hi, I would love to arrange a private inspection this weekend. Is the price guide still current?",
"category": "inspection",
"property_address": "42 Harbour View Drive, Mosman",
"property_price_guide": "$4,200,000 – $4,600,000",
"source": "REA",
"ai_draft": "Good afternoon Sarah, the current price guide is $4,200,000 – $4,600,000. I would be happy to arrange a private
inspection — would Saturday or Sunday work better?"
}'

Replace YOUR_N8N_WEBHOOK_SECRET_HERE and YOUR_SIGNUP_EMAIL_HERE with your actual values.

Verify in the app

1. Inbox — the enquiry should appear with the AI draft pending approval
2. Approve the draft — click "Approve & Send"
3. Reply — type a message in the composer and send
4. Dashboard — stats should update (1 waiting, etc.)

Test hot lead promotion

curl -X POST http://localhost:3000/api/webhooks/update-enquiry \
 -H "Content-Type: application/json" \
 -H "Authorization: Bearer YOUR_N8N_WEBHOOK_SECRET_HERE" \
 -d '{
"enquiry_id": "ENQUIRY_ID_FROM_FIRST_CURL",
"content": "Saturday works perfectly, can I bring my partner too?",
"is_inspection_request": true
}'

This should promote the lead to Hot and trigger a notification (check the bell icon).

Test settings persistence

1. Go to Settings, change AI mode to "Auto-send safe replies"
2. Refresh the page — the setting should persist

Test realtime

Open two browser tabs on /inbox — actions in one should update the other.

6. n8n Setup (when ready)

This is the part you said you'd handle separately. n8n needs to:

1. Watch your email inbox for new enquiries
2. Call POST /api/webhooks/inbound-enquiry with the parsed email data
3. Call POST /api/webhooks/update-enquiry when replies arrive
4. Listen for POST /send-reply callbacks to actually send emails via SMTP
