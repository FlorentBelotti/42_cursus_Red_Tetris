const LINEAR_CONGRUENTIAL_MULTIPLIER = 1664525;

const LINEAR_CONGRUENTIAL_INCREMENT = 1013904223;

const LINEAR_CONGRUENTIAL_MODULUS = 4294967296;

export type RandomNumberGenerator = () => number;

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
