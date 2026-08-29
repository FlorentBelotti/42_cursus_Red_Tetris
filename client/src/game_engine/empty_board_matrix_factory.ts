import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT, type BoardCellValue } from 'shared';

export type BoardMatrix = BoardCellValue[][];

export function createEmptyBoardMatrix(): BoardMatrix {
  const rows: BoardCellValue[][] = [];

  for (let rowIndex = 0; rowIndex < BOARD_ROW_COUNT; rowIndex += 1) {
    rows.push(new Array<BoardCellValue>(BOARD_COLUMN_COUNT).fill('empty'));
  }

  return rows;
}
