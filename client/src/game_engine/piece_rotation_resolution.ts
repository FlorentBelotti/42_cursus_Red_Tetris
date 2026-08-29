import type { ActivePieceState } from './active_piece_state';
import { doesActivePieceCollide } from './collision_detection';
import type { BoardMatrix } from './empty_board_matrix_factory';

const ROTATION_STATE_COUNT = 4;

const WALL_KICK_COLUMN_OFFSETS = [0, -1, 1, -2, 2];

export function rotateActivePiece(board: BoardMatrix, activePiece: ActivePieceState): ActivePieceState {
  const nextRotationIndex = ((activePiece.rotationIndex + 1) % ROTATION_STATE_COUNT) as 0 | 1 | 2 | 3;

  for (const columnOffset of WALL_KICK_COLUMN_OFFSETS) {
    const candidatePiece: ActivePieceState = {
      ...activePiece,
      rotationIndex: nextRotationIndex,
      column: activePiece.column + columnOffset,
    };

    if (doesActivePieceCollide(board, candidatePiece) === false) {
      return candidatePiece;
    }
  }

  return activePiece;
}
