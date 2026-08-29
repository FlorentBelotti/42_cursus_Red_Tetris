import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT, type SpectrumColumnHeights } from 'shared';

import type { BoardMatrix } from './empty_board_matrix_factory';

export function computeSpectrumColumnHeights(board: BoardMatrix): SpectrumColumnHeights {
  const heights: number[] = [];

  for (let column = 0; column < BOARD_COLUMN_COUNT; column += 1) {
    let height = 0;

    for (let row = 0; row < BOARD_ROW_COUNT; row += 1) {
      if (board[row]?.[column] !== 'empty') {
        height = BOARD_ROW_COUNT - row;
        break;
      }
    }

    heights.push(height);
  }

  return heights;
}
