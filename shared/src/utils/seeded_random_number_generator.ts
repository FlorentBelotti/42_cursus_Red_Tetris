/**
 * A "seeded" random number generator: a way of producing a stream of
 * numbers that looks random, but that is actually always the same stream
 * whenever it is started with the same seed number.
 *
 * `Math.random()` cannot be used for this project's piece sequence, because
 * `Math.random()` gives a different answer every time the program runs, and
 * every player in the same room must see the exact same pieces, in the
 * exact same order. The server only sends one
 * small number - the "seed" - and every player's browser builds the same
 * piece sequence from that one number, locally, using the generator below.
 * That only works if the generator is deterministic (same seed in, same
 * numbers out, every single time).
 *
 * The algorithm used here is called a "Linear Congruential Generator"
 * (LCG). It is one of the oldest and simplest ways to build a
 * pseudo-random number generator. All it does, over and over, is:
 *
 *   newState = (oldState * MULTIPLIER + INCREMENT) remainder MODULUS
 *
 * and then it turns `newState` into a number between 0 and 1 by dividing
 * it by MODULUS. The three constants below are the ones described in the
 * book "Numerical Recipes" - they are well-known values chosen so that the
 * generated numbers are spread out evenly instead of following an obvious
 * pattern.
 */

/** Multiplies the previous state on every step of the LCG formula above. */
const LINEAR_CONGRUENTIAL_MULTIPLIER = 1664525;

/** Added to the previous state on every step of the LCG formula above. */
const LINEAR_CONGRUENTIAL_INCREMENT = 1013904223;

/**
 * Every step "wraps around" after reaching this value, the same way a
 * clock wraps around after 12 hours. This is 2 to the power of 32.
 */
const LINEAR_CONGRUENTIAL_MODULUS = 4294967296;

/**
 * A function that hands out the next pseudo-random number every time it is
 * called. Just like `Math.random()`, every number it returns is greater
 * than or equal to 0, and strictly less than 1.
 */
export type RandomNumberGenerator = () => number;

/**
 * Builds a new random number generator that always produces the exact same
 * sequence of numbers for the exact same `seedValue`.
 *
 * @param seedValue - Any whole number. Passing the same `seedValue` again,
 *   anywhere (a different browser tab, a different player's computer, a
 *   unit test), reproduces the exact same sequence of random numbers.
 * @returns A `RandomNumberGenerator` function. The first call returns the
 *   first random number of the sequence, the second call returns the
 *   second random number, and so on for as long as it keeps being called.
 */
export function createSeededRandomNumberGenerator(seedValue: number): RandomNumberGenerator {
  const wholeSeedValue = Math.floor(Math.abs(seedValue));
  let currentState = wholeSeedValue % LINEAR_CONGRUENTIAL_MODULUS;

  function generateNextRandomNumber(): number {
    const nextState =
      (currentState * LINEAR_CONGRUENTIAL_MULTIPLIER + LINEAR_CONGRUENTIAL_INCREMENT) %
      LINEAR_CONGRUENTIAL_MODULUS;

    currentState = nextState;

    return currentState / LINEAR_CONGRUENTIAL_MODULUS;
  }

  return generateNextRandomNumber;
}
