import { useTable } from 'react-table';
import React from 'react';
import styles from './rankings-table.module.css';

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
          { Header: 'Name', accessor: 'player_name' },
          { Header: 'Pts. Reg. Season', accessor: 'points' },
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

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: rankings });

  return (
    <table className={styles.table} {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} key={column.id}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={row.id}>
              {row.cells.map((cell) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    key={`${cell.row}${cell.column}`}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
