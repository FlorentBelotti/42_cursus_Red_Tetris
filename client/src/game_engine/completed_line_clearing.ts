import { BOARD_COLUMN_COUNT, type BoardCellValue } from 'shared';

import type { BoardMatrix } from './empty_board_matrix_factory';

export type LineClearingResult = {
  readonly board: BoardMatrix;
  readonly clearedLineCount: number;
};

function isRowComplete(row: readonly BoardCellValue[]): boolean {
  return row.every((cell) => cell === 'filled');
}

export function clearCompletedLines(board: BoardMatrix): LineClearingResult {
  const remainingRows = board.filter((row) => isRowComplete(row) === false);
  const clearedLineCount = board.length - remainingRows.length;

  if (clearedLineCount === 0) {
    return { board, clearedLineCount: 0 };
  }

  const freshEmptyRows: BoardCellValue[][] = [];
  for (let index = 0; index < clearedLineCount; index += 1) {
    freshEmptyRows.push(new Array<BoardCellValue>(BOARD_COLUMN_COUNT).fill('empty'));
  }

  return { board: [...freshEmptyRows, ...remainingRows], clearedLineCount };
}
