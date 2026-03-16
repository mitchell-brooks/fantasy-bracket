// ABOUTME: Toggle button for switching between reorder and browse modes in the draft grid
// ABOUTME: Reorder mode enables drag-and-drop ranking; browse mode enables free sorting/filtering
'use client';

import styles from './mode-toggle.module.css';

interface ModeToggleProps {
  mode: 'reorder' | 'browse';
  onModeChange: (mode: 'reorder' | 'browse') => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.toggleButton} ${mode === 'reorder' ? styles.active : ''}`}
        onClick={() => onModeChange('reorder')}
        type="button"
      >
        Reorder
      </button>
      <button
        className={`${styles.toggleButton} ${mode === 'browse' ? styles.active : ''}`}
        onClick={() => onModeChange('browse')}
        type="button"
      >
        Browse
      </button>
    </div>
  );
}
