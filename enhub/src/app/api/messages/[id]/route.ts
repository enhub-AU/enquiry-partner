import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/require-user";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  // TODO: Replace with Supabase update:
  // const { data, error } = await supabase
  //   .from('messages')
  //   .update({ content, status: 'edited' })
  //   .eq('id', params.id)
  //   .select()
  //   .single();

  const mockUpdated = {
    id: params.id,
    content,
    status: "edited" as const,
    updated_at: new Date(),
  };

  return NextResponse.json(mockUpdated);
}
