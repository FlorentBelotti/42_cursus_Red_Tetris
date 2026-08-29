import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { rotateActivePiece } from './piece_rotation_resolution';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('rotateActivePiece', () => {
  it('advances the rotation index on an empty board', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.T, rotationIndex: 0 as const, row: 5, column: 4 };

    const rotated = rotateActivePiece(board, piece);

    expect(rotated.rotationIndex).toBe(1);
  });

  it('wraps rotation index from 3 back to 0', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.T, rotationIndex: 3 as const, row: 5, column: 4 };

    const rotated = rotateActivePiece(board, piece);

    expect(rotated.rotationIndex).toBe(0);
  });

  it('wall-kicks away from the left wall instead of rotating out of bounds', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.I, rotationIndex: 0 as const, row: 5, column: 0 };

    const rotated = rotateActivePiece(board, piece);

    expect(rotated.rotationIndex).toBe(1);
    expect(rotated.column).toBeGreaterThanOrEqual(0);
  });

  it('gives up and returns the original piece when every kick collides', () => {
    const board = createEmptyBoardMatrix();
    for (let column = 0; column < 10; column += 1) {
      const row = board[6];
      if (row === undefined) {
        throw new Error('expected row 6');
      }
      row[column] = 'filled';
    }
    const piece = { type: TetrominoType.T, rotationIndex: 0 as const, row: 5, column: 4 };

    const rotated = rotateActivePiece(board, piece);

    expect(rotated).toBe(piece);
  });
});
