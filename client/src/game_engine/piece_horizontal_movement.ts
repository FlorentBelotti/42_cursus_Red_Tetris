import type { ActivePieceState } from './active_piece_state';
import { doesActivePieceCollide } from './collision_detection';
import type { BoardMatrix } from './empty_board_matrix_factory';

export function moveActivePieceHorizontally(
  board: BoardMatrix,
  activePiece: ActivePieceState,
  columnDelta: -1 | 1,
): ActivePieceState {
  const movedPiece: ActivePieceState = { ...activePiece, column: activePiece.column + columnDelta };

  if (doesActivePieceCollide(board, movedPiece)) {
    return activePiece;
  }

  return movedPiece;
}
