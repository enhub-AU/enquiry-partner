import { NextRequest, NextResponse } from "next/server";
import {
  ENQUIRY_SELECT,
  mapToEnquiry,
  type EnquiryRow,
} from "@/lib/mappers/enquiry";
import { requireUser } from "@/lib/supabase/require-user";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .eq("id", params.id)
    .eq("profile_id", user.id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    console.error("Failed to fetch enquiry:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiry" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  }

  return NextResponse.json(mapToEnquiry(data as EnquiryRow));
}
