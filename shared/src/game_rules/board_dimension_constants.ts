/**
 * The single source of truth for the playfield size (C9). Both sides import
 * these constants; nobody writes 10 or 20 anywhere else.
 */

/** Number of columns in a player's board. */
export const BOARD_COLUMN_COUNT = 10;

/** Number of rows in a player's board. */
export const BOARD_ROW_COUNT = 20;

/**
 * Total number of cells in the board (columns times rows).
 */
export const BOARD_CELL_COUNT = BOARD_COLUMN_COUNT * BOARD_ROW_COUNT;
