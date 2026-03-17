// ABOUTME: Unified all-players AG Grid with collapsible filter chip groups and column picker
// ABOUTME: Filter groups: Status, Draft, Participant, Team, Region — each sets a column filter
'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule, type ColDef, type ICellRendererParams } from 'ag-grid-community';
import { inkAndPaperTheme } from '@components/data-grid/theme';
import Link from 'next/link';
import styles from './players-page.module.css';

const modules = [AllCommunityModule];

export interface PlayerRow {
  player_name: string | null;
  total_player_points: number | null;
  tournament_points: number | null;
  team_name: string | null;
  seed: number | null;
  pick_number: number | null;
  username: string | null;
  round_eliminated: number | null;
  pool_id: number;
  roster_id: number | null;
  region: string | null;
  status: string;
  drafted: boolean;
  position: string | null;
  regular_season_points: number | null;
  assists: number | null;
  rebounds: number | null;
  wins: number | null;
  losses: number | null;
  overall_seed: number | null;
}

interface FilterGroup {
  label: string;
  column: string;
  chips: string[];
  colorStyle?: 'default' | 'positive' | 'muted';
}

function PlayerNameRenderer(params: ICellRendererParams<PlayerRow>) {
  if (!params.data) return null;
  if (params.data.round_eliminated) {
    return <s style={{ color: 'var(--color-text-eliminated)' }}>{params.data.player_name}</s>;
  }
  return params.data.player_name;
}

function DraftedByRenderer(params: ICellRendererParams<PlayerRow>) {
  if (!params.data?.username) return '—';
  return (
    <Link href={`/pool/${params.data.pool_id}/roster/${params.data.roster_id}`}>
      {params.data.username}
    </Link>
  );
}

interface AllPlayersGridProps {
  rows: PlayerRow[];
  filterGroups: FilterGroup[];
}

