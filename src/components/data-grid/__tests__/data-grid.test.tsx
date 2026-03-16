// ABOUTME: Tests for the DataGrid wrapper component
// ABOUTME: Verifies AG Grid renders with column definitions and row data
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from '../data-grid';

interface TestRow {
  name: string;
  score: number;
}

describe('DataGrid', () => {
  it('renders AG Grid with column definitions and row data', () => {
    const columns = [
      { field: 'name' as const, headerName: 'Name' },
      { field: 'score' as const, headerName: 'Score' },
    ];
    const rows: TestRow[] = [
      { name: 'Player 1', score: 10 },
      { name: 'Player 2', score: 20 },
    ];

    const { container } = render(
      <DataGrid columnDefs={columns} rowData={rows} />
    );

    const grid = container.querySelector('.ag-root-wrapper');
    expect(grid).toBeTruthy();
  });

  it('applies custom height when provided', () => {
    const { container } = render(
      <DataGrid columnDefs={[]} rowData={[]} height="400px" />
    );

    const wrapper = container.firstElementChild;
    expect(wrapper).toBeTruthy();
    expect((wrapper as HTMLElement).style.height).toBe('400px');
  });
});
