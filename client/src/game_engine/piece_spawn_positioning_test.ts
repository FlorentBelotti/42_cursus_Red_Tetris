import { describe, expect, it } from 'vitest';
import { TetrominoType } from 'shared';

import { spawnActivePiece } from './piece_spawn_positioning';

describe('spawnActivePiece', () => {
  it('spawns at the top row with rotation index 0', () => {
    const piece = spawnActivePiece(TetrominoType.T);

    expect(piece.row).toBe(0);
    expect(piece.rotationIndex).toBe(0);
    expect(piece.type).toBe(TetrominoType.T);
  });

  it('centers the piece by its bounding box size', () => {
    const oPiece = spawnActivePiece(TetrominoType.O);
    const iPiece = spawnActivePiece(TetrominoType.I);

    expect(oPiece.column).toBe(4);
    expect(iPiece.column).toBe(3);
  });
});
