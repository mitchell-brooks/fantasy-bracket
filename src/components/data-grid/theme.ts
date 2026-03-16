// ABOUTME: Shared AG Grid Ink & Paper theme definition
// ABOUTME: Used by both DataGrid (read-only tables) and DraftGrid (drag-and-drop rankings)
import { themeQuartz } from 'ag-grid-community';

export const inkAndPaperTheme = themeQuartz.withParams({
  backgroundColor: '#faf8f4',
  foregroundColor: '#2a2a2a',
  borderColor: '#d4cfc5',
  headerBackgroundColor: '#f4f1eb',
  headerFontSize: 14,
  headerFontWeight: 600,
  fontSize: 14,
  rowHoverColor: '#edeae3',
  selectedRowBackgroundColor: '#e8e4dc',
  accentColor: '#c44536',
});
