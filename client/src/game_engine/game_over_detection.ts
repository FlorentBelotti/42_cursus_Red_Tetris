import type { BoardMatrix } from './empty_board_matrix_factory';

export function isBoardToppedOut(board: BoardMatrix): boolean {
  return board[0]?.some((cell) => cell !== 'empty') ?? false;
}
