// ABOUTME: Home page that lists the logged-in user's current and previous pools
// ABOUTME: Redirects to profile creation if user has no username set
import styles from "./page.module.css";
import { createClient } from "@utils/supabase-server";
import React from "react";
import Link from "next/link";
import { getUser } from "@lib/api/supabase";
import Grid from "@components/grid/grid";
import { Redirect } from "@components/redirect/redirect";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  // move into layout main?
  const user = await getUser(supabase);
  // console.log('roster', roster);
  if (!user) {
    return <Redirect to="/login" />;
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

  const now = new Date();
  const activePools = pool_data?.filter((pool) => {
    const daterange = pool.daterange as Daterange;
    const parts = daterange.slice(1, -1).split(",");
    const endDate = new Date(parts[1] ?? '');
    return now <= endDate;
  }) ?? [];

  const previousPools = pool_data?.filter((pool) => {
    const daterange = pool.daterange as Daterange;
    const parts = daterange.slice(1, -1).split(",");
    const endDate = new Date(parts[1] ?? '');
    return now > endDate;
  }) ?? [];

  return (
    <main className={styles.main}>
      <div className={styles.section}>
        <h2>Active Pools</h2>
        {activePools.length > 0 ? (
          <ul className={styles.poolList}>
            {activePools.map((pool) => (
              <li key={pool.pool_id}>
                <Link href={`/pool/${pool.pool_id}`}>
                  {pool?.pool_name || "Untitled Pool"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No active pools</p>
        )}
      </div>

      <div className={styles.section}>
        <h2>Previous Pools</h2>
        {previousPools.length > 0 ? (
          <ul className={styles.poolList}>
            {previousPools.map((pool) => (
              <li key={pool.pool_id}>
                <Link href={`/pool/${pool.pool_id}`}>
                  {pool?.pool_name || "Untitled Pool"}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No previous pools</p>
        )}
      </div>

      <div className={styles.actions}>
        <Link href="/pool/create" className={styles.createLink}>
          Create a Pool
        </Link>
        <Link href="/how-it-works" className={styles.rulesLink}>
          How It Works
        </Link>
      </div>
    </main>
  );
}
