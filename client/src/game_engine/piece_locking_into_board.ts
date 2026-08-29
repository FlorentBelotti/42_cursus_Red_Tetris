import type { BoardCellValue } from 'shared';

import { getActivePieceCells, type ActivePieceState } from './active_piece_state';
import type { BoardMatrix } from './empty_board_matrix_factory';

export function lockActivePieceIntoBoard(board: BoardMatrix, activePiece: ActivePieceState): BoardMatrix {
  const nextRows: BoardCellValue[][] = board.map((row) => [...row]);

  getActivePieceCells(activePiece).forEach(([row, column]) => {
    const targetRow = nextRows[row];

    if (targetRow !== undefined && column >= 0 && column < targetRow.length) {
      targetRow[column] = 'filled';
    }
  });

  return nextRows;
}
