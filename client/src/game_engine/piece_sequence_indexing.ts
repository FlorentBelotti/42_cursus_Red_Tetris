import { createPieceSequenceGenerator, TetrominoType } from 'shared';

export function getTetrominoTypeAtSequenceIndex(seed: number, index: number): TetrominoType {
  const pieceSequenceGenerator = createPieceSequenceGenerator(seed);

  let tetrominoType = pieceSequenceGenerator();
  for (let step = 0; step < index; step += 1) {
    tetrominoType = pieceSequenceGenerator();
  }

  return tetrominoType;
}
