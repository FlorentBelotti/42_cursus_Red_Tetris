import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from 'shared';
import type { BoardCellState } from './board_cell_state';

function createEmptyRow(): BoardCellState[] {
  const row: BoardCellState[] = [];

  for (let column = 0; column < BOARD_COLUMN_COUNT; column += 1) {
    row.push('empty');
  }

  return row;
}

function setCellState(
  rows: BoardCellState[][],
  rowIndex: number,
  columnIndex: number,
  state: BoardCellState,
): void {
  const row = rows[rowIndex];

  if (row === undefined) {
    throw new Error(`Placeholder board row ${rowIndex} is out of range`);
  }

  row[columnIndex] = state;
}

function buildPlaceholderBoardRows(): BoardCellState[][] {
  const rows: BoardCellState[][] = [];

  for (let rowIndex = 0; rowIndex < BOARD_ROW_COUNT; rowIndex += 1) {
    rows.push(createEmptyRow());
  }

  const activePieceCells: ReadonlyArray<readonly [row: number, column: number]> = [
    [2, 5],
    [2, 6],
    [3, 4],
    [3, 5],
  ];
  activePieceCells.forEach(([rowIndex, columnIndex]) => {
    setCellState(rows, rowIndex, columnIndex, 'active');
  });

  const settledStackCells: ReadonlyArray<readonly [row: number, column: number]> = [
    [15, 3],
    [16, 1],
    [16, 2],
    [16, 3],
    [16, 4],
    [16, 8],
    [17, 0],
    [17, 1],
    [17, 2],
    [17, 3],
    [17, 4],
    [17, 5],
    [17, 6],
    [17, 7],
    [17, 8],
    [18, 0],
    [18, 1],
    [18, 2],
    [18, 3],
    [18, 4],
    [18, 5],
    [18, 6],
    [18, 7],
    [18, 8],
  ];
  settledStackCells.forEach(([rowIndex, columnIndex]) => {
    setCellState(rows, rowIndex, columnIndex, 'filled');
  });

  const penaltyRowIndex = BOARD_ROW_COUNT - 1;
  for (let column = 0; column < BOARD_COLUMN_COUNT; column += 1) {
    setCellState(rows, penaltyRowIndex, column, 'penalty');
  }

  return rows;
}

export const PLACEHOLDER_BOARD_CELLS: readonly BoardCellState[] = buildPlaceholderBoardRows().flat();
