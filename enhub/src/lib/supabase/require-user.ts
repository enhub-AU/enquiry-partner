import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type AuthenticatedResult = {
  supabase: ReturnType<typeof createClient>;
  user: User;
};

type UnauthenticatedResult = {
  error: NextResponse;
};

export async function requireUser(): Promise<
  AuthenticatedResult | UnauthenticatedResult
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { supabase, user };
}
