import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { getActivePieceCells } from './active_piece_state';

describe('getActivePieceCells', () => {
  it('offsets the shape cells by the piece row and column', () => {
    const cells = getActivePieceCells({ type: TetrominoType.O, rotationIndex: 0, row: 5, column: 3 });

    expect(cells).toEqual([
      [5, 3],
      [5, 4],
      [6, 3],
      [6, 4],
    ]);
  });

  it('uses the requested rotation state', () => {
    const upright = getActivePieceCells({ type: TetrominoType.I, rotationIndex: 0, row: 0, column: 0 });
    const rotated = getActivePieceCells({ type: TetrominoType.I, rotationIndex: 1, row: 0, column: 0 });

    expect(upright).not.toEqual(rotated);
  });
});
