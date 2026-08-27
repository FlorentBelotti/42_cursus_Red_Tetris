import { TetrominoType } from './tetromino_type_enum';

/**
 * A single occupied cell of a tetromino, expressed as [row, column] offsets
 * inside that piece's bounding box (row 0 = top, column 0 = left).
 */
export type TetrominoCellCoordinate = readonly [row: number, column: number];

/**
 * The four occupied cells of a tetromino in one rotation state.
 */
export type TetrominoRotationState = readonly [
  TetrominoCellCoordinate,
  TetrominoCellCoordinate,
  TetrominoCellCoordinate,
  TetrominoCellCoordinate,
];

/**
 * The four rotation states of a tetromino, indexed 0 to 3, in clockwise
 * order. Rotation index 0 is the spawn orientation.
 */
export type TetrominoRotationStates = readonly [
  TetrominoRotationState,
  TetrominoRotationState,
  TetrominoRotationState,
  TetrominoRotationState,
];

/**
 * Full shape description of one tetromino type: the size of the square
 * bounding box its coordinates are expressed in, and its four rotation
 * states.
 */
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
