import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/require-user";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  // TODO: Replace with Supabase aggregate queries:
  // const { count: autoHandled } = await supabase
  //   .from('messages')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('sender', 'ai')
  //   .eq('status', 'sent');
  //
  // const { count: promotedHot } = await supabase
  //   .from('enquiries')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('profile_id', user.id)
  //   .eq('temperature', 'hot');
  //
  // const { count: waitingReply } = await supabase
  //   .from('messages')
  //   .select('*', { count: 'exact', head: true })
  //   .eq('status', 'pending_approval');

  const stats = {
    autoHandled: 24,
    promotedHot: 3,
    waitingReply: 7,
  };

  return NextResponse.json(stats);
}
