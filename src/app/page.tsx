import styles from "./page.module.css";
import { createClient } from "@utils/supabase-server";
import React from "react";
import Link from "next/link";
import { getUser } from "@lib/api/supabase";
import { Grid } from "@components/grid/grid";
import { Redirect } from "@components/redirect/redirect";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();
  // move into layout main?
  const user = await getUser(supabase);
  // console.log('roster', roster);
  if (!user) {
    return (
      // <Grid leftContent={
      <h2>Log in or sign up.</h2>
      // } />
    );
  }
  const user_id = user.id;
  const { data: userprofile_data, error: userprofile_error } = await supabase
    .from("userprofile")
    .select("*")
    .eq("user_id", user_id);
  const username = userprofile_data?.[0]?.username;
  if (user_id && !username) {
    return <Redirect to={`/profile/${user_id}/create`} />;
  }
  // TODO create view for this? it works fine as-is
  // TODO do is RLS okay here? Only  able to select pools where roster is in roster
  // does a roster ever need to access rosters they aren't a part of?
  const { data: pool_data, error: pool_error } = await supabase
    .from("roster_full_view")
    .select("*")
    .eq("user_id", user_id);
  // TODO this will become its own component, I think

  type DaterangeOpenBracket = "(" | "["
  type DaterangeCloseBracket = ")" | "]"
  type IsoDate = `${number}-${number}-${number}`
  type Daterange = `${DaterangeOpenBracket}${IsoDate},${IsoDate}${DaterangeCloseBracket}`
  const currentPools = pool_data?.map((pool) => {
    const daterange = pool.daterange as Daterange;
    const [_start, end] = daterange.slice(1, -1).split(",");
    const endDate = new Date(end);
    const now = new Date();
    if (now > endDate) {
      return null;
    }
    return (
      <li key={pool.pool_id}>
        <Link href={`/pool/${pool.pool_id}`}>
          {pool?.pool_name || "Untitled Pool"}
        </Link>
      </li>
    );
  });

  const previousPools = pool_data?.map((pool) => {
      const daterange = pool.daterange as Daterange;
      const [_start, end] = daterange.slice(1, -1).split(",");
      const endDate = new Date(end);
      const now = new Date();
      if (now < endDate) {
        return null;
      }
      return (
        <li key={pool.pool_id}>
          <Link href={`/pool/${pool.pool_id}`}>
            {pool?.pool_name || "Untitled Pool"}
          </Link>
        </li>
      );
    }
  );

  return (
    <main className={styles.main}>
      <h2>Your pools:</h2>
      <ul>{currentPools}</ul>
      <br />
      <h2>Previous pools:</h2>
      <ul>{previousPools}</ul>
      {/*<Link href="/pool/create">Create a new pool</Link>*/}
    </main>
  );
}
