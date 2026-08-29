import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { moveActivePieceHorizontally } from './piece_horizontal_movement';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('moveActivePieceHorizontally', () => {
  const board = createEmptyBoardMatrix();
  const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 4 };

  it('moves right when free', () => {
    const moved = moveActivePieceHorizontally(board, piece, 1);
    expect(moved.column).toBe(5);
  });

  it('moves left when free', () => {
    const moved = moveActivePieceHorizontally(board, piece, -1);
    expect(moved.column).toBe(3);
  });

  it('stays put when the move would collide with the wall', () => {
    const atWall = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 0 };
    const moved = moveActivePieceHorizontally(board, atWall, -1);
    expect(moved).toBe(atWall);
  });
});
