import { BOARD_COLUMN_COUNT, type BoardCellValue } from 'shared';

import type { BoardMatrix } from './empty_board_matrix_factory';

export function insertPenaltyLines(board: BoardMatrix, penaltyLineCount: number): BoardMatrix {
  if (penaltyLineCount <= 0) {
    return board;
  }

  const survivingRows = board.slice(penaltyLineCount);

  const penaltyRows: BoardCellValue[][] = [];
  for (let index = 0; index < penaltyLineCount; index += 1) {
    penaltyRows.push(new Array<BoardCellValue>(BOARD_COLUMN_COUNT).fill('penalty'));
  }

  return [...survivingRows, ...penaltyRows];
}
