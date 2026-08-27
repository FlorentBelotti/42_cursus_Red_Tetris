import { BOARD_ROW_COUNT } from 'shared';
import styles from './opponent_spectrum_column_view.module.css';

const SPECTRUM_MAXIMUM_HEIGHT = BOARD_ROW_COUNT - 1;
const SPECTRUM_HIGH_COLOUR_THRESHOLD = 14;
const SPECTRUM_MID_COLOUR_THRESHOLD = 8;

export type OpponentSpectrumColumnViewProps = {
  readonly columnHeight: number;
};

/**
 * Resolves the colour tier class for a spectrum column's height.
 *
 * @param columnHeight - The column's height (0 to BOARD_ROW_COUNT - 1).
 * @returns The CSS class name for that height tier.
 */
function resolveColumnClassName(columnHeight: number): string {
  if (columnHeight > SPECTRUM_HIGH_COLOUR_THRESHOLD) {
    return `${styles.column} ${styles.columnHigh}`;
  }

  if (columnHeight > SPECTRUM_MID_COLOUR_THRESHOLD) {
    return `${styles.column} ${styles.columnMid}`;
  }

  return styles.column ?? '';
}

/**
 * One bar of an opponent's spectrum: the height of a single column's
 * highest block, as a percentage of the board's height.
 *
 * @param props - The column's height (0 to BOARD_ROW_COUNT - 1).
 */
export function OpponentSpectrumColumnView(props: OpponentSpectrumColumnViewProps): JSX.Element {
  const heightPercentage = (props.columnHeight / SPECTRUM_MAXIMUM_HEIGHT) * 100;

  return (
    <div className={resolveColumnClassName(props.columnHeight)} style={{ height: `${heightPercentage}%` }} />
  );
}
