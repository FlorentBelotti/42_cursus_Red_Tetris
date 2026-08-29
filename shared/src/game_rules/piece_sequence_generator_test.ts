import { describe, expect, it } from 'vitest';

import { createPieceSequenceGenerator } from './piece_sequence_generator';
import { ALL_TETROMINO_TYPES, TetrominoType } from './tetromino_type_enum';

const PIECE_COUNT_FOR_A_LONG_SEQUENCE = 350; // 50 full bags of 7 pieces
const TETROMINO_TYPES_PER_BAG = ALL_TETROMINO_TYPES.length;

/**
 * Calls a piece sequence generator several times in a row and collects
 * every tetromino type it hands out, in order. Used throughout this file
 * so each test can compare whole sequences instead of a single call.
 */
function collectPieceSequence(seed: number, howManyPieces: number): TetrominoType[] {
  const getNextPieceType = createPieceSequenceGenerator(seed);
  const collectedPieceTypes: TetrominoType[] = [];

  for (let pieceCount = 0; pieceCount < howManyPieces; pieceCount += 1) {
    collectedPieceTypes.push(getNextPieceType());
  }

  return collectedPieceTypes;
}

/**
 * Splits a long piece sequence into consecutive groups of seven, the same
 * size as one 7-bag round.
 */
function splitIntoBagSizedGroups(pieceSequence: readonly TetrominoType[]): TetrominoType[][] {
  const bagSizedGroups: TetrominoType[][] = [];

  for (
    let groupStartIndex = 0;
    groupStartIndex < pieceSequence.length;
    groupStartIndex += TETROMINO_TYPES_PER_BAG
  ) {
    const oneGroup = pieceSequence.slice(groupStartIndex, groupStartIndex + TETROMINO_TYPES_PER_BAG);
    bagSizedGroups.push(oneGroup);
  }

  return bagSizedGroups;
}

describe('createPieceSequenceGenerator follows the 7-bag rule', () => {
  it('hands out every one of the seven tetromino types exactly once per group of seven', () => {
    const pieceSequence = collectPieceSequence(2026, PIECE_COUNT_FOR_A_LONG_SEQUENCE);
    const bagSizedGroups = splitIntoBagSizedGroups(pieceSequence);

    for (const oneGroup of bagSizedGroups) {
      const sortedGroup = [...oneGroup].sort();
      const sortedAllTetrominoTypes = [...ALL_TETROMINO_TYPES].sort();

      expect(sortedGroup).toEqual(sortedAllTetrominoTypes);
    }
  });

  it('only ever hands out valid tetromino types', () => {
    const pieceSequence = collectPieceSequence(555, PIECE_COUNT_FOR_A_LONG_SEQUENCE);

    for (const pieceType of pieceSequence) {
      expect(ALL_TETROMINO_TYPES).toContain(pieceType);
    }
  });
});

describe('createPieceSequenceGenerator is deterministic', () => {
  it('produces the exact same sequence twice from the same seed', () => {
    const firstSequence = collectPieceSequence(42, PIECE_COUNT_FOR_A_LONG_SEQUENCE);
    const secondSequence = collectPieceSequence(42, PIECE_COUNT_FOR_A_LONG_SEQUENCE);

    expect(firstSequence).toEqual(secondSequence);
  });

  it('produces two independent generators from the same seed that agree call by call', () => {
    const firstGenerator = createPieceSequenceGenerator(2026);
    const secondGenerator = createPieceSequenceGenerator(2026);

    for (let pieceCount = 0; pieceCount < PIECE_COUNT_FOR_A_LONG_SEQUENCE; pieceCount += 1) {
      expect(firstGenerator()).toBe(secondGenerator());
    }
  });
});

describe('createPieceSequenceGenerator behaves differently for different seeds', () => {
  it('produces a different sequence for a different seed', () => {
    const sequenceFromSeedOne = collectPieceSequence(1, PIECE_COUNT_FOR_A_LONG_SEQUENCE);
    const sequenceFromSeedTwo = collectPieceSequence(2, PIECE_COUNT_FOR_A_LONG_SEQUENCE);

    expect(sequenceFromSeedOne).not.toEqual(sequenceFromSeedTwo);
  });
});

describe('createPieceSequenceGenerator keeps going past the first bag', () => {
  it('produces more than one full bag worth of pieces without error', () => {
    const getNextPieceType = createPieceSequenceGenerator(7);

    for (let pieceCount = 0; pieceCount < PIECE_COUNT_FOR_A_LONG_SEQUENCE; pieceCount += 1) {
      const pieceType = getNextPieceType();

      expect(ALL_TETROMINO_TYPES).toContain(pieceType);
    }
  });
});
