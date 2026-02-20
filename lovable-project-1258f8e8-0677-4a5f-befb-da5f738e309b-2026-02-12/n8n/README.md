# EnHub n8n Workflows

Three workflows that connect your email inbox to EnHub.

## Workflows

### 1. `enhub-inbound-enquiry.json` — New Enquiry
**Gmail → AI Parse → AI Draft → EnHub webhook**

Polls Gmail for new unread emails, uses OpenAI to extract structured data (client name, category, property address, etc.), generates an AI draft reply, then sends everything to your EnHub app.

### 2. `enhub-handle-reply.json` — Reply Handling
**Gmail → Filter Replies → AI Parse → Lookup Enquiry → EnHub webhook**

Watches for reply emails (subject starts with "Re:"), parses them, looks up the existing enquiry in EnHub, and calls the update-enquiry webhook. Handles hot lead promotion logic (inspection requests, offer intent).

### 3. `enhub-send-reply.json` — Send Approved Reply
**Webhook ← EnHub → Send via SMTP**

Listens for callbacks from EnHub when a draft is approved or auto-sent. Sends the actual email via your SMTP server.

## Setup Instructions

### 1. Import into n8n
- Open n8n Cloud (or self-hosted)
- Go to Workflows → Import from File
- Import each JSON file

### 2. Create Credentials

You need these credentials in n8n:

| Credential | Type | Notes |
|-----------|------|-------|
| **Gmail** | Gmail OAuth2 | Connect your agent's Gmail account |
| **OpenAI** | OpenAI API | For AI parsing and draft generation |
| **EnHub Webhook Auth** | Header Auth | Name: `Authorization`, Value: `Bearer YOUR_N8N_WEBHOOK_SECRET` |
| **SMTP** | SMTP | For sending outbound emails (Gmail SMTP, SendGrid, etc.) |

### 3. Set Environment Variables

In n8n Settings → Variables, add:

| Variable | Value |
|----------|-------|
| `ENHUB_APP_URL` | `https://your-app.vercel.app` (or `http://localhost:3000` for dev) |
| `AGENT_EMAIL` | The agent's email address (must match their EnHub signup email) |

### 4. Replace Placeholder IDs

In each workflow JSON, search for `REPLACE_WITH_` and update with your actual credential IDs from n8n.

### 5. Differentiate New vs Reply Emails

The current setup uses two separate Gmail triggers. In practice, you may want to:
- Use a single Gmail trigger with a Code node that routes based on whether it's a new email or a reply
- Use Gmail labels/filters to separate enquiry emails from other mail
- Check the `threadId` to determine if it's part of an existing conversation

### 6. Activate

Turn on each workflow. Test by sending an email to your connected Gmail account.

## Flow Diagram

```
New Email → [Inbound Enquiry Workflow] → EnHub creates enquiry
                                              ↓
                                    Agent sees in inbox
                                              ↓
                                    Approves AI draft
                                              ↓
                              [Send Reply Workflow] → Email sent via SMTP
                                              ↓
                              Client replies to email
                                              ↓
Reply Email → [Handle Reply Workflow] → EnHub updates enquiry
                                              ↓
                                    Hot lead promotion + notification
```
