import { NextRequest, NextResponse } from "next/server";
import {
  ENQUIRY_SELECT,
  isLeadTemperature,
  mapToEnquiry,
  TEMPERATURE_ORDER,
  type EnquiryRow,
} from "@/lib/mappers/enquiry";
import { requireUser } from "@/lib/supabase/require-user";

export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { supabase, user } = auth;

  const { searchParams } = request.nextUrl;
  const temperature = searchParams.get("temperature");
  const sort = searchParams.get("sort");
  const requestedTemperature = isLeadTemperature(temperature)
    ? temperature
    : null;

  let query = supabase
    .from("enquiries")
    .select(ENQUIRY_SELECT)
    .eq("profile_id", user.id);

  if (requestedTemperature) {
    query = query.eq("temperature", requestedTemperature);
  }

  const { data, error } = await query.order("last_activity_at", {
    ascending: false,
  });

  if (error) {
    console.error("Failed to fetch enquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }

  let mapped = (data ?? []).map((row) => mapToEnquiry(row as EnquiryRow));

  if (sort === "open") {
    mapped = mapped.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return (
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    });
  }

  if (sort === "hot") {
    mapped = mapped.sort((a, b) => {
      if (TEMPERATURE_ORDER[a.temperature] !== TEMPERATURE_ORDER[b.temperature]) {
        return TEMPERATURE_ORDER[a.temperature] - TEMPERATURE_ORDER[b.temperature];
      }
      return (
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    });
  }

  return NextResponse.json(mapped);
}
