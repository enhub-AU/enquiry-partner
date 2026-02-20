import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { validateWebhookSecret } from "@/lib/webhookAuth";
import { processEnquiryUpdate } from "@/lib/enquiryProcessor";

/**
 * POST /api/webhooks/update-enquiry
 *
 * Called by n8n when a reply arrives on an existing enquiry.
 * Now delegates to processEnquiryUpdate() for core logic.
 */
export async function POST(request: NextRequest) {
  const authError = validateWebhookSecret(request);
  if (authError) return authError;

  const supabase = createServiceClient();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    enquiry_id,
    sender,
    content,
    ai_draft,
    is_inspection_request,
    is_offer_intent,
  } = body;

  if (!enquiry_id || !content) {
    return NextResponse.json(
      { error: "Missing required fields: enquiry_id, content" },
      { status: 400 }
    );
  }

  try {
    const result = await processEnquiryUpdate(supabase, {
      enquiryId: enquiry_id,
      sender,
      content,
      aiDraft: ai_draft,
      isInspectionRequest: is_inspection_request,
      isOfferIntent: is_offer_intent,
    });

    return NextResponse.json({
      enquiry_id: result.enquiryId,
      promoted: result.promoted,
      promotion_reason: result.promotionReason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
