import { describe, expect, it } from 'vitest';

import { createSeededRandomNumberGenerator } from './seeded_random_number_generator.js';

const NUMBERS_TO_CHECK_PER_TEST = 200;

function collectRandomNumbers(seedValue: number, howMany: number): number[] {
  const randomNumberGenerator = createSeededRandomNumberGenerator(seedValue);
  const collectedNumbers: number[] = [];

  for (let callCount = 0; callCount < howMany; callCount += 1) {
    collectedNumbers.push(randomNumberGenerator());
  }

  return collectedNumbers;
}

describe('createSeededRandomNumberGenerator produces numbers in the right range', () => {
  it('never returns a number below 0 or at/above 1', () => {
    const randomNumbers = collectRandomNumbers(12345, NUMBERS_TO_CHECK_PER_TEST);

    for (const randomNumber of randomNumbers) {
      expect(randomNumber).toBeGreaterThanOrEqual(0);
      expect(randomNumber).toBeLessThan(1);
    }
  });
});

describe('createSeededRandomNumberGenerator is deterministic', () => {
  it('produces the exact same sequence twice from the same seed', () => {
    const firstSequence = collectRandomNumbers(42, NUMBERS_TO_CHECK_PER_TEST);
    const secondSequence = collectRandomNumbers(42, NUMBERS_TO_CHECK_PER_TEST);

    expect(firstSequence).toEqual(secondSequence);
  });

  it('produces two independent generators from the same seed that agree call by call', () => {
    const firstGenerator = createSeededRandomNumberGenerator(999);
    const secondGenerator = createSeededRandomNumberGenerator(999);

    for (let callCount = 0; callCount < NUMBERS_TO_CHECK_PER_TEST; callCount += 1) {
      expect(firstGenerator()).toBe(secondGenerator());
    }
  });
});

describe('createSeededRandomNumberGenerator behaves differently for different seeds', () => {
  it('produces a different sequence for a different seed', () => {
    const sequenceFromSeedOne = collectRandomNumbers(1, NUMBERS_TO_CHECK_PER_TEST);
    const sequenceFromSeedTwo = collectRandomNumbers(2, NUMBERS_TO_CHECK_PER_TEST);

    expect(sequenceFromSeedOne).not.toEqual(sequenceFromSeedTwo);
  });
});

describe('createSeededRandomNumberGenerator accepts any whole number as a seed', () => {
  it('does not crash on a seed of zero, and still returns numbers in range', () => {
    const randomNumbers = collectRandomNumbers(0, NUMBERS_TO_CHECK_PER_TEST);

    for (const randomNumber of randomNumbers) {
      expect(randomNumber).toBeGreaterThanOrEqual(0);
      expect(randomNumber).toBeLessThan(1);
    }
  });

  it('treats a negative seed the same way as its positive version', () => {
    const sequenceFromNegativeSeed = collectRandomNumbers(-7, NUMBERS_TO_CHECK_PER_TEST);
    const sequenceFromPositiveSeed = collectRandomNumbers(7, NUMBERS_TO_CHECK_PER_TEST);

    expect(sequenceFromNegativeSeed).toEqual(sequenceFromPositiveSeed);
  });

  it('ignores anything after the decimal point of a fractional seed', () => {
    const sequenceFromFractionalSeed = collectRandomNumbers(7.9, NUMBERS_TO_CHECK_PER_TEST);
    const sequenceFromWholeSeed = collectRandomNumbers(7, NUMBERS_TO_CHECK_PER_TEST);

    expect(sequenceFromFractionalSeed).toEqual(sequenceFromWholeSeed);
  });
});
