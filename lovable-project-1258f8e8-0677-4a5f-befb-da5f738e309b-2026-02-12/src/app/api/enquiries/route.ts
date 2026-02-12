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

  const { searchParams } = request.nextUrl;
  const temperature = searchParams.get("temperature");
  const sort = searchParams.get("sort");

  // TODO: Replace with Supabase query:
  // const query = supabase
  //   .from('enquiries')
  //   .select('*, contact:contacts(*), messages(*)')
  //   .eq('profile_id', user.id)
  //   .order('last_activity_at', { ascending: false });
  // if (temperature) query.eq('temperature', temperature);

  let data = [...mockEnquiries];

  if (temperature) {
    data = data.filter((e) => e.temperature === temperature);
  }

  if (sort === "newest") {
    data.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  return NextResponse.json(data);
}
