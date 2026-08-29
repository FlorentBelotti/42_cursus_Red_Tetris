import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { hardDropActivePiece } from './piece_hard_drop_resolution';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('hardDropActivePiece', () => {
  it('drops straight to the floor on an empty board', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 0, column: 4 };

    const dropped = hardDropActivePiece(board, piece);

    expect(dropped.row).toBe(18);
  });

  it('stops just above a stack', () => {
    const board = createEmptyBoardMatrix();
    const row = board[15];
    if (row === undefined) {
      throw new Error('expected row 15');
    }
    row[4] = 'filled';
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 0, column: 4 };

    const dropped = hardDropActivePiece(board, piece);

    expect(dropped.row).toBe(13);
  });
});
