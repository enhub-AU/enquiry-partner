import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowedFields = ["is_read", "status"];
  const updates: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("enquiries")
    .update(updates)
    .eq("id", params.id)
    .eq("profile_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function GET(
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

  const { data, error } = await supabase
    .from("enquiries")
    .select("*, contact:contacts(*), messages(*)")
    .eq("id", params.id)
    .eq("profile_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  const enquiry = {
    id: data.id,
    clientName: data.contact?.name ?? "Unknown",
    clientEmail: data.contact?.email,
    clientPhone: data.contact?.phone,
    channel: data.channel,
    subject: data.subject ?? "",
    status: data.status,
    category: data.category,
    propertyAddress: data.property_address,
    propertyPriceGuide: data.property_price_guide,
    messages: (data.messages ?? [])
      .sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .map(
        (m: {
          id: string;
          sender: string;
          content: string;
          created_at: string;
          channel: string;
          status: string;
        }) => ({
          id: m.id,
          sender: m.sender,
          content: m.content,
          timestamp: m.created_at,
          channel: m.channel,
          status: m.status,
        })
      ),
    lastActivity: data.last_activity_at,
    isRead: data.is_read,
  };

  return NextResponse.json(enquiry);
}
