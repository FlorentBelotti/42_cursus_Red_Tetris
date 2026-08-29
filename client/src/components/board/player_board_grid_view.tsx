import type { BoardCellState } from '../../game_engine/board_cell_state';
import { BoardCellView } from './board_cell_view';
import styles from './player_board_grid_view.module.css';

export type PlayerBoardGridViewProps = {
  readonly cells: readonly BoardCellState[];
};

export function PlayerBoardGridView(props: PlayerBoardGridViewProps): JSX.Element {
  return (
    <div className={styles.frame}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {props.cells.map((cellState, cellIndex) => (
            <BoardCellView key={cellIndex} state={cellState} />
          ))}
        </div>
      </div>
    </div>
  );
}
