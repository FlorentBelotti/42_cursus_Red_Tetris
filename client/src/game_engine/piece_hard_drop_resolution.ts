import type { ActivePieceState } from './active_piece_state';
import type { BoardMatrix } from './empty_board_matrix_factory';
import { applyGravityStep } from './piece_gravity_step';

export function hardDropActivePiece(board: BoardMatrix, activePiece: ActivePieceState): ActivePieceState {
  let restingPiece = activePiece;
  let nextPiece = applyGravityStep(board, restingPiece);

  while (nextPiece !== restingPiece) {
    restingPiece = nextPiece;
    nextPiece = applyGravityStep(board, restingPiece);
  }

  return restingPiece;
}
