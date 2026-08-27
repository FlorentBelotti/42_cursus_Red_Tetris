import type { BoardCellState } from './board_cell_state';

const NEXT_PIECE_GRID_CELL_COUNT = 16;

function buildNextPiecePreviewCells(): BoardCellState[] {
  const cells: BoardCellState[] = new Array(NEXT_PIECE_GRID_CELL_COUNT).fill('empty');
  const activeCellIndexes = [5, 6, 9, 10];

  activeCellIndexes.forEach((cellIndex) => {
    cells[cellIndex] = 'active';
  });

  return cells;
}

export const NEXT_PIECE_PREVIEW_CELLS: readonly BoardCellState[] = buildNextPiecePreviewCells();
