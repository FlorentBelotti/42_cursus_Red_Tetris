import type { BoardCellState } from '../../mock_data/board_cell_state';
import { PanelView } from '../ui/panel_view';
import { BoardCellView } from './board_cell_view';
import styles from './next_piece_preview_view.module.css';

export type NextPiecePreviewViewProps = {
  readonly cells: readonly BoardCellState[];
};

export function NextPiecePreviewView(props: NextPiecePreviewViewProps): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <PanelView title="NEXT">
        <div className={styles.grid}>
          {props.cells.map((cellState, cellIndex) => (
            <BoardCellView key={cellIndex} state={cellState} />
          ))}
        </div>
      </PanelView>
    </div>
  );
}
