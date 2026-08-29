/**
 * The "piece sequence generator": decides, one at a time, which tetromino
 * (I, O, T, S, Z, J or L) falls next.

 *
 * This guarantees a player is never stuck waiting an unfair number of turns
 * for a piece they need, because every group of seven pieces contains
 * exactly one of each type.
 *
 * The shuffling is driven by `createSeededRandomNumberGenerator` from
 * `shared/src/utils/seeded_random_number_generator.ts`, seeded with the
 * round's shared seed. Because that generator is deterministic, calling
 * this file's generator the same number of times, with the same seed,
 * always produces the exact same list of pieces - on the server, and on
 * every player's browser. That is what lets the server broadcast a single
 * seed number instead of every individual piece. This file must never be
 * reimplemented or copied elsewhere: any second copy could drift out of
 * sync and desynchronise a room.
 */

import {
  createSeededRandomNumberGenerator,
  type RandomNumberGenerator,
} from '../utils/seeded_random_number_generator';
import { ALL_TETROMINO_TYPES, TetrominoType } from './tetromino_type_enum';

/**
 * A function that hands out the next tetromino type every time it is
 * called, following the 7-bag rule described above.
 */
export type PieceSequenceGenerator = () => TetrominoType;

/**
 * Reads one element out of an array by its index, and throws instead of
 * silently returning `undefined` if the index does not exist.
 *
 * @param tetrominoTypes - The array to read from.
 * @param indexToRead - The position to read.
 * @returns The tetromino type found at `indexToRead`.
 */
function readTetrominoTypeAtIndex(
  tetrominoTypes: readonly TetrominoType[],
  indexToRead: number,
): TetrominoType {
  const tetrominoTypeAtIndex = tetrominoTypes[indexToRead];

  if (tetrominoTypeAtIndex === undefined) {
    throw new Error(`No tetromino type exists at index ${indexToRead} of the bag.`);
  }

  return tetrominoTypeAtIndex;
}

/**
 * Builds a brand new array containing the same seven tetromino types as
 * `orderedTetrominoTypes`, but rearranged into a random order. This uses
 * the classic "Fisher-Yates shuffle" algorithm: starting from the last
 * position, swap it with a random earlier (or equal) position, then move
 * one position to the left and repeat, until reaching the very first
 * position.
 *
 * @param orderedTetrominoTypes - The tetromino types to shuffle, in their
 *   starting order.
 * @param randomNumberGenerator - Supplies the random numbers that decide
 *   the new order. Pass a `RandomNumberGenerator` built by
 *   `createSeededRandomNumberGenerator` so the shuffle is reproducible.
 * @returns A new array with the same tetromino types, in a shuffled order.
 */
function shuffleTetrominoTypes(
  orderedTetrominoTypes: readonly TetrominoType[],
  randomNumberGenerator: RandomNumberGenerator,
): TetrominoType[] {
  const shuffledTetrominoTypes = [...orderedTetrominoTypes];

  for (
    let positionBeingFilled = shuffledTetrominoTypes.length - 1;
    positionBeingFilled > 0;
    positionBeingFilled -= 1
  ) {
    const randomEarlierPosition = Math.floor(randomNumberGenerator() * (positionBeingFilled + 1));

    const typeAtPositionBeingFilled = readTetrominoTypeAtIndex(
      shuffledTetrominoTypes,
      positionBeingFilled,
    );
    const typeAtRandomEarlierPosition = readTetrominoTypeAtIndex(
      shuffledTetrominoTypes,
      randomEarlierPosition,
    );

    shuffledTetrominoTypes[positionBeingFilled] = typeAtRandomEarlierPosition;
    shuffledTetrominoTypes[randomEarlierPosition] = typeAtPositionBeingFilled;
  }

  return shuffledTetrominoTypes;
}

/**
 * Builds a new piece sequence generator that follows the 7-bag rule
 *
 * @param seed - The round's shared seed, the same number the server sends
 *   in the `game:round_started` event's `pieceSequenceSeed` field.
 * @returns A `PieceSequenceGenerator` function. Call it once to get the
 *   first piece of the round, call it again for the next piece, and so on
 *   for as long as the round lasts.
 */
export function createPieceSequenceGenerator(seed: number): PieceSequenceGenerator {
  const randomNumberGenerator = createSeededRandomNumberGenerator(seed);

  let currentBag: TetrominoType[] = [];
  let nextPositionInBag = 0;

  function refillTheBagWithANewShuffle(): void {
    currentBag = shuffleTetrominoTypes(ALL_TETROMINO_TYPES, randomNumberGenerator);
    nextPositionInBag = 0;
  }

  function getNextPieceType(): TetrominoType {
    const theBagIsEmpty = nextPositionInBag >= currentBag.length;

    if (theBagIsEmpty) {
      refillTheBagWithANewShuffle();
    }

    const nextPieceType = readTetrominoTypeAtIndex(currentBag, nextPositionInBag);
    nextPositionInBag += 1;

    return nextPieceType;
  }

  return getNextPieceType;
}
