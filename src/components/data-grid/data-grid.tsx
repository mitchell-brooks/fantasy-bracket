// ABOUTME: Reusable AG Grid wrapper with Ink & Paper theme applied
// ABOUTME: Provides consistent grid styling and default configuration across the app
'use client';

import { useMemo } from 'react';
import { AgGridReact, AgGridReactProps, AgGridProvider } from 'ag-grid-react';
import {
  AllCommunityModule,
  type ColDef,
} from 'ag-grid-community';
import { inkAndPaperTheme } from './theme';
import styles from './data-grid.module.css';

const modules = [AllCommunityModule];

interface DataGridProps<T> extends Omit<AgGridReactProps<T>, 'theme'> {
  columnDefs: ColDef<T>[];
  rowData: T[];
  height?: string;
}

export function DataGrid<T>({
  columnDefs,
  rowData,
  height = '600px',
  ...props
}: DataGridProps<T>) {
  const theme = useMemo(() => inkAndPaperTheme, []);
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  return (
    <AgGridProvider modules={modules}>
      <div className={styles.gridContainer} style={{ height }}>
        <AgGridReact<T>
          theme={theme}
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          {...props}
        />
      </div>
    </AgGridProvider>
  );
}
