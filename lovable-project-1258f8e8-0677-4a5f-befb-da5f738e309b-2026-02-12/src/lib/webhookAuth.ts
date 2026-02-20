import { NextRequest, NextResponse } from "next/server";

/**
 * Validates the shared secret sent by n8n in the Authorization header.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function validateWebhookSecret(
  request: NextRequest,
): NextResponse | null {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const auth = request.headers.get("authorization")?.trim();
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized — no Authorization header provided" },
      { status: 401 },
    );
  }

  // Support both "Bearer <secret>" and raw "<secret>" formats
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : auth.trim();
  if (token !== secret.trim()) {
    console.error("Webhook auth mismatch:", {
      receivedLength: token.length,
      expectedLength: secret.trim().length,
      receivedPrefix: token.substring(0, 100000) + "...",
      expectedPrefix: secret.trim().substring(0, 100000) + "...",
    });
    return NextResponse.json(
      { error: "Unauthorized — invalid secret" },
      { status: 401 },
    );
  }

  return null;
}
