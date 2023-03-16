'use client';
import { Column, useTable } from 'react-table';
import styles from '@components/rankings-table/rankings-table.module.css';
import React from 'react';

interface TableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
}
// TODO figure out generic type passing here
export const Table: React.FC<TableProps<Record<string, any>>> = ({
  columns,
  data,
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

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
