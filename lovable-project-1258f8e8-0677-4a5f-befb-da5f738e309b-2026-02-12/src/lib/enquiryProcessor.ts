import { SupabaseClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface NewEnquiryInput {
  agentEmail?: string;
  profileId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  subject: string;
  body: string;
  category?: "price_only" | "inspection" | "multi_question" | "other";
  propertyAddress?: string;
  propertyPriceGuide?: string;
  source?: string;
  aiDraft?: string;
}

export interface NewEnquiryResult {
  enquiryId: string;
  contactId: string;
  status: string;
  aiMessageStatus: string | null;
}

export interface EnquiryUpdateInput {
  enquiryId: string;
  sender?: "client" | "ai";
  content: string;
  aiDraft?: string;
  isInspectionRequest?: boolean;
  isOfferIntent?: boolean;
}

export interface EnquiryUpdateResult {
  enquiryId: string;
  promoted: boolean;
  promotionReason: string | null;
}

// ────────────────────────────────────────────────────────────
// processNewEnquiry
// ────────────────────────────────────────────────────────────

export async function processNewEnquiry(
  supabase: SupabaseClient,
  input: NewEnquiryInput
): Promise<NewEnquiryResult> {
  const {
    agentEmail,
    profileId: inputProfileId,
    clientName,
    clientEmail,
    clientPhone,
    subject,
    body,
    category,
    propertyAddress,
    propertyPriceGuide,
    source,
    aiDraft,
  } = input;

  // 1. Resolve profile ID
  let profileId = inputProfileId;
  if (!profileId) {
    if (!agentEmail) {
      throw new Error("Either profileId or agentEmail must be provided");
    }
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", agentEmail)
      .single();

    if (error || !profile) {
      throw new Error(`Agent not found for email: ${agentEmail}`);
    }
    profileId = profile.id;
  }

  // 2. Fetch agent settings
  const { data: settings } = await supabase
    .from("agent_settings")
    .select("ai_mode")
    .eq("profile_id", profileId)
    .single();

  const aiMode = settings?.ai_mode ?? "draft";

  // 3. Upsert contact
  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .upsert(
      {
        profile_id: profileId,
        name: clientName,
        email: clientEmail,
        phone: clientPhone || null,
        source: source || null,
      },
      { onConflict: "profile_id,email" }
    )
    .select("id")
    .single();

  if (contactError || !contact) {
    throw new Error(`Failed to upsert contact: ${contactError?.message}`);
  }

  // 4. Determine initial status
  let status = "new";
  if (category === "price_only" && (aiMode === "safe" || aiMode === "full")) {
    status = "auto_handled";
  } else if (category === "inspection" || category === "multi_question") {
    status = "needs_attention";
  }

  // 5. Create enquiry
  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .insert({
      profile_id: profileId,
      contact_id: contact.id,
      subject,
      status,
      category: category || null,
      property_address: propertyAddress || null,
      property_price_guide: propertyPriceGuide || null,
      last_activity_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (enquiryError || !enquiry) {
    throw new Error(`Failed to create enquiry: ${enquiryError?.message}`);
  }

  // 6. Create client message
  await supabase.from("messages").insert({
    enquiry_id: enquiry.id,
    sender: "client",
    content: body,
    channel: "email",
    status: "sent",
  });

  // 7. Optionally create AI draft
  let aiMessageStatus: string | null = null;
  if (aiDraft) {
    const autoSend =
      (category === "price_only" && (aiMode === "safe" || aiMode === "full")) ||
      aiMode === "full";

    aiMessageStatus = autoSend ? "sent" : "pending_approval";

    await supabase.from("messages").insert({
      enquiry_id: enquiry.id,
      sender: "ai",
      content: aiDraft,
      channel: "email",
      status: aiMessageStatus,
    });
  }

  return {
    enquiryId: enquiry.id,
    contactId: contact.id,
    status,
    aiMessageStatus,
  };
}

// ────────────────────────────────────────────────────────────
// processEnquiryUpdate
// ────────────────────────────────────────────────────────────

export async function processEnquiryUpdate(
  supabase: SupabaseClient,
  input: EnquiryUpdateInput
): Promise<EnquiryUpdateResult> {
  const {
    enquiryId,
    sender,
    content,
    aiDraft,
    isInspectionRequest,
    isOfferIntent,
  } = input;

  // 1. Get enquiry with contact + messages
  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .select("*, contact:contacts(*), messages(*)")
    .eq("id", enquiryId)
    .single();

  if (enquiryError || !enquiry) {
    throw new Error("Enquiry not found");
  }

  // 2. Add reply message
  await supabase.from("messages").insert({
    enquiry_id: enquiryId,
    sender: sender || "client",
    content,
    channel: "email",
    status: "sent",
  });

  // 3. Update last_activity_at
  const updates: Record<string, unknown> = {
    last_activity_at: new Date().toISOString(),
    is_read: false,
  };

  // 4. Hot lead promotion
  let promoted = false;
  let promotionReason: string | null = null;

  if (enquiry.status !== "hot" && (sender === "client" || !sender)) {
    const clientMessageCount =
      (enquiry.messages ?? []).filter(
        (m: { sender: string }) => m.sender === "client"
      ).length + 1;

    if (isInspectionRequest) {
      promoted = true;
      promotionReason = "Buyer requested inspection";
    } else if (isOfferIntent) {
      promoted = true;
      promotionReason = "Buyer expressed offer intent";
    } else if (clientMessageCount >= 3) {
      promoted = true;
      promotionReason = "Buyer replied 3+ times";
    }

    if (promoted) {
      updates.status = "hot";
      updates.promotion_reason = promotionReason;
    }
  }

  await supabase.from("enquiries").update(updates).eq("id", enquiryId);

  // 5. Notifications
  const profileId = enquiry.profile_id;

  if (promoted) {
    await supabase.from("notifications").insert({
      profile_id: profileId,
      enquiry_id: enquiryId,
      type: "hot_lead",
      title: "New hot lead",
      body: `${enquiry.contact?.name ?? "A lead"} — ${promotionReason}`,
    });
  }

  if (isInspectionRequest) {
    await supabase.from("notifications").insert({
      profile_id: profileId,
      enquiry_id: enquiryId,
      type: "inspection_request",
      title: "Inspection requested",
      body: `${enquiry.contact?.name ?? "A lead"} requested an inspection`,
    });
  }

  if ((sender === "client" || !sender) && !promoted) {
    await supabase.from("notifications").insert({
      profile_id: profileId,
      enquiry_id: enquiryId,
      type: "warm_reply",
      title: "New reply",
      body: `${enquiry.contact?.name ?? "A lead"} replied to "${enquiry.subject}"`,
    });
  }

  // 6. AI draft
  if (aiDraft) {
    const { data: settings } = await supabase
      .from("agent_settings")
      .select("ai_mode")
      .eq("profile_id", profileId)
      .single();

    const aiMode = settings?.ai_mode ?? "draft";
    const autoSend = aiMode === "full";

    await supabase.from("messages").insert({
      enquiry_id: enquiryId,
      sender: "ai",
      content: aiDraft,
      channel: "email",
      status: autoSend ? "sent" : "pending_approval",
    });
  }

  return { enquiryId, promoted, promotionReason };
}
