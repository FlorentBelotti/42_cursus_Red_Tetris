import type { BoardCellState } from '../../mock_data/board_cell_state';
import { BoardCellView } from './board_cell_view';
import styles from './player_board_grid_view.module.css';

export type PlayerBoardGridViewProps = {
  readonly cells: readonly BoardCellState[];
};

/**
 * The player's own 10x20 board. `align-self:start` is mandatory so the grid
 * never stretches inside its column, which would break the cells' 1:1
 * aspect ratio.
 *
 * @param props - The flat, row-major array of cell states.
 */
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
