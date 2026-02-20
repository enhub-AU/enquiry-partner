import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getGoogleAuthUrl } from "@/lib/googleOAuth";

export const dynamic = "force-dynamic";

/** GET /api/auth/google-email — redirect to Google consent screen */
export async function GET() {
  const state = randomBytes(16).toString("hex");
  const url = getGoogleAuthUrl(state);

  const response = NextResponse.redirect(url);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
