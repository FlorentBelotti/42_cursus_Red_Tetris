import { describe, expect, it } from 'vitest';
import { BOARD_ROW_COUNT } from 'shared';

import { insertPenaltyLines } from './penalty_line_insertion';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('insertPenaltyLines', () => {
  it('returns the same board when the count is zero', () => {
    const board = createEmptyBoardMatrix();

    expect(insertPenaltyLines(board, 0)).toBe(board);
  });

  it('adds penalty rows at the bottom and keeps the row count', () => {
    const board = createEmptyBoardMatrix();

    const result = insertPenaltyLines(board, 2);

    expect(result.length).toBe(BOARD_ROW_COUNT);
    expect(result[BOARD_ROW_COUNT - 1]?.every((cell) => cell === 'penalty')).toBe(true);
    expect(result[BOARD_ROW_COUNT - 2]?.every((cell) => cell === 'penalty')).toBe(true);
    expect(result[BOARD_ROW_COUNT - 3]?.every((cell) => cell === 'empty')).toBe(true);
  });

  it('drops the topmost row and shifts the remaining rows up', () => {
    const board = createEmptyBoardMatrix();
    const markedRow = board[5];
    if (markedRow === undefined) {
      throw new Error('expected row 5');
    }
    markedRow[0] = 'filled';

    const result = insertPenaltyLines(board, 1);

    expect(result[4]?.[0]).toBe('filled');
  });
});
