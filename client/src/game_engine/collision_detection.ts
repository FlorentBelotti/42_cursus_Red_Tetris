import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from 'shared';

import { getActivePieceCells, type ActivePieceState } from './active_piece_state';
import type { BoardMatrix } from './empty_board_matrix_factory';

export function doesActivePieceCollide(board: BoardMatrix, activePiece: ActivePieceState): boolean {
  return getActivePieceCells(activePiece).some(([row, column]) => {
    if (row < 0 || row >= BOARD_ROW_COUNT || column < 0 || column >= BOARD_COLUMN_COUNT) {
      return true;
    }

    return board[row]?.[column] !== 'empty';
  });
}
