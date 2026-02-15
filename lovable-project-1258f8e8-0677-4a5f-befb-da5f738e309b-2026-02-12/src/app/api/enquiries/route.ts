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

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");

  let query = supabase
    .from("enquiries")
    .select("*, contact:contacts(*), messages(*)")
    .eq("profile_id", user.id);

  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("last_activity_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enquiries = (data ?? []).map((e) => ({
    id: e.id,
    clientName: e.contact?.name ?? "Unknown",
    clientEmail: e.contact?.email,
    clientPhone: e.contact?.phone,
    channel: e.channel,
    subject: e.subject ?? "",
    status: e.status,
    category: e.category,
    propertyAddress: e.property_address,
    propertyPriceGuide: e.property_price_guide,
    messages: (e.messages ?? [])
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
    lastActivity: e.last_activity_at,
    isRead: e.is_read,
  }));

  return NextResponse.json(enquiries);
}
