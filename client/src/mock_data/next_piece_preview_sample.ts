import type { BoardCellState } from './board_cell_state';

const NEXT_PIECE_GRID_CELL_COUNT = 16;

/**
 * Builds the flat 4x4 preview grid, matching the S-piece silhouette shown in
 * the reference mockup (design_handoff_red_tetris/03 In-Game.dc.html).
 *
 * @returns 16 cells, index = row * 4 + column.
 */
function buildNextPiecePreviewCells(): BoardCellState[] {
  const cells: BoardCellState[] = new Array(NEXT_PIECE_GRID_CELL_COUNT).fill('empty');
  const activeCellIndexes = [5, 6, 9, 10];

  activeCellIndexes.forEach((cellIndex) => {
    cells[cellIndex] = 'active';
  });

  return cells;
}

/**
 * Placeholder "next piece" preview: a static S-piece silhouette.
 */
export const NEXT_PIECE_PREVIEW_CELLS: readonly BoardCellState[] = buildNextPiecePreviewCells();
