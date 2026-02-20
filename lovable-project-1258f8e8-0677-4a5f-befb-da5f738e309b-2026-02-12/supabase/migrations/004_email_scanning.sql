-- 004_email_scanning.sql
-- Replace n8n with in-code email scanning via IMAP

-- ============================================================
-- 1. email_accounts — stores IMAP/SMTP credentials per user
-- ============================================================
CREATE TABLE email_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label         text NOT NULL DEFAULT '',
  provider      text NOT NULL DEFAULT 'other'
                CHECK (provider IN ('gmail', 'outlook', 'yahoo', 'other')),

  -- IMAP
  imap_host     text NOT NULL,
  imap_port     integer NOT NULL DEFAULT 993,
  imap_user     text NOT NULL,
  imap_password_encrypted text NOT NULL,

  -- SMTP
  smtp_host     text,
  smtp_port     integer DEFAULT 587,
  smtp_user     text,
  smtp_password_encrypted text,

  -- Scan state
  last_scan_at    timestamptz,
  last_scan_error text,
  is_active       boolean NOT NULL DEFAULT true,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (profile_id, imap_user)
);

ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own email accounts"
  ON email_accounts FOR ALL
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ============================================================
-- 2. processed_emails — dedup + thread tracking
-- ============================================================
CREATE TABLE processed_emails (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_account_id    uuid NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
  message_id_header   text NOT NULL,
  uid                 integer,
  enquiry_id          uuid REFERENCES enquiries(id) ON DELETE SET NULL,
  thread_id           text,
  from_email          text,
  subject             text,
  processed_at        timestamptz NOT NULL DEFAULT now(),

  UNIQUE (email_account_id, message_id_header)
);

CREATE INDEX idx_processed_emails_account ON processed_emails(email_account_id);
CREATE INDEX idx_processed_emails_thread  ON processed_emails(email_account_id, thread_id);
CREATE INDEX idx_processed_emails_msgid   ON processed_emails(message_id_header);

ALTER TABLE processed_emails ENABLE ROW LEVEL SECURITY;

-- Service-role only — no direct user access needed
CREATE POLICY "Service role only for processed_emails"
  ON processed_emails FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================================
-- 3. Add OpenAI key column to agent_settings
-- ============================================================
ALTER TABLE agent_settings ADD COLUMN IF NOT EXISTS openai_api_key_encrypted text;
