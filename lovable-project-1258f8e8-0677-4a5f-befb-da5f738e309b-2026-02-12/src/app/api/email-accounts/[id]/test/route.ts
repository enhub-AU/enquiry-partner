import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { refreshAccessToken } from "@/lib/googleOAuth";
import { ImapFlow } from "imapflow";

/** POST /api/email-accounts/[id]/test — test IMAP connection */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: account } = await service
    .from("email_accounts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!account || account.profile_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

    const client = new ImapFlow({
      host: account.imap_host,
      port: account.imap_port,
      secure: true,
      auth,
      logger: false,
    });

    await client.connect();
    await client.logout();

    return NextResponse.json({ success: true, message: "Connection successful" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json(
      { success: false, message: `Connection failed: ${msg}` },
      { status: 422 }
    );
  }
}
