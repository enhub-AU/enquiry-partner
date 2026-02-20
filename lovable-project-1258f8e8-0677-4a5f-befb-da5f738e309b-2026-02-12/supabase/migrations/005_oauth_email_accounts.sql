-- Add OAuth support to email_accounts
ALTER TABLE email_accounts
  ADD COLUMN auth_method text NOT NULL DEFAULT 'password'
    CHECK (auth_method IN ('password', 'oauth')),
  ADD COLUMN oauth_refresh_token_encrypted text,
  ADD COLUMN oauth_email text;

-- Password is no longer required (OAuth accounts won't have one)
ALTER TABLE email_accounts ALTER COLUMN imap_password_encrypted DROP NOT NULL;
