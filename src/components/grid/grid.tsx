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
  const { width, height: heightDivs } = useWindowSize({
    widthSelector: (w) => w,
    heightSelector: (h) => Math.floor(h / 60),
  });
  // const divCount = useScrollHeight((height) => Math.floor(height / 60));
  // let divCount = 0;
  const rows = [];
  const doubleRows = [];
  if (divCount) {
    for (let i = 0; i < divCount; i++) {
      rows.push(<div key={`gridrow${i}`} className={styles.gridRow}></div>);
      if (i % 2 === 0) {
        doubleRows.push(
          <div key={`griddoublerow${i}`} className={styles.gridDoubleRow}></div>
        );
      }
    }
  }

  useLayoutEffect(() => {
    if (!document) return;
    setDivCount(heightDivs);
  }, [heightDivs]);

  return (
    <>
      <div className={styles.grid}>
        <div className={`${styles.gridColumn}`}>{rows}</div>
        <div className={styles.gridColumn}>
          <div className={styles.gridHalfRow} />
          <div className={`${styles.gridRow} + ${styles.smallHidden}`} />
          <div className={styles.gridRow} />
          <div className={` ${styles.contentBlock}`} id={'content-block'}>
            {leftContent}
          </div>
        </div>
        <div className={styles.gridColumn}>{doubleRows}</div>
        {/*<div className={styles.gridColumn}></div>*/}
      </div>
    </>
  );
};
