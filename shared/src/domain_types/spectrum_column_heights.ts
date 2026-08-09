/**
 * A player's spectrum: the height of the highest occupied cell in each column
 * of their board, one entry per column, left to right.
 *
 * This is the only thing opponents ever learn about a board. The server never
 * holds a board matrix (D1), so it relays spectrums verbatim and this type is
 * the whole of what it knows.
 *
 * A height of 0 means the column is empty; a height of BOARD_ROW_COUNT means
 * it is full to the ceiling.
 */
import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from '../game_rules/board_dimension_constants';

/** One height per board column, left to right. */
export type SpectrumColumnHeights = readonly number[];

/**
 * Builds the spectrum of an empty board: every column at height zero.
 *
 * @returns A spectrum with one zero per board column.
 */
export function createEmptySpectrumColumnHeights(): SpectrumColumnHeights {
  return new Array<number>(BOARD_COLUMN_COUNT).fill(0);
}

/**
 * Tells whether a value received over the network is a usable spectrum: one
 * whole number per column, none of them taller than the board.
 *
 * Spectrums arrive from clients, so they are not trusted. Anything failing
 * this check is rejected at the socket boundary rather than stored.
 *
 * @param candidateSpectrum - The value to validate.
 * @returns True when the value is a well-formed spectrum, false otherwise.
 */
export function isValidSpectrumColumnHeights(candidateSpectrum: unknown): boolean {
  if (Array.isArray(candidateSpectrum) === false) {
    return false;
  }

  if (candidateSpectrum.length !== BOARD_COLUMN_COUNT) {
    return false;
  }

  return candidateSpectrum.every(isValidSingleColumnHeight);
}

/**
 * Tells whether one entry of a spectrum is a usable column height.
 *
 * @param candidateColumnHeight - The entry to validate.
 * @returns True when the entry is a whole number within the board's height.
 */
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
