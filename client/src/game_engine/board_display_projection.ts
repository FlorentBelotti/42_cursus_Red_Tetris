import type { BoardCellState } from './board_cell_state';
import { getActivePieceCells, type ActivePieceState } from './active_piece_state';
import type { BoardMatrix } from './empty_board_matrix_factory';

export function projectBoardForDisplay(
  board: BoardMatrix,
  activePiece: ActivePieceState | null,
): readonly BoardCellState[] {
  const rows: BoardCellState[][] = board.map((row) => [...row]);

  if (activePiece !== null) {
    getActivePieceCells(activePiece).forEach(([row, column]) => {
      const targetRow = rows[row];

      if (targetRow !== undefined && column >= 0 && column < targetRow.length) {
        targetRow[column] = 'active';
      }
    });
  }

  return rows.flat();
}
