import {
  createSeededRandomNumberGenerator,
  type RandomNumberGenerator,
} from '../utils/seeded_random_number_generator.js';
import { ALL_TETROMINO_TYPES, TetrominoType } from './tetromino_type_enum.js';

export type PieceSequenceGenerator = () => TetrominoType;

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
