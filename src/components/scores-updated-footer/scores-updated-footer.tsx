"use client";
import React from "react";
import styles from "@/app/pool/[pool_id]/leaderboard/page.module.css";
import { createClient } from "@utils/supabase-browser";


export const ScoresUpdatedFooter = ({ poolId }: { poolId: string }) => {
  const [updatedTime, setUpdatedTime] = React.useState<string | null>(null);
  const supabase = createClient();
  React.useEffect(() => {
    const getUpdated = async () => {
      const {
        data: poolData,
        error: pool_error
      } = await supabase.from("pool").select("competition_id").eq("pool_id", poolId);
      const competition_id = poolData?.[0]?.competition_id;
      const { data: updated_data, error: updated_error } = await supabase
        .from("competition_updated")
        .select("*")
        .eq("competition_id", competition_id)
        .order("scores_updated_at", { ascending: true });
      const updated = updated_data?.[0]?.scores_updated_at
        ? `${new Date(
          updated_data?.[updated_data.length - 1]?.scores_updated_at
        ).toLocaleDateString("en-US", { timeZone: "America/New_York" })} - ${new Date(
          updated_data?.[updated_data.length - 1]?.scores_updated_at
        ).toLocaleTimeString("en-US", { timeZone: "America/New_York" })}`
        : "N/A";
      setUpdatedTime(updated);
    };
    getUpdated();
  }, []);
  return <div className={styles.bottomContainer}>
    <div className={styles.updated}>
      <div>Scores Updated: {updatedTime}</div>
    </div>
  </div>;
};