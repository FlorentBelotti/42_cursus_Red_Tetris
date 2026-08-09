import { describe, expect, it } from 'vitest';

import { BOARD_COLUMN_COUNT, BOARD_ROW_COUNT } from '../game_rules/board_dimension_constants';
import {
  createEmptySpectrumColumnHeights,
  isValidSpectrumColumnHeights,
} from './spectrum_column_heights';

describe('createEmptySpectrumColumnHeights', () => {
  it('produces one entry per board column', () => {
    expect(createEmptySpectrumColumnHeights()).toHaveLength(BOARD_COLUMN_COUNT);
  });

  it('starts every column at height zero', () => {
    const emptySpectrum = createEmptySpectrumColumnHeights();

    expect(emptySpectrum.every((columnHeight) => columnHeight === 0)).toBe(true);
  });

  it('produces an empty spectrum that is itself valid', () => {
    expect(isValidSpectrumColumnHeights(createEmptySpectrumColumnHeights())).toBe(true);
  });

  it('returns a fresh array on every call, so stored spectrums stay independent', () => {
    const firstSpectrum = createEmptySpectrumColumnHeights();
    const secondSpectrum = createEmptySpectrumColumnHeights();

    expect(firstSpectrum).not.toBe(secondSpectrum);
  });
});

describe('isValidSpectrumColumnHeights', () => {
  it('accepts a full-height column', () => {
    const fullColumnSpectrum = new Array<number>(BOARD_COLUMN_COUNT).fill(BOARD_ROW_COUNT);

    expect(isValidSpectrumColumnHeights(fullColumnSpectrum)).toBe(true);
  });

  it('rejects a spectrum with too few columns', () => {
    const tooShortSpectrum = new Array<number>(BOARD_COLUMN_COUNT - 1).fill(0);

    expect(isValidSpectrumColumnHeights(tooShortSpectrum)).toBe(false);
  });

  it('rejects a spectrum with too many columns', () => {
    const tooLongSpectrum = new Array<number>(BOARD_COLUMN_COUNT + 1).fill(0);

    expect(isValidSpectrumColumnHeights(tooLongSpectrum)).toBe(false);
  });

  it('rejects a column taller than the board', () => {
    const overflowingSpectrum = new Array<number>(BOARD_COLUMN_COUNT).fill(0);
    overflowingSpectrum[0] = BOARD_ROW_COUNT + 1;

    expect(isValidSpectrumColumnHeights(overflowingSpectrum)).toBe(false);
  });

  it('rejects a negative column height', () => {
    const negativeSpectrum = new Array<number>(BOARD_COLUMN_COUNT).fill(0);
    negativeSpectrum[0] = -1;

    expect(isValidSpectrumColumnHeights(negativeSpectrum)).toBe(false);
  });

  it('rejects a fractional column height', () => {
    const fractionalSpectrum = new Array<number>(BOARD_COLUMN_COUNT).fill(0);
    fractionalSpectrum[0] = 1.5;

    expect(isValidSpectrumColumnHeights(fractionalSpectrum)).toBe(false);
  });

  it('rejects a non-numeric column height', () => {
    const textSpectrum: unknown[] = new Array<number>(BOARD_COLUMN_COUNT).fill(0);
    textSpectrum[0] = '3';

    expect(isValidSpectrumColumnHeights(textSpectrum)).toBe(false);
  });

  it('rejects values that are not arrays at all', () => {
    expect(isValidSpectrumColumnHeights(undefined)).toBe(false);
    expect(isValidSpectrumColumnHeights(null)).toBe(false);
    expect(isValidSpectrumColumnHeights({ length: BOARD_COLUMN_COUNT })).toBe(false);
  });
});
