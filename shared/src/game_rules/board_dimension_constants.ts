/**
 * Single source of truth for the Tetris board's fixed dimensions (C9).
 * Never hardcode 10 or 20 anywhere else in the codebase.
 */
export const BOARD_COLUMN_COUNT = 10;

/**
 * Number of rows in the Tetris board.
 */
export const BOARD_ROW_COUNT = 20;

/**
 * Total number of cells in the board (columns times rows).
 */
export const BOARD_CELL_COUNT = BOARD_COLUMN_COUNT * BOARD_ROW_COUNT;
