'use client';
import styles from './grid.module.css';
import React, { useLayoutEffect } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useScrollHeight } from '@/hooks/useScrollHeight';

interface GridProps {
  leftContent: React.ReactNode;
  rightContent?: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({ leftContent, rightContent }) => {
  const [divCount, setDivCount] = React.useState(0);
  const { width } = useWindowSize({
    widthSelector: (w) => w,
    heightSelector: (h) => Math.floor(h / 60),
  });
  // const divCount = useScrollHeight((height) => Math.floor(height / 60));
  // let divCount = 0;
  let rows = [];
  let doubleRows = [];
  // TODO rework this to allow for keys
  if (divCount) {
    rows = new Array(divCount).fill(<div className={styles.gridRow}></div>);
    doubleRows = new Array(Math.floor(divCount / 2)).fill(
      <div className={styles.gridDoubleRow}></div>
    );
  }

  useLayoutEffect(() => {
    if (!document) return;
    setDivCount(Math.floor(document.body.scrollHeight / 60));
  }, []);

  return (
    <>
      <div className={styles.grid}>
        <div className={styles.gridColumn}>{rows}</div>
        <div className={styles.gridColumn}>
          <div className={styles.gridHalfRow} />
          <div className={`${styles.gridRow}`} />
          <div className={styles.gridRow} />
          <div className={` ${styles.contentBlock}`}>{leftContent}</div>
        </div>
        <div className={styles.gridColumn}>{doubleRows}</div>
        <div className={styles.gridColumn}></div>
      </div>
    </>
  );
};
