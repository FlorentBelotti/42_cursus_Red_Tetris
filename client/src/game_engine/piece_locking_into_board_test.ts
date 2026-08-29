import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { lockActivePieceIntoBoard } from './piece_locking_into_board';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('lockActivePieceIntoBoard', () => {
  it('marks every active piece cell as filled', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 4 };

    const locked = lockActivePieceIntoBoard(board, piece);

    expect(locked[5]?.[4]).toBe('filled');
    expect(locked[5]?.[5]).toBe('filled');
    expect(locked[6]?.[4]).toBe('filled');
    expect(locked[6]?.[5]).toBe('filled');
  });

  it('does not mutate the original board', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 5, column: 4 };

    lockActivePieceIntoBoard(board, piece);

    expect(board[5]?.[4]).toBe('empty');
  });
});
