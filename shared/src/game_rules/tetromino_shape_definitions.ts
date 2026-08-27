import { TetrominoType } from './tetromino_type_enum.js';

export type TetrominoCellCoordinate = readonly [row: number, column: number];

export type TetrominoRotationState = readonly [
  TetrominoCellCoordinate,
  TetrominoCellCoordinate,
  TetrominoCellCoordinate,
  TetrominoCellCoordinate,
];

export type TetrominoRotationStates = readonly [
  TetrominoRotationState,
  TetrominoRotationState,
  TetrominoRotationState,
  TetrominoRotationState,
];

export interface TetrominoShapeDefinition {
  readonly boundingBoxSize: number;
  readonly rotationStates: TetrominoRotationStates;
}

export const TETROMINO_SHAPE_DEFINITIONS: Readonly<Record<TetrominoType, TetrominoShapeDefinition>> = {
  [TetrominoType.I]: {
    boundingBoxSize: 4,
    rotationStates: [
      [[1, 0], [1, 1], [1, 2], [1, 3]],
      [[0, 2], [1, 2], [2, 2], [3, 2]],
      [[2, 0], [2, 1], [2, 2], [2, 3]],
      [[0, 1], [1, 1], [2, 1], [3, 1]],
    ],
  },
  [TetrominoType.O]: {
    boundingBoxSize: 2,
    rotationStates: [
      [[0, 0], [0, 1], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 0], [1, 1]],
      [[0, 0], [0, 1], [1, 0], [1, 1]],
    ],
  },
  [TetrominoType.T]: {
    boundingBoxSize: 3,
    rotationStates: [
      [[0, 1], [1, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [1, 2], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 1]],
      [[0, 1], [1, 0], [1, 1], [2, 1]],
    ],
  },
  [TetrominoType.S]: {
    boundingBoxSize: 3,
    rotationStates: [
      [[0, 1], [0, 2], [1, 0], [1, 1]],
      [[0, 1], [1, 1], [1, 2], [2, 2]],
      [[1, 1], [1, 2], [2, 0], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [2, 1]],
    ],
  },
  [TetrominoType.Z]: {
    boundingBoxSize: 3,
    rotationStates: [
      [[0, 0], [0, 1], [1, 1], [1, 2]],
      [[0, 2], [1, 1], [1, 2], [2, 1]],
      [[1, 0], [1, 1], [2, 1], [2, 2]],
      [[0, 1], [1, 0], [1, 1], [2, 0]],
    ],
  },
  [TetrominoType.J]: {
    boundingBoxSize: 3,
    rotationStates: [
      [[0, 0], [1, 0], [1, 1], [1, 2]],
      [[0, 1], [0, 2], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 2]],
      [[0, 1], [1, 1], [2, 0], [2, 1]],
    ],
  },
  [TetrominoType.L]: {
    boundingBoxSize: 3,
    rotationStates: [
      [[0, 2], [1, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [2, 2]],
      [[1, 0], [1, 1], [1, 2], [2, 0]],
      [[0, 0], [0, 1], [1, 1], [2, 1]],
    ],
  },
};
