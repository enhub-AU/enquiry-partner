import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enquiryId = request.nextUrl.searchParams.get("enquiry_id");

  if (!enquiryId) {
    return NextResponse.json(
      { error: "enquiry_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const messages = (data ?? []).map((m) => ({
    id: m.id,
    sender: m.sender,
    content: m.content,
    timestamp: m.created_at,
    channel: m.channel,
    status: m.status,
  }));

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { enquiry_id, content } = body;

  if (!enquiry_id || !content) {
    return NextResponse.json(
      { error: "enquiry_id and content are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      enquiry_id,
      content,
      sender: "agent",
      channel: "email",
      status: "sent",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update enquiry last_activity
  await supabase
    .from("enquiries")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", enquiry_id);

  return NextResponse.json(data, { status: 201 });
}
