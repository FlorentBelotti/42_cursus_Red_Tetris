import { memo } from 'react';
import type { BoardCellState } from '../../mock_data/board_cell_state';
import styles from './board_cell_view.module.css';

export type BoardCellViewProps = {
  readonly state: BoardCellState;
};

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

export const BoardCellView = memo(function BoardCellView(props: BoardCellViewProps): JSX.Element {
  return <div className={resolveCellClassName(props.state)} />;
});
