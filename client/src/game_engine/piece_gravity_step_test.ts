import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { applyGravityStep } from './piece_gravity_step';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('applyGravityStep', () => {
  it('drops the piece by one row when free', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 4 };

    const dropped = applyGravityStep(board, piece);

    expect(dropped.row).toBe(6);
  });

  it('returns the same piece when the floor blocks it', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 18, column: 4 };

    const dropped = applyGravityStep(board, piece);

    expect(dropped).toBe(piece);
  });
});