export function AllPlayersGrid({ rows, filterGroups }: AllPlayersGridProps) {
  const gridRef = useRef<AgGridReact<PlayerRow>>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | null>>({});
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    () => new Set(['status', 'pick_number', 'region', 'position', 'regular_season_points', 'assists', 'rebounds', 'wins', 'losses', 'overall_seed', 'tournament_points'])
  );
  const [activeTab, setActiveTab] = useState(filterGroups[0]?.label ?? '');
  const theme = useMemo(() => inkAndPaperTheme, []);

  const allColumnDefs = useMemo<Array<ColDef<PlayerRow> & { field?: string }>>(() => [
    { field: 'player_name', headerName: 'Player', headerTooltip: 'Player Name', flex: 2, cellRenderer: PlayerNameRenderer, filter: 'agTextColumnFilter' },
    { field: 'total_player_points', headerName: 'Points', headerTooltip: 'Total Points (Drafted)', width: 100, sort: 'desc' as const },
    { field: 'team_name', headerName: 'Team', headerTooltip: 'Team Name', flex: 1, filter: 'agTextColumnFilter' },
    { field: 'seed', headerName: 'Seed', headerTooltip: 'Tournament Seed', width: 80 },
    { field: 'username', headerName: 'Drafted By', headerTooltip: 'Drafted By', flex: 1, cellRenderer: DraftedByRenderer, filter: 'agTextColumnFilter' },
    { field: 'pick_number', headerName: 'Pick', headerTooltip: 'Draft Pick Number', width: 80 },
    { field: 'status', headerName: 'Status', headerTooltip: 'Player Status', width: 100, filter: 'agTextColumnFilter' },
    { field: 'region', headerName: 'Region', headerTooltip: 'Tournament Region', width: 100, filter: 'agTextColumnFilter' },
    { field: 'position', headerName: 'Pos', headerTooltip: 'Position', width: 70, filter: 'agTextColumnFilter' },
    { field: 'tournament_points', headerName: 'Tourn. Pts', headerTooltip: 'Tournament Points', width: 110 },
    { field: 'regular_season_points', headerName: 'Reg. Pts', headerTooltip: 'Regular Season Points', width: 100 },
    { field: 'assists', headerName: 'Ast', headerTooltip: 'Assists Per Game', width: 70 },
    { field: 'rebounds', headerName: 'Reb', headerTooltip: 'Rebounds Per Game', width: 70 },
    { field: 'wins', headerName: 'W', headerTooltip: 'Team Wins', width: 60 },
    { field: 'losses', headerName: 'L', headerTooltip: 'Team Losses', width: 60 },
    { field: 'overall_seed', headerName: 'Overall', headerTooltip: 'Overall Seed', width: 90 },
  ], []);

  const columnDefs = useMemo<ColDef<PlayerRow>[]>(
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

  const applyFilters = useCallback((newFilters: Record<string, string | null>) => {
    const api = gridRef.current?.api;
    if (!api) return;

    const filterModel: Record<string, unknown> = {};
    for (const [column, value] of Object.entries(newFilters)) {
      if (value == null) continue;
      // The "drafted" filter is special — it's a boolean field shown as text
      if (column === 'drafted') {
        filterModel['username'] = value === 'Drafted'
          ? { filterType: 'text', type: 'notBlank' }
          : { filterType: 'text', type: 'blank' };
      } else {
        filterModel[column] = {
          filterType: 'text',
          type: 'equals',
          filter: value,
        };
      }
    }
    api.setFilterModel(Object.keys(filterModel).length > 0 ? filterModel : null);
  }, []);

  const handleChipClick = useCallback((column: string, value: string) => {
    setActiveFilters((prev) => {
      const isActive = prev[column] === value;
      // One filter at a time — clicking a chip clears all other groups
      const updated: Record<string, string | null> = { [column]: isActive ? null : value };
      applyFilters(updated);
      return updated;
    });
  }, [applyFilters]);

  const handleClearAll = useCallback(() => {
    setActiveFilters({});
    const api = gridRef.current?.api;
    if (api) api.setFilterModel(null);
  }, []);


  const hasAnyFilter = Object.values(activeFilters).some((v) => v != null);

  const getChipClass = useCallback((group: FilterGroup, value: string) => {
    const isActive = activeFilters[group.column] === value;
    if (group.colorStyle === 'positive') {
      return isActive ? styles.chipPositiveActive : styles.chipPositive;
    }
    if (group.colorStyle === 'muted') {
      return isActive ? styles.chipMutedActive : styles.chipMuted;
    }
    return isActive ? styles.chipActive : styles.chip;
  }, [activeFilters]);

  return (
    <AgGridProvider modules={modules}>
      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          {filterGroups.map((group) => {
            const hasFilter = activeFilters[group.column] != null;
            return (
              <button
                key={group.label}
                className={activeTab === group.label ? styles.tabActive : styles.tab}
                onClick={() => setActiveTab(group.label)}
              >
                {group.label}{hasFilter ? ' •' : ''}
              </button>
            );
          })}
          {hasAnyFilter && (
            <button className={styles.tab} onClick={handleClearAll}>
              ✕ Clear
            </button>
          )}
        </div>
        <div className={styles.chips}>
          {filterGroups
            .filter((g) => g.label === activeTab)
            .map((group) =>
              group.chips.map((value) => (
                <button
                  key={value}
                  className={getChipClass(group, value)}
                  onClick={() => handleChipClick(group.column, value)}
                >
                  {value}
                </button>
              ))
            )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
        <div className={styles.columnPickerWrapper}>
          <button
            className={styles.chip}
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
        <AgGridReact<PlayerRow>
          ref={gridRef}
          theme={theme}
          columnDefs={columnDefs}
          rowData={rows}
          defaultColDef={{
            sortable: true,
            resizable: true,
            filter: true,
          }}
          getRowId={(params) => `${params.data.player_name}-${params.data.team_name}-${params.data.roster_id ?? 'undrafted'}`}
          tooltipShowDelay={300}
        />
      </div>
    </AgGridProvider>
  );
}
