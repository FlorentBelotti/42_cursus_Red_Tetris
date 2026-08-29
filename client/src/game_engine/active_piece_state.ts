import { TETROMINO_SHAPE_DEFINITIONS, TetrominoType } from 'shared';

export type ActivePieceState = {
  readonly type: TetrominoType;
  readonly rotationIndex: 0 | 1 | 2 | 3;
  readonly row: number;
  readonly column: number;
};

export function getActivePieceCells(
  activePiece: ActivePieceState,
): readonly (readonly [row: number, column: number])[] {
  const shapeDefinition = TETROMINO_SHAPE_DEFINITIONS[activePiece.type];
  const rotationState = shapeDefinition.rotationStates[activePiece.rotationIndex];

  return rotationState.map(([cellRow, cellColumn]) => [
    activePiece.row + cellRow,
    activePiece.column + cellColumn,
  ]);
}
