import { describe, expect, it } from 'vitest';

import { isBoardToppedOut } from './game_over_detection';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('isBoardToppedOut', () => {
  it('is false when the top row is empty', () => {
    const board = createEmptyBoardMatrix();

    expect(isBoardToppedOut(board)).toBe(false);
  });

  it('is true when the top row has any occupied cell', () => {
    const board = createEmptyBoardMatrix();
    const topRow = board[0];
    if (topRow === undefined) {
      throw new Error('expected row 0');
    }
    topRow[5] = 'penalty';

    expect(isBoardToppedOut(board)).toBe(true);
  });
});
