/**
 * Static coordinate tables for the seven original Tetriminoes, each as four
 * [column, row] cells within a bounding box. Data only — no rotation, no
 * collision, no spawn logic. This is a visual reference asset for this
 * design pass; the real seeded generator lives in shared/game_rules once the
 * game engine is implemented.
 */
export type TetrominoCellCoordinate = readonly [column: number, row: number];

export type TetrominoShape = readonly TetrominoCellCoordinate[];

export const TETROMINO_SHAPE_DEFINITIONS: readonly TetrominoShape[] = [
  [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
  ], // I
  [
    [1, 0],
    [2, 0],
    [1, 1],
    [2, 1],
  ], // O
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ], // T
  [
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
  ], // S
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [2, 1],
  ], // Z
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ], // J
  [
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
  ], // L
];
