import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import { ImapFlow } from "imapflow";

/** GET /api/email-accounts — list user's email accounts (passwords masked) */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: accounts, error } = await service
    .from("email_accounts")
    .select(
      "id, label, provider, imap_host, imap_port, imap_user, smtp_host, smtp_port, smtp_user, last_scan_at, last_scan_error, is_active, created_at"
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(accounts);
}

/** POST /api/email-accounts — add a new email account */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    label,
    provider,
    imap_host,
    imap_port,
    imap_user,
    imap_password,
    smtp_host,
    smtp_port,
    smtp_user,
    smtp_password,
  } = body;

  if (!imap_host || !imap_user || !imap_password) {
    return NextResponse.json(
      { error: "imap_host, imap_user, and imap_password are required" },
      { status: 400 }
    );
  }

  // Test IMAP connection before saving
  try {
    const client = new ImapFlow({
      host: imap_host,
      port: imap_port || 993,
      secure: true,
      auth: { user: imap_user, pass: imap_password },
      logger: false,
      tls: { rejectUnauthorized: true },
    });
    await client.connect();
    await client.logout();
  } catch (err: unknown) {
    const errObj = err as Record<string, unknown>;
    // ImapFlow puts the server response in responseText
    const detail =
      errObj?.responseText ||
      errObj?.response ||
      (err instanceof Error ? err.message : "Connection failed");
    console.error("IMAP connection test failed:", err);
    return NextResponse.json(
      { error: `IMAP connection failed: ${detail}` },
      { status: 422 }
    );
  }

  // Encrypt passwords and save
  const service = createServiceClient();
  const { data: account, error } = await service
    .from("email_accounts")
    .insert({
      profile_id: user.id,
      label: label || imap_user,
      provider: provider || "other",
      imap_host,
      imap_port: imap_port || 993,
      imap_user,
      imap_password_encrypted: encrypt(imap_password),
      smtp_host: smtp_host || null,
      smtp_port: smtp_port || 587,
      smtp_user: smtp_user || null,
      smtp_password_encrypted: smtp_password ? encrypt(smtp_password) : null,
    })
    .select(
      "id, label, provider, imap_host, imap_port, imap_user, smtp_host, smtp_port, smtp_user, is_active, created_at"
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This email account is already connected" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(account, { status: 201 });
}
