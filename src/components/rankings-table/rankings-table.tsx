import { useTable } from 'react-table';
import React from 'react';

interface RankingsTableProps {
  data: Record<string, any>[];
}
export const RankingsTable: React.FC<RankingsTableProps> = ({ data }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Ranking',
        accessor: 'ranking', // accessor is the "key" in the data
      },
      {
        Header: 'Name',
        accessor: 'player_name',
      },
      { Header: 'Team', accessor: 'team_name' },
      { Header: 'Seed', accessor: 'seed' },
      { Header: 'Reg. Season Points', accessor: 'points' },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
      <thead>
        {headerGroups.map(
          (headerGroup: {
            getHeaderGroupProps: () => JSX.IntrinsicAttributes &
              React.ClassAttributes<HTMLTableRowElement> &
              React.HTMLAttributes<HTMLTableRowElement>;
            headers: any[];
          }) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    borderBottom: 'solid 3px red',

                    background: 'aliceblue',

                    color: 'black',

                    fontWeight: 'bold',
                  }}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          )
        )}
      </thead>

      <tbody {...getTableBodyProps()}>
        {rows.map(
          (row: {
            getRowProps: () => JSX.IntrinsicAttributes &
              React.ClassAttributes<HTMLTableRowElement> &
              React.HTMLAttributes<HTMLTableRowElement>;
            cells: any[];
          }) => {
            prepareRow(row);

            return (
              <tr key={`${row.player_unique}-row`} {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '10px',

                        border: 'solid 1px gray',

                        background: 'papayawhip',
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  );
                })}
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
};
