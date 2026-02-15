import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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

  const { data, error } = await supabase
    .from("messages")
    .update({ status: "sent" })
    .eq("id", params.id)
    .eq("status", "pending_approval")
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Trigger n8n webhook to send the reply via SMTP
  if (process.env.N8N_WEBHOOK_URL) {
    try {
      await fetch(`${process.env.N8N_WEBHOOK_URL}/send-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
        },
        body: JSON.stringify({ message_id: params.id }),
      });
    } catch {
      // Don't fail the approval if n8n is unreachable
      console.error("Failed to trigger n8n send-reply webhook");
    }
  }

  return NextResponse.json(data);
}
