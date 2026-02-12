import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mockEnquiries } from "@/data/mockEnquiries";

export async function GET(
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

  // TODO: Replace with Supabase query:
  // const { data, error } = await supabase
  //   .from('enquiries')
  //   .select('*, contact:contacts(*), messages(*)')
  //   .eq('id', params.id)
  //   .eq('profile_id', user.id)
  //   .single();

  const enquiry = mockEnquiries.find((e) => e.id === params.id);

  if (!enquiry) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  return NextResponse.json(enquiry);
}
