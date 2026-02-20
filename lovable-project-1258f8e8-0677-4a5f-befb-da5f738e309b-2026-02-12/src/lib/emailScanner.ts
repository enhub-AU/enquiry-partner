import { ImapFlow } from "imapflow";
import { simpleParser, ParsedMail } from "mailparser";
import { createServiceClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { refreshAccessToken } from "@/lib/googleOAuth";
import { classifyEmail, draftReply } from "@/lib/ai";
import {
  processNewEnquiry,
  processEnquiryUpdate,
} from "@/lib/enquiryProcessor";

interface EmailAccount {
  id: string;
  profile_id: string;
  imap_host: string;
  imap_port: number;
  imap_user: string;
  imap_password_encrypted: string | null;
  auth_method: "password" | "oauth";
  oauth_refresh_token_encrypted: string | null;
  last_scan_at: string | null;
  is_active: boolean;
}

interface ScanResult {
  accountId: string;
  processed: number;
  errors: string[];
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

/** Scan all active email accounts */
export async function scanAllAccounts(): Promise<ScanResult[]> {
  const supabase = createServiceClient();
  const { data: accounts } = await supabase
    .from("email_accounts")
    .select("*")
    .eq("is_active", true);

  if (!accounts || accounts.length === 0) return [];

  const results: ScanResult[] = [];
  for (const account of accounts) {
    results.push(await scanAccount(account));
  }
  return results;
}

/** Scan only one user's accounts */
export async function scanUserAccounts(
  userId: string
): Promise<ScanResult[]> {
  const supabase = createServiceClient();
  const { data: accounts } = await supabase
    .from("email_accounts")
    .select("*")
    .eq("profile_id", userId)
    .eq("is_active", true);

  if (!accounts || accounts.length === 0) return [];

  const results: ScanResult[] = [];
  for (const account of accounts) {
    results.push(await scanAccount(account));
  }
  return results;
}

// ────────────────────────────────────────────────────────────
// Core scanner
// ────────────────────────────────────────────────────────────

async function scanAccount(account: EmailAccount): Promise<ScanResult> {
  const supabase = createServiceClient();
  const result: ScanResult = { accountId: account.id, processed: 0, errors: [] };

  let client: ImapFlow | null = null;

  try {
    let auth: { user: string; pass: string } | { user: string; accessToken: string };

    if (account.auth_method === "oauth") {
      if (!account.oauth_refresh_token_encrypted) {
        throw new Error("OAuth account missing refresh token");
      }
      const refreshToken = decrypt(account.oauth_refresh_token_encrypted);
      const accessToken = await refreshAccessToken(refreshToken);
      auth = { user: account.imap_user, accessToken };
    } else {
      if (!account.imap_password_encrypted) {
        throw new Error("Password account missing password");
      }
      const password = decrypt(account.imap_password_encrypted);
      auth = { user: account.imap_user, pass: password };
    }

    client = new ImapFlow({
      host: account.imap_host,
      port: account.imap_port,
      secure: true,
      auth,
      logger: false,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      // Fetch emails since last scan (or last 24h if first scan)
      const since = account.last_scan_at
        ? new Date(account.last_scan_at)
        : new Date(Date.now() - 24 * 60 * 60 * 1000);

      const messages = client.fetch(
        { since },
        {
          uid: true,
          envelope: true,
          source: true,
          headers: ["message-id", "in-reply-to", "references"],
        }
      );

      for await (const msg of messages) {
        try {
          await processMessage(supabase, account, msg);
          result.processed++;
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          result.errors.push(errMsg);
          console.error(`Error processing UID ${msg.uid}:`, errMsg);
        }
      }
    } finally {
      lock.release();
    }

    // Update last_scan_at
    await supabase
      .from("email_accounts")
      .update({ last_scan_at: new Date().toISOString(), last_scan_error: null })
      .eq("id", account.id);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    result.errors.push(errMsg);
    console.error(`Scan failed for account ${account.id}:`, errMsg);

    await supabase
      .from("email_accounts")
      .update({ last_scan_error: errMsg })
      .eq("id", account.id);
  } finally {
    if (client) {
      try {
        await client.logout();
      } catch {
        // ignore logout errors
      }
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// Process a single IMAP message
// ────────────────────────────────────────────────────────────

async function processMessage(
  supabase: ReturnType<typeof createServiceClient>,
  account: EmailAccount,
  msg: { uid: number; source?: Buffer; envelope?: { messageId?: string } }
) {
  if (!msg.source) return;

  // Parse with mailparser
  const parsed: ParsedMail = await simpleParser(msg.source);
  const messageIdHeader =
    parsed.messageId || msg.envelope?.messageId || `uid-${msg.uid}`;

  // Skip if already processed
  const { data: existing } = await supabase
    .from("processed_emails")
    .select("id")
    .eq("email_account_id", account.id)
    .eq("message_id_header", messageIdHeader)
    .maybeSingle();

  if (existing) return;

  // Derive thread ID from References / In-Reply-To
  const threadId = deriveThreadId(parsed);
  const fromEmail =
    parsed.from?.value?.[0]?.address || "unknown";
  const fromName =
    parsed.from?.value?.[0]?.name || fromEmail.split("@")[0];
  const subject = parsed.subject || "(no subject)";
  const body = parsed.text || parsed.html || "";

  // Check if thread maps to an existing enquiry
  let enquiryId: string | null = null;

  if (threadId) {
    const { data: threadMatch } = await supabase
      .from("processed_emails")
      .select("enquiry_id")
      .eq("email_account_id", account.id)
      .eq("thread_id", threadId)
      .not("enquiry_id", "is", null)
      .limit(1)
      .maybeSingle();

    enquiryId = threadMatch?.enquiry_id || null;
  }

  // Get agent profile for AI drafting
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", account.profile_id)
    .single();
  const agentName = profile?.full_name || "The Agent";

  // Get thread history for AI context
  const threadHistory = await getThreadHistory(supabase, enquiryId);

  if (enquiryId) {
    // Existing thread → update
    const classification = await classifyEmail(body, threadHistory);
    const draft = await draftReply(body, threadHistory, agentName);

    await processEnquiryUpdate(supabase, {
      enquiryId,
      sender: "client",
      content: body,
      aiDraft: draft,
      isInspectionRequest: classification.isInspectionRequest,
      isOfferIntent: classification.isOfferIntent,
    });
  } else {
    // New thread → create enquiry
    const classification = await classifyEmail(body, threadHistory);
    const draft = await draftReply(body, threadHistory, agentName);

    // Get enquiry property info if subject hints at it
    const result = await processNewEnquiry(supabase, {
      profileId: account.profile_id,
      clientName: fromName,
      clientEmail: fromEmail,
      subject,
      body,
      category: classification.category,
      aiDraft: draft,
    });

    enquiryId = result.enquiryId;
  }

  // Record in processed_emails
  await supabase.from("processed_emails").insert({
    email_account_id: account.id,
    message_id_header: messageIdHeader,
    uid: msg.uid,
    enquiry_id: enquiryId,
    thread_id: threadId || messageIdHeader,
    from_email: fromEmail,
    subject,
  });
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function deriveThreadId(parsed: ParsedMail): string | null {
  // Use first Reference header as canonical thread ID
  if (parsed.references && parsed.references.length > 0) {
    return Array.isArray(parsed.references)
      ? parsed.references[0]
      : parsed.references;
  }
  // Fall back to In-Reply-To
  if (parsed.inReplyTo) {
    return parsed.inReplyTo;
  }
  return null;
}

async function getThreadHistory(
  supabase: ReturnType<typeof createServiceClient>,
  enquiryId: string | null
): Promise<string[]> {
  if (!enquiryId) return [];

  const { data: messages } = await supabase
    .from("messages")
    .select("content, sender")
    .eq("enquiry_id", enquiryId)
    .order("created_at", { ascending: true })
    .limit(10);

  if (!messages) return [];

  return messages.map(
    (m: { sender: string; content: string }) =>
      `[${m.sender}]: ${m.content}`
  );
}
