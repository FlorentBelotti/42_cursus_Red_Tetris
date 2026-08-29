import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { PanelView } from './panel_view';

describe('PanelView', () => {
  it('renders its children', () => {
    const { container } = render(<PanelView>content</PanelView>);
    expect(container.textContent).toContain('content');
  });

  it('renders a title when given one', () => {
    const { container } = render(<PanelView title="NEXT">content</PanelView>);
    expect(container.textContent).toContain('NEXT');
  });

  it('renders no title by default', () => {
    const { container } = render(<PanelView>content</PanelView>);
    expect(container.textContent).toBe('content');
  });
});
