import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockEnquiries } from "@/data/mockEnquiries";

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

  // TODO: Replace with Supabase query:
  // const { data, error } = await supabase
  //   .from('messages')
  //   .select('*')
  //   .eq('enquiry_id', enquiryId)
  //   .order('created_at');

  const enquiry = mockEnquiries.find((e) => e.id === enquiryId);
  const messages = enquiry?.messages ?? [];

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

  // TODO: Replace with Supabase insert:
  // const { data, error } = await supabase
  //   .from('messages')
  //   .insert({ enquiry_id, content, sender: 'agent', status: 'sent' })
  //   .select()
  //   .single();
  // TODO: Trigger n8n webhook to send via SMTP

  const mockMessage = {
    id: crypto.randomUUID(),
    enquiry_id,
    content,
    sender: "agent" as const,
    status: "sent" as const,
    timestamp: new Date(),
  };

  return NextResponse.json(mockMessage, { status: 201 });
}
