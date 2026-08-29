import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { TerminalIntroView } from './terminal_intro_view';

describe('TerminalIntroView', () => {
  it('renders the intro copy', () => {
    const { container } = render(<TerminalIntroView />);
    expect(container.textContent).toContain('RED TETRIS');
    expect(container.textContent).toContain('HELP');
  });
});
