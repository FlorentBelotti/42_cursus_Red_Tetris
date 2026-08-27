import { BOARD_ROW_COUNT } from 'shared';
import styles from './opponent_spectrum_column_view.module.css';

const SPECTRUM_MAXIMUM_HEIGHT = BOARD_ROW_COUNT - 1;
const SPECTRUM_HIGH_COLOUR_THRESHOLD = 14;
const SPECTRUM_MID_COLOUR_THRESHOLD = 8;

export type OpponentSpectrumColumnViewProps = {
  readonly columnHeight: number;
};

function resolveColumnClassName(columnHeight: number): string {
  if (columnHeight > SPECTRUM_HIGH_COLOUR_THRESHOLD) {
    return `${styles.column} ${styles.columnHigh}`;
  }

  if (columnHeight > SPECTRUM_MID_COLOUR_THRESHOLD) {
    return `${styles.column} ${styles.columnMid}`;
  }

  return styles.column ?? '';
}

export function OpponentSpectrumColumnView(props: OpponentSpectrumColumnViewProps): JSX.Element {
  const heightPercentage = (props.columnHeight / SPECTRUM_MAXIMUM_HEIGHT) * 100;

  return (
    <div className={resolveColumnClassName(props.columnHeight)} style={{ height: `${heightPercentage}%` }} />
  );
}
