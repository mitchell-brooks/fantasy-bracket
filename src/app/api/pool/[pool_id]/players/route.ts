// ABOUTME: API route that returns player data for a given pool
// ABOUTME: Used by client components to fetch roster player data
import { createClient } from "@utils/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ pool_id: string }> }) {
  try {
    const { pool_id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("view_roster_player_data")
      .select("*")
      .eq("pool_id", Number(pool_id));

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
