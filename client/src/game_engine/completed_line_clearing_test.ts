import { describe, expect, it } from 'vitest';
import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from 'shared';

import { clearCompletedLines } from './completed_line_clearing';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('clearCompletedLines', () => {
  it('does nothing when no row is complete', () => {
    const board = createEmptyBoardMatrix();
    const result = clearCompletedLines(board);

    expect(result.clearedLineCount).toBe(0);
    expect(result.board).toBe(board);
  });

  it('clears a row that is entirely filled', () => {
    const board = createEmptyBoardMatrix();
    const fullRow = board[19];
    if (fullRow === undefined) {
      throw new Error('expected row 19');
    }
    for (let column = 0; column < BOARD_COLUMN_COUNT; column += 1) {
      fullRow[column] = 'filled';
    }

    const result = clearCompletedLines(board);

    expect(result.clearedLineCount).toBe(1);
    expect(result.board.length).toBe(BOARD_ROW_COUNT);
    expect(result.board[0]?.every((cell) => cell === 'empty')).toBe(true);
    expect(result.board[19]).not.toBe(fullRow);
  });

  it('does not clear a row that is full but contains a penalty cell (C11)', () => {
    const board = createEmptyBoardMatrix();
    const almostFullRow = board[19];
    if (almostFullRow === undefined) {
      throw new Error('expected row 19');
    }
    for (let column = 0; column < BOARD_COLUMN_COUNT; column += 1) {
      almostFullRow[column] = 'filled';
    }
    almostFullRow[0] = 'penalty';

    const result = clearCompletedLines(board);

    expect(result.clearedLineCount).toBe(0);
  });
});
