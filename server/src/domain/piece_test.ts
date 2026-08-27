import { describe, expect, it } from 'vitest';

import { TetrominoType } from 'shared';

import { Piece } from './piece';

const SPAWN_AT_TOP_MIDDLE = { spawnColumn: 4, spawnRow: 0 };

describe('Piece creation', () => {
  it('remembers the tetromino type it was created with', () => {
    const piece = new Piece(TetrominoType.T, SPAWN_AT_TOP_MIDDLE);

    expect(piece.getPieceType()).toBe(TetrominoType.T);
  });

  it('remembers the coordinates it spawns at', () => {
    const piece = new Piece(TetrominoType.I, { spawnColumn: 3, spawnRow: 1 });

    expect(piece.getSpawnCoordinates()).toEqual({ spawnColumn: 3, spawnRow: 1 });
  });

  it('starts in rotation state zero when no state is given', () => {
    const piece = new Piece(TetrominoType.O, SPAWN_AT_TOP_MIDDLE);

    expect(piece.getRotationIndex()).toBe(0);
  });

  it('starts in the rotation state it was given', () => {
    const piece = new Piece(TetrominoType.S, SPAWN_AT_TOP_MIDDLE, 2);

    expect(piece.getRotationIndex()).toBe(2);
  });

  it('wraps a starting rotation state that is too large', () => {
    const piece = new Piece(TetrominoType.Z, SPAWN_AT_TOP_MIDDLE, 4);

    expect(piece.getRotationIndex()).toBe(0);
  });
});

describe('Piece rotation', () => {
  it('records a new rotation state', () => {
    const piece = new Piece(TetrominoType.J, SPAWN_AT_TOP_MIDDLE);

    piece.setRotationIndex(2);

    expect(piece.getRotationIndex()).toBe(2);
  });

  it('wraps back to zero after the fourth rotation state', () => {
    const piece = new Piece(TetrominoType.L, SPAWN_AT_TOP_MIDDLE);

    piece.setRotationIndex(4);

    expect(piece.getRotationIndex()).toBe(0);
  });

  it('wraps a rotation state well beyond four', () => {
    const piece = new Piece(TetrominoType.T, SPAWN_AT_TOP_MIDDLE);

    piece.setRotationIndex(9);

    expect(piece.getRotationIndex()).toBe(1);
  });

  it('wraps a negative rotation state into the valid range', () => {
    const piece = new Piece(TetrominoType.T, SPAWN_AT_TOP_MIDDLE);

    piece.setRotationIndex(-1);

    expect(piece.getRotationIndex()).toBe(3);
  });

  it('wraps a rotation state well below zero', () => {
    const piece = new Piece(TetrominoType.T, SPAWN_AT_TOP_MIDDLE);

    piece.setRotationIndex(-5);

    expect(piece.getRotationIndex()).toBe(3);
  });

  it('always reports one of the four valid rotation states', () => {
    const piece = new Piece(TetrominoType.T, SPAWN_AT_TOP_MIDDLE);
    const testedIndexes = [-8, -3, 0, 1, 5, 12, 27];

    for (const testedIndex of testedIndexes) {
      piece.setRotationIndex(testedIndex);

      expect(piece.getRotationIndex()).toBeGreaterThanOrEqual(0);
      expect(piece.getRotationIndex()).toBeLessThanOrEqual(3);
    }
  });
});

describe('Piece spawn coordinates', () => {
  it('cannot be changed through the coordinates it hands back', () => {
    const piece = new Piece(TetrominoType.I, { spawnColumn: 3, spawnRow: 1 });

    const handedBackCoordinates = piece.getSpawnCoordinates() as {
      spawnColumn: number;
      spawnRow: number;
    };
    handedBackCoordinates.spawnColumn = 99;

    expect(piece.getSpawnCoordinates().spawnColumn).toBe(3);
  });

  it('does not change when the object it was created with is modified', () => {
    const spawnCoordinates = { spawnColumn: 3, spawnRow: 1 };
    const piece = new Piece(TetrominoType.I, spawnCoordinates);

    spawnCoordinates.spawnColumn = 99;

    expect(piece.getSpawnCoordinates().spawnColumn).toBe(3);
  });
});
