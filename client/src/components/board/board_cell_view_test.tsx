import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { BoardCellView } from './board_cell_view';
import styles from './board_cell_view.module.css';

describe('BoardCellView', () => {
  it('applies the filled class for a filled cell', () => {
    const { container } = render(<BoardCellView state="filled" />);
    expect(container.firstElementChild?.className).toContain(styles.filled);
  });

  it('applies the penalty class for a penalty cell', () => {
    const { container } = render(<BoardCellView state="penalty" />);
    expect(container.firstElementChild?.className).toContain(styles.penalty);
  });

  it('applies the active class for the falling piece', () => {
    const { container } = render(<BoardCellView state="active" />);
    expect(container.firstElementChild?.className).toContain(styles.active);
  });

  it('applies only the base class for an empty cell', () => {
    const { container } = render(<BoardCellView state="empty" />);
    expect(container.firstElementChild?.className).toBe(styles.cell);
  });
});
