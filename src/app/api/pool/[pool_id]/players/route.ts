// export const dynamic = "force-dynamic"; // static by default, unless reading the request
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

// import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";


export async function GET(request: Request, { params }: { params: { pool_id: string } }) {
  console.log(params);
  console.log(":::inside function");
  try {
    console.log(":::inside try");
    const { pool_id } = params || {};
    console.log(":::pool_id", pool_id);
    const supabase = createRouteHandlerSupabaseClient({
      headers,
      cookies
    });
    console.log(":::supabase", supabase);
    const { data, error } = await supabase
      .from("view_roster_player_data")
      .select("*")
      .eq("pool_id", pool_id);

    return NextResponse.json({ data });
  } catch
    (err) {
    return NextResponse.json({ error: err });
  }
}