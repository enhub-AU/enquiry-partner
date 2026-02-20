import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Try to get existing settings
  let { data: settings } = await supabase
    .from("agent_settings")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  // Auto-create default row if none exists
  if (!settings) {
    const { data: created, error } = await supabase
      .from("agent_settings")
      .insert({ profile_id: user.id })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    settings = created;
  }

  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Only allow updating known fields
  const allowedFields = [
    "ai_mode",
    "notify_hot_lead",
    "notify_stale_lead",
    "notify_warm_reply",
    "notify_inspection_request",
    "stale_lead_minutes",
    "delivery_push",
    "delivery_email",
    "delivery_sms",
    "price_template",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  const { data, error } = await supabase
    .from("agent_settings")
    .update(updates)
    .eq("profile_id", user.id)
    .select("*")
    .single();

  if (error) {
    // If no row exists yet, create one with the updates
    const { data: created, error: insertError } = await supabase
      .from("agent_settings")
      .insert({ profile_id: user.id, ...updates })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json(created);
  }

  return NextResponse.json(data);
}
