import { describe, expect, it } from 'vitest';
import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT, TetrominoType } from 'shared';

import { projectBoardForDisplay } from './board_display_projection';
import { createEmptyBoardMatrix } from './empty_board_matrix_factory';

describe('projectBoardForDisplay', () => {
  it('flattens the board row-major with no active piece', () => {
    const board = createEmptyBoardMatrix();

    const projected = projectBoardForDisplay(board, null);

    expect(projected.length).toBe(BOARD_COLUMN_COUNT * BOARD_ROW_COUNT);
    expect(projected.every((cell) => cell === 'empty')).toBe(true);
  });

  it('overlays the active piece cells as active without touching the board', () => {
    const board = createEmptyBoardMatrix();
    const piece = { type: TetrominoType.O, rotationIndex: 0 as const, row: 0, column: 0 };

    const projected = projectBoardForDisplay(board, piece);

    expect(projected[0]).toBe('active');
    expect(projected[1]).toBe('active');
    expect(projected[BOARD_COLUMN_COUNT]).toBe('active');
    expect(board[0]?.[0]).toBe('empty');
  });
});
