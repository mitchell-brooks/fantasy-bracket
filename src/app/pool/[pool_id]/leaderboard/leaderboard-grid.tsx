// ABOUTME: Client component that renders the pool leaderboard using AG Grid
// ABOUTME: Shows participant rankings with points, trailing, owes, active count, and column picker
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { inkAndPaperTheme } from '@components/data-grid/theme';
import Link from 'next/link';
import styles from './leaderboard-grid.module.css';

const modules = [AllCommunityModule];

interface LeaderboardRow {
  roster_id: number;
  username: string;
  total_roster_points: number;
  trailing: number;
  owes: string;
  active_players: number;
  yet_to_play: number;
  pool_id: number;
}

function UsernameCellRenderer(params: ICellRendererParams<LeaderboardRow>) {
  const data = params.data;
  if (!data) return null;
  return (
    <Link href={`/pool/${data.pool_id}/roster/${data.roster_id}`}>
      {data.username}
    </Link>
  );
}

export function LeaderboardGrid({ rows }: { rows: LeaderboardRow[] }) {
  const gridRef = useRef<AgGridReact<LeaderboardRow>>(null);
  const theme = useMemo(() => inkAndPaperTheme, []);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set<string>()
  );

  const allColumnDefs = useMemo<Array<ColDef<LeaderboardRow> & { field?: string }>>(() => [
    { field: 'username', headerName: 'Participant', headerTooltip: 'Participant', flex: 2, minWidth: 100, cellRenderer: UsernameCellRenderer },
    { field: 'total_roster_points', headerName: 'Points', headerTooltip: 'Total Roster Points', flex: 1, minWidth: 70, sort: 'desc' as const },
    { field: 'trailing', headerName: 'Trailing', headerTooltip: 'Points Behind 1st Place', flex: 1, minWidth: 70 },
    { field: 'owes', headerName: 'Owes', headerTooltip: 'Amount Owed to Prize Pool', flex: 1, minWidth: 70 },
    { field: 'active_players', headerName: 'Active', headerTooltip: 'Active Players Remaining', flex: 1, minWidth: 60 },
    { field: 'yet_to_play', headerName: 'Today', headerTooltip: 'Players Yet to Play Today', flex: 1, minWidth: 60 },
  ], []);

  const columnDefs = useMemo<ColDef<LeaderboardRow>[]>(
    () => allColumnDefs.map((col) => ({
      ...col,
      hide: col.field ? hiddenColumns.has(col.field) : false,
    })),
    [allColumnDefs, hiddenColumns]
  );

  const toggleColumn = useCallback((field: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  return (
    <AgGridProvider modules={modules}>
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.columnPickerWrapper}>
            <button
              className={styles.columnPickerButton}
              onClick={() => setShowColumnPicker((prev) => !prev)}
            >
              Columns
            </button>
            {showColumnPicker && (
              <div className={styles.columnPickerDropdown}>
                {allColumnDefs.map((col) => {
                  const field = col.field;
                  if (!field) return null;
                  return (
                    <label key={field} className={styles.columnPickerItem}>
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(field)}
                        onChange={() => toggleColumn(field)}
                      />
                      {col.headerTooltip ?? col.headerName ?? field}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className={styles.gridWrapper}>
          <AgGridReact<LeaderboardRow>
            ref={gridRef}
            theme={theme}
            columnDefs={columnDefs}
            rowData={rows}
            defaultColDef={{
              sortable: true,
              resizable: true,
            }}
            domLayout="autoHeight"
            tooltipShowDelay={300}
          />
        </div>
      </div>
    </AgGridProvider>
  );
}
