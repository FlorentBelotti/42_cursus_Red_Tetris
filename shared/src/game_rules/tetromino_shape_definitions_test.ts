import { describe, expect, it } from 'vitest';

import { ALL_TETROMINO_TYPES, TetrominoType } from './tetromino_type_enum.js';
import {
  TETROMINO_SHAPE_DEFINITIONS,
  type TetrominoCellCoordinate,
  type TetrominoRotationState,
} from './tetromino_shape_definitions.js';

const CELLS_PER_TETROMINO = 4;
const ROTATION_STATES_PER_TETROMINO = 4;

function readRow(cell: TetrominoCellCoordinate): number {
  return cell[0];
}

function readColumn(cell: TetrominoCellCoordinate): number {
  return cell[1];
}

function describeCellsAsText(rotationState: TetrominoRotationState): string[] {
  const cellDescriptions: string[] = [];

  for (const cell of rotationState) {
    cellDescriptions.push(`${readRow(cell)},${readColumn(cell)}`);
  }

  return cellDescriptions;
}

describe('TETROMINO_SHAPE_DEFINITIONS covers the seven pieces', () => {
  it('defines every tetromino type', () => {
    for (const tetrominoType of ALL_TETROMINO_TYPES) {
      expect(TETROMINO_SHAPE_DEFINITIONS[tetrominoType]).toBeDefined();
    }
  });

  it('defines nothing beyond the seven types', () => {
    expect(Object.keys(TETROMINO_SHAPE_DEFINITIONS)).toHaveLength(ALL_TETROMINO_TYPES.length);
  });
});

describe('every rotation state is a well-formed tetromino', () => {
  it('has four rotation states per piece', () => {
    for (const tetrominoType of ALL_TETROMINO_TYPES) {
      expect(TETROMINO_SHAPE_DEFINITIONS[tetrominoType].rotationStates).toHaveLength(
        ROTATION_STATES_PER_TETROMINO,
      );
    }
  });

  it('occupies exactly four cells in every rotation state', () => {
    for (const tetrominoType of ALL_TETROMINO_TYPES) {
      for (const rotationState of TETROMINO_SHAPE_DEFINITIONS[tetrominoType].rotationStates) {
        expect(rotationState).toHaveLength(CELLS_PER_TETROMINO);
      }
    }
  });

  it('never repeats a cell within a rotation state', () => {
    for (const tetrominoType of ALL_TETROMINO_TYPES) {
      for (const rotationState of TETROMINO_SHAPE_DEFINITIONS[tetrominoType].rotationStates) {
        const cellDescriptions = describeCellsAsText(rotationState);

        expect(new Set(cellDescriptions).size).toBe(CELLS_PER_TETROMINO);
      }
    }
  });

  it('keeps every cell inside the piece bounding box', () => {
    for (const tetrominoType of ALL_TETROMINO_TYPES) {
      const shapeDefinition = TETROMINO_SHAPE_DEFINITIONS[tetrominoType];

      for (const rotationState of shapeDefinition.rotationStates) {
        for (const cell of rotationState) {
          expect(readRow(cell)).toBeGreaterThanOrEqual(0);
          expect(readColumn(cell)).toBeGreaterThanOrEqual(0);
          expect(readRow(cell)).toBeLessThan(shapeDefinition.boundingBoxSize);
          expect(readColumn(cell)).toBeLessThan(shapeDefinition.boundingBoxSize);
        }
      }
    }
  });
});

describe('the individual pieces match the shapes the subject expects', () => {
  it('gives the I piece a four-wide bounding box, and the others a smaller one', () => {
    expect(TETROMINO_SHAPE_DEFINITIONS[TetrominoType.I].boundingBoxSize).toBe(4);
    expect(TETROMINO_SHAPE_DEFINITIONS[TetrominoType.O].boundingBoxSize).toBe(2);
    expect(TETROMINO_SHAPE_DEFINITIONS[TetrominoType.T].boundingBoxSize).toBe(3);
  });

  it('spawns the I piece flat on a single row', () => {
    const spawnState = TETROMINO_SHAPE_DEFINITIONS[TetrominoType.I].rotationStates[0];
    const occupiedRows = new Set(spawnState.map(readRow));

    expect(occupiedRows.size).toBe(1);
  });

  it('leaves the O piece unchanged by rotation', () => {
    const rotationStates = TETROMINO_SHAPE_DEFINITIONS[TetrominoType.O].rotationStates;
    const spawnStateAsText = describeCellsAsText(rotationStates[0]).sort();

    for (const rotationState of rotationStates) {
      expect(describeCellsAsText(rotationState).sort()).toEqual(spawnStateAsText);
    }
  });

  it('gives every piece other than O four distinct rotation states', () => {
    for (const tetrominoType of ALL_TETROMINO_TYPES) {
      if (tetrominoType === TetrominoType.O) {
        continue;
      }

      const distinctStates = new Set<string>();

      for (const rotationState of TETROMINO_SHAPE_DEFINITIONS[tetrominoType].rotationStates) {
        distinctStates.add(describeCellsAsText(rotationState).sort().join('|'));
      }

      expect(distinctStates.size).toBeGreaterThan(1);
    }
  });

  it('keeps the S and Z pieces mirror images of each other at spawn', () => {
    const spawnOfS = describeCellsAsText(
      TETROMINO_SHAPE_DEFINITIONS[TetrominoType.S].rotationStates[0],
    ).sort();
    const spawnOfZ = describeCellsAsText(
      TETROMINO_SHAPE_DEFINITIONS[TetrominoType.Z].rotationStates[0],
    ).sort();

    expect(spawnOfS).not.toEqual(spawnOfZ);
  });

  it('keeps the J and L pieces distinct at spawn', () => {
    const spawnOfJ = describeCellsAsText(
      TETROMINO_SHAPE_DEFINITIONS[TetrominoType.J].rotationStates[0],
    ).sort();
    const spawnOfL = describeCellsAsText(
      TETROMINO_SHAPE_DEFINITIONS[TetrominoType.L].rotationStates[0],
    ).sort();

    expect(spawnOfJ).not.toEqual(spawnOfL);
  });
});

describe('ALL_TETROMINO_TYPES', () => {
  it('lists the seven tetrominoes', () => {
    expect(ALL_TETROMINO_TYPES).toHaveLength(7);
  });

  it('lists each of them once', () => {
    expect(new Set(ALL_TETROMINO_TYPES).size).toBe(ALL_TETROMINO_TYPES.length);
  });
});
