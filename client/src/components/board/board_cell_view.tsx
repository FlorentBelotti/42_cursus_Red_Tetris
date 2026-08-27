import { memo } from 'react';
import type { BoardCellState } from '../../mock_data/board_cell_state';
import styles from './board_cell_view.module.css';

export type BoardCellViewProps = {
  readonly state: BoardCellState;
};

/**
 * Resolves the CSS class name for a cell's visual state.
 *
 * @param state - The cell's state.
 * @returns The class name to apply, empty state included.
 */
function resolveCellClassName(state: BoardCellState): string {
  if (state === 'filled') {
    return `${styles.cell} ${styles.filled}`;
  }

  if (state === 'penalty') {
    return `${styles.cell} ${styles.penalty}`;
  }

  if (state === 'active') {
    return `${styles.cell} ${styles.active}`;
  }

  return styles.cell ?? '';
}

/**
 * One square of the board or the next-piece preview: empty, filled
 * (locked), penalty (indestructible), or active (the falling piece).
 * Memoized — up to 200 instances re-render on every tick once gravity exists.
 *
 * @param props - The cell's state.
 */
export const BoardCellView = memo(function BoardCellView(props: BoardCellViewProps): JSX.Element {
  return <div className={resolveCellClassName(props.state)} />;
});
