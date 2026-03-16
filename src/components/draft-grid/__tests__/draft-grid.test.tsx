// ABOUTME: Tests for the DraftGrid component with reorder and browse modes
// ABOUTME: Verifies grid rendering and mode-dependent behavior
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraftGrid } from '../draft-grid';
import type { DraftPlayer } from '../draft-grid';

const mockPlayers: DraftPlayer[] = [
  { player_unique: 'player-1', player_name: 'Player One', team_name: 'Team A', seed: 1, tournament_points: 50, points: 100, ranking: 1 },
  { player_unique: 'player-2', player_name: 'Player Two', team_name: 'Team B', seed: 5, tournament_points: 30, points: 80, ranking: 2 },
];

describe('DraftGrid', () => {
  it('renders AG Grid in browse mode', () => {
    const { container } = render(
      <DraftGrid
        players={mockPlayers}
        mode="browse"
        onModeChange={() => {}}
        onRankingsChange={() => {}}
      />
    );
    const grid = container.querySelector('.ag-root-wrapper');
    expect(grid).toBeTruthy();
  });

  it('renders AG Grid in reorder mode', () => {
    const { container } = render(
      <DraftGrid
        players={mockPlayers}
        mode="reorder"
        onModeChange={() => {}}
        onRankingsChange={() => {}}
      />
    );
    const grid = container.querySelector('.ag-root-wrapper');
    expect(grid).toBeTruthy();
  });

  it('shows mode toggle buttons', () => {
    render(
      <DraftGrid
        players={mockPlayers}
        mode="browse"
        onModeChange={() => {}}
        onRankingsChange={() => {}}
      />
    );
    expect(screen.getByText('Reorder')).toBeTruthy();
    expect(screen.getByText('Browse')).toBeTruthy();
  });

  it('calls onModeChange when toggle is clicked', () => {
    const onModeChange = vi.fn();
    render(
      <DraftGrid
        players={mockPlayers}
        mode="browse"
        onModeChange={onModeChange}
        onRankingsChange={() => {}}
      />
    );
    screen.getByText('Reorder').click();
    expect(onModeChange).toHaveBeenCalledWith('reorder');
  });

  it('shows hint text appropriate to current mode', () => {
    const { rerender } = render(
      <DraftGrid
        players={mockPlayers}
        mode="reorder"
        onModeChange={() => {}}
        onRankingsChange={() => {}}
      />
    );
    expect(screen.getByText(/drag rows/i)).toBeTruthy();

    rerender(
      <DraftGrid
        players={mockPlayers}
        mode="browse"
        onModeChange={() => {}}
        onRankingsChange={() => {}}
      />
    );
    expect(screen.getByText(/sort and filter/i)).toBeTruthy();
  });
});
