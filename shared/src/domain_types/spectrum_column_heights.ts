import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from '../game_rules/board_dimension_constants.js';

export type SpectrumColumnHeights = readonly number[];

export function createEmptySpectrumColumnHeights(): SpectrumColumnHeights {
  return new Array<number>(BOARD_COLUMN_COUNT).fill(0);
}

export function isValidSpectrumColumnHeights(candidateSpectrum: unknown): boolean {
  if (Array.isArray(candidateSpectrum) === false) {
    return false;
  }

  if (candidateSpectrum.length !== BOARD_COLUMN_COUNT) {
    return false;
  }

  return candidateSpectrum.every(isValidSingleColumnHeight);
}

function isValidSingleColumnHeight(candidateColumnHeight: unknown): boolean {
  if (typeof candidateColumnHeight !== 'number') {
    return false;
  }

  if (Number.isInteger(candidateColumnHeight) === false) {
    return false;
  }

  if (candidateColumnHeight < 0) {
    return false;
  }

  return candidateColumnHeight <= BOARD_ROW_COUNT;
}
