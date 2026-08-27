import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from 'shared';
import type { BoardCellState } from './board_cell_state';

/**
 * Builds one row of BOARD_COLUMN_COUNT empty cells.
 *
 * @returns A new row, all cells "empty".
 */
function createEmptyRow(): BoardCellState[] {
  const row: BoardCellState[] = [];

  for (let column = 0; column < BOARD_COLUMN_COUNT; column += 1) {
    row.push('empty');
  }

  return row;
}

/**
 * Sets one cell's state on a rows matrix built by buildPlaceholderBoardRows,
 * where every row index used below is known to be in range.
 *
 * @param rows - The board rows to mutate.
 * @param rowIndex - The target row.
 * @param columnIndex - The target column.
 * @param state - The cell state to set.
 */
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

/**
 * Builds a hardcoded, illustrative board snapshot: an active piece near the
 * top, a jagged settled stack (deliberately with no complete line, since a
 * complete line would already have cleared in a real round), and one
 * indestructible penalty row at the bottom.
 *
 * @returns BOARD_ROW_COUNT rows of BOARD_COLUMN_COUNT cells each.
 */
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

/**
 * Flat, row-major placeholder board: BOARD_COLUMN_COUNT * BOARD_ROW_COUNT
 * cells, index = row * BOARD_COLUMN_COUNT + column.
 */
export const PLACEHOLDER_BOARD_CELLS: readonly BoardCellState[] = buildPlaceholderBoardRows().flat();
