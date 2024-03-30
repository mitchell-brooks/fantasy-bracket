"use client";
import React from "react";
import styles from "@/app/pool/[pool_id]/leaderboard/page.module.css";


export const ScoresUpdatedFooter: React.FC<{ updated: string }> = (props) => {
  return <div className={styles.bottomContainer}>
    <div className={styles.updated}>
      <div>Scores Updated: {props.updated}</div>
    </div>
  </div>;
};