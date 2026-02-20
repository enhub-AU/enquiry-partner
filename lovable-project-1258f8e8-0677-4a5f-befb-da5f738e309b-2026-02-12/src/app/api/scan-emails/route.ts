import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scanAllAccounts, scanUserAccounts } from "@/lib/emailScanner";

/**
 * GET /api/scan-emails
 *
 * Two modes:
 * 1. Vercel Cron (Authorization: Bearer CRON_SECRET) → scan ALL accounts
 * 2. Authenticated user (session cookie) → scan only their accounts
 */
export async function GET(request: NextRequest) {
  // Check for Cron secret (production scheduled scanning)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    const results = await scanAllAccounts();
    return NextResponse.json({ mode: "cron", results });
  }

  // Fall back to user-authenticated scan
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await scanUserAccounts(user.id);
  return NextResponse.json({ mode: "user", results });
}
