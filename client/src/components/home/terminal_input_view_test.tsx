import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { TerminalInputView } from './terminal_input_view';

describe('TerminalInputView', () => {
  it('renders the shell prompt and the typed text', () => {
    const { container } = render(<TerminalInputView typedText="JOIN REDROOM" />);
    expect(container.textContent).toContain('JOIN REDROOM');
    expect(container.textContent).toContain('█');
  });
});
