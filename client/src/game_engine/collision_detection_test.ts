import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { doesActivePieceCollide } from './collision_detection';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('doesActivePieceCollide', () => {
  it('is false on an empty board within bounds', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 4 };

    expect(doesActivePieceCollide(board, piece)).toBe(false);
  });

  it('is true past the left wall', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: -1 };

    expect(doesActivePieceCollide(board, piece)).toBe(true);
  });

  it('is true past the right wall', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 9 };

    expect(doesActivePieceCollide(board, piece)).toBe(true);
  });

  it('is true below the floor', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 19, column: 4 };

    expect(doesActivePieceCollide(board, piece)).toBe(true);
  });

  it('is true against an occupied cell', () => {
    const board = createEmptyBoardMatrix();
    const row = board[6];
    if (row === undefined) {
      throw new Error('expected row 6');
    }
    row[4] = 'filled';
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 4 };

    expect(doesActivePieceCollide(board, piece)).toBe(true);
  });
});
