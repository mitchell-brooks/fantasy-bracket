'use client';
import React, { useCallback } from 'react';
import { DownloadButton } from '@components/download-button/download-button';
import { UploadButton } from '@components/upload-button/upload-button';
import { RankingsTable } from '@components/rankings-table/rankings-table';

interface DraftContainerProps {
  csv: string;
  players?: Record<string, any>[];
  existingRankings?: Record<string, any>[] | null;
}

export const DraftContainer: React.FC<DraftContainerProps> = ({
  csv,
  players,
  existingRankings,
}) => {
  const [rankings, setRankings] = React.useState<any[]>(existingRankings || []);
  console.log(rankings);
  const handleUpload = useCallback((data: any) => {
    setRankings(data);
    console.log(data);
  }, []);

  const insertRankings = async (rankings: RosterRankingRow[]) => {

  return (
    <>
      <div>
        <DownloadButton
          buttonText="Get Ranking Template"
          tooltipText="Download player data and a ranking template as a csv file"
          filename="ranking_template.csv"
          data={csv}
        />
        <UploadButton onUpload={handleUpload} />
        <br />
        <br />
        {rankings.length ? (
          <>
            {/*<button onClick={uploadRankings}>Upload Rankings</button>*/}
            <br />
            <br />
            <RankingsTable data={rankings} />
          </>
        ) : null}
      </div>
    </>
  );
};
