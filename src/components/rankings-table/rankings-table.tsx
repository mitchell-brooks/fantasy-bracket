import { Column, useTable } from 'react-table';
import React from 'react';
import styles from './rankings-table.module.css';
import { Table } from '@components/table/table';

interface RankingsTableProps {
  rankings: RankingsTableData[];
}

export type RankingsTableData = {
  ranking: number;
  player_name: string;
  team_name: string;
  seed: number;
  points: number;
};
export const RankingsTable: React.FC<RankingsTableProps> = ({ rankings }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Player',
        columns: [
          { Header: 'Ranking', accessor: 'ranking' },
          {
            Header: 'Name',
            // accessor: 'player_name',
            accessor: (row: any) =>
              row.eliminated ? <del>{row.player_name}</del> : row.player_name,
          },
          { Header: 'Tournament Pts', accessor: 'tournament_points' },
          { Header: 'Reg Season Pts', accessor: 'points' },
        ],
      },
      {
        Header: 'Team',
        columns: [
          { Header: 'Team', accessor: 'team_name' },
          { Header: 'Seed', accessor: 'seed' },
        ],
      },
    ],
    []
  );

  return <Table columns={columns} data={rankings} />;
};
