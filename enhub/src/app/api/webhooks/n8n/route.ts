import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Verify shared secret
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { event, payload } = body;

  const supabase = createServiceClient();

  switch (event) {
    case "draft_ready": {
      // TODO: Insert the AI-generated draft message
      // const { error } = await supabase
      //   .from('messages')
      //   .insert({
      //     enquiry_id: payload.enquiry_id,
      //     content: payload.content,
      //     sender: 'ai',
      //     status: 'pending_approval',
      //     metadata: payload.metadata,
      //   });
      return NextResponse.json({ success: true, event: "draft_ready" });
    }

    case "score_updated": {
      // TODO: Update enquiry temperature and call brief
      // const { error } = await supabase
      //   .from('enquiries')
      //   .update({
      //     temperature: payload.temperature,
      //     call_brief: payload.call_brief,
      //   })
      //   .eq('id', payload.enquiry_id);
      return NextResponse.json({ success: true, event: "score_updated" });
    }

    case "message_sent": {
      // TODO: Update message status to sent
      // const { error } = await supabase
      //   .from('messages')
      //   .update({ status: 'sent' })
      //   .eq('id', payload.message_id);
      return NextResponse.json({ success: true, event: "message_sent" });
    }

    default:
      return NextResponse.json(
        { error: `Unknown event type: ${event}` },
        { status: 400 }
      );
  }
}
