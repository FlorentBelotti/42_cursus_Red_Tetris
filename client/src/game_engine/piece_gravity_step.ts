import type { ActivePieceState } from './active_piece_state';
import { doesActivePieceCollide } from './collision_detection';
import type { BoardMatrix } from './empty_board_matrix_factory';

export function applyGravityStep(board: BoardMatrix, activePiece: ActivePieceState): ActivePieceState {
  const droppedPiece: ActivePieceState = { ...activePiece, row: activePiece.row + 1 };

  if (doesActivePieceCollide(board, droppedPiece)) {
    return activePiece;
  }

  return droppedPiece;
}
