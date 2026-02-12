import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
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
