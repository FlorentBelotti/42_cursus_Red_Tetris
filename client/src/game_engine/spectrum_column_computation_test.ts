import { describe, expect, it } from 'vitest';
import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from 'shared';

import { computeSpectrumColumnHeights } from './spectrum_column_computation';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('computeSpectrumColumnHeights', () => {
  it('is all zeros for an empty board', () => {
    const board = createEmptyBoardMatrix();

    const heights = computeSpectrumColumnHeights(board);

    expect(heights.length).toBe(BOARD_COLUMN_COUNT);
    expect(heights.every((height) => height === 0)).toBe(true);
  });

  it('measures the height of the topmost occupied cell per column', () => {
    const board = createEmptyBoardMatrix();
    const row = board[15];
    if (row === undefined) {
      throw new Error('expected row 15');
    }
    row[3] = 'filled';

    const heights = computeSpectrumColumnHeights(board);

    expect(heights[3]).toBe(BOARD_ROW_COUNT - 15);
    expect(heights[2]).toBe(0);
  });
});
