import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { validateWebhookSecret } from "@/lib/webhookAuth";
import { processNewEnquiry } from "@/lib/enquiryProcessor";

/**
 * POST /api/webhooks/inbound-enquiry
 *
 * Called by n8n when a new enquiry email arrives.
 * Now delegates to processNewEnquiry() for core logic.
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
    agent_email,
    client_name,
    client_email,
    client_phone,
    subject,
    body: messageBody,
    category,
    property_address,
    property_price_guide,
    source,
    ai_draft,
  } = body;

  if (!agent_email || !client_name || !client_email || !subject || !messageBody) {
    return NextResponse.json(
      { error: "Missing required fields: agent_email, client_name, client_email, subject, body" },
      { status: 400 }
    );
  }

  try {
    const result = await processNewEnquiry(supabase, {
      agentEmail: agent_email,
      clientName: client_name,
      clientEmail: client_email,
      clientPhone: client_phone,
      subject,
      body: messageBody,
      category,
      propertyAddress: property_address,
      propertyPriceGuide: property_price_guide,
      source,
      aiDraft: ai_draft,
    });

    return NextResponse.json(
      {
        enquiry_id: result.enquiryId,
        contact_id: result.contactId,
        status: result.status,
        ai_message_status: result.aiMessageStatus,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
