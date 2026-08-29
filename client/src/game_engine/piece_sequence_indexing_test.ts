import { describe, expect, it } from 'vitest';
import { createPieceSequenceGenerator } from 'shared';

import { getTetrominoTypeAtSequenceIndex } from './piece_sequence_indexing';

describe('getTetrominoTypeAtSequenceIndex', () => {
  it('matches calling the sequence generator that many times', () => {
    const seed = 42;
    const generator = createPieceSequenceGenerator(seed);
    const expectedTypes = [generator(), generator(), generator(), generator()];

    expectedTypes.forEach((expectedType, index) => {
      expect(getTetrominoTypeAtSequenceIndex(seed, index)).toBe(expectedType);
    });
  });

  it('is deterministic for the same seed and index', () => {
    const first = getTetrominoTypeAtSequenceIndex(7, 10);
    const second = getTetrominoTypeAtSequenceIndex(7, 10);

    expect(first).toBe(second);
  });
});
