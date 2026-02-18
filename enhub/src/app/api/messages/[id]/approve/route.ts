import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/require-user";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  // TODO: Replace with Supabase update:
  // const { data, error } = await supabase
  //   .from('messages')
  //   .update({ status: 'sent' })
  //   .eq('id', params.id)
  //   .eq('status', 'pending_approval')
  //   .select()
  //   .single();
  //
  // TODO: Call n8n webhook to send the reply:
  // await fetch(`${process.env.N8N_WEBHOOK_URL}/send-reply`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message_id: params.id }),
  // });

  const mockApproved = {
    id: params.id,
    status: "sent" as const,
    approved_at: new Date(),
  };

  return NextResponse.json(mockApproved);
}
