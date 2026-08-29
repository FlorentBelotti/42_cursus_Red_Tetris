import { BOARD_COLUMN_COUNT, TETROMINO_SHAPE_DEFINITIONS, TetrominoType } from 'shared';

import type { ActivePieceState } from './active_piece_state';

export function spawnActivePiece(type: TetrominoType): ActivePieceState {
  const boundingBoxSize = TETROMINO_SHAPE_DEFINITIONS[type].boundingBoxSize;
  const column = Math.floor((BOARD_COLUMN_COUNT - boundingBoxSize) / 2);

  return { type, rotationIndex: 0, row: 0, column };
}
