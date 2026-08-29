import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { KeyLegendView } from './key_legend_view';

describe('KeyLegendView', () => {
  it('renders every legend entry', () => {
    const { container } = render(
      <KeyLegendView legend={[{ key: '[ESC]', label: 'LEAVE ROOM' }, { key: '[ENTER]', label: 'START' }]} />,
    );

    expect(container.textContent).toContain('[ESC]');
    expect(container.textContent).toContain('LEAVE ROOM');
    expect(container.textContent).toContain('[ENTER]');
    expect(container.textContent).toContain('START');
  });

  it('renders nothing for an empty legend', () => {
    const { container } = render(<KeyLegendView legend={[]} />);
    expect(container.textContent).toBe('');
  });
});
