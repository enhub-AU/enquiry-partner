import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";
import {
  exchangeCodeForTokens,
  fetchGoogleEmail,
  refreshAccessToken,
} from "@/lib/googleOAuth";
import { ImapFlow } from "imapflow";

/** GET /api/auth/google-email/callback — handle Google OAuth redirect */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appBase = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

  // Handle user denying consent
  if (error) {
    return NextResponse.redirect(`${appBase}/settings?email_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appBase}/settings?email_error=missing_params`);
  }

  // Validate state cookie
  const storedState = request.cookies.get("google_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appBase}/settings?email_error=invalid_state`);
  }

  // Verify user is logged in
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${appBase}/settings?email_error=unauthorized`);
  }

  try {
    // Exchange code for tokens
    const { access_token, refresh_token } = await exchangeCodeForTokens(code);

    // Fetch the user's Gmail address
    const email = await fetchGoogleEmail(access_token);

    // Test IMAP connection with the access token
    const client = new ImapFlow({
      host: "imap.gmail.com",
      port: 993,
      secure: true,
      auth: { user: email, accessToken: access_token },
      logger: false,
    });
    await client.connect();
    await client.logout();

    // Encrypt refresh token and upsert email account
    const encryptedRefreshToken = encrypt(refresh_token);
    const service = createServiceClient();

    // Check if account already exists for this email
    const { data: existing } = await service
      .from("email_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .eq("oauth_email", email)
      .maybeSingle();

    if (existing) {
      // Update existing account
      await service
        .from("email_accounts")
        .update({
          auth_method: "oauth",
          oauth_refresh_token_encrypted: encryptedRefreshToken,
          is_active: true,
          last_scan_error: null,
        })
        .eq("id", existing.id);
    } else {
      // Insert new account
      await service.from("email_accounts").insert({
        profile_id: user.id,
        provider: "gmail",
        auth_method: "oauth",
        imap_host: "imap.gmail.com",
        imap_port: 993,
        imap_user: email,
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_user: email,
        oauth_email: email,
        oauth_refresh_token_encrypted: encryptedRefreshToken,
        is_active: true,
      });
    }

    // Clear state cookie and redirect
    const response = NextResponse.redirect(`${appBase}/settings?email_connected=true`);
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Google OAuth callback error:", msg);
    return NextResponse.redirect(
      `${appBase}/settings?email_error=${encodeURIComponent(msg)}`
    );
  }
}
