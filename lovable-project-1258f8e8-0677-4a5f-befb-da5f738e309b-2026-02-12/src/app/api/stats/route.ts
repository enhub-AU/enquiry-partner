import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run all count queries in parallel
  const [autoHandledRes, promotedHotRes, waitingReplyRes] = await Promise.all([
    supabase
      .from("messages")
      .select("*, enquiry:enquiries!inner(profile_id)", {
        count: "exact",
        head: true,
      })
      .eq("sender", "ai")
      .eq("status", "sent")
      .eq("enquiry.profile_id", user.id),

    supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", user.id)
      .eq("status", "hot"),

    supabase
      .from("messages")
      .select("*, enquiry:enquiries!inner(profile_id)", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending_approval")
      .eq("enquiry.profile_id", user.id),
  ]);

  const stats = {
    autoHandled: autoHandledRes.count ?? 0,
    promotedHot: promotedHotRes.count ?? 0,
    waitingReply: waitingReplyRes.count ?? 0,
  };

  return NextResponse.json(stats);
}
