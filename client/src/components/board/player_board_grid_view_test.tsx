import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { PlayerBoardGridView } from './player_board_grid_view';
import styles from './board_cell_view.module.css';

describe('PlayerBoardGridView', () => {
  it('renders one cell element per entry in cells', () => {
    const { container } = render(
      <PlayerBoardGridView cells={['empty', 'filled', 'active', 'penalty']} />,
    );

    const cellElements = container.getElementsByClassName(styles.cell ?? '');
    expect(cellElements.length).toBe(4);
  });
});
