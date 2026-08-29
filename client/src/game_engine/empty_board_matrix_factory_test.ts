import { describe, expect, it } from 'vitest';
import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from 'shared';

import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('createEmptyBoardMatrix', () => {
  it('creates BOARD_ROW_COUNT rows of BOARD_COLUMN_COUNT empty cells', () => {
    const board = createEmptyBoardMatrix();

    expect(board.length).toBe(BOARD_ROW_COUNT);
    board.forEach((row) => {
      expect(row.length).toBe(BOARD_COLUMN_COUNT);
      row.forEach((cell) => {
        expect(cell).toBe('empty');
      });
    });
  });

  it('returns independent row arrays', () => {
    const board = createEmptyBoardMatrix();
    const firstRow = board[0];
    if (firstRow === undefined) {
      throw new Error('expected a first row');
    }
    firstRow[0] = 'filled';

    const secondRow = board[1];
    if (secondRow === undefined) {
      throw new Error('expected a second row');
    }
    expect(secondRow[0]).toBe('empty');
  });
});
