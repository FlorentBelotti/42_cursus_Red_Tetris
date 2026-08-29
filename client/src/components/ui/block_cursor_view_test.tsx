import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { BlockCursorView } from './block_cursor_view';

describe('BlockCursorView', () => {
  it('renders a solid block character', () => {
    const { container } = render(<BlockCursorView />);
    expect(container.textContent).toBe('█');
  });
});
