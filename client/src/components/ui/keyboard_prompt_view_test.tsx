import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { KeyboardPromptView } from './keyboard_prompt_view';

describe('KeyboardPromptView', () => {
  it('renders the given text', () => {
    const { container } = render(<KeyboardPromptView text="> PRESS [ENTER]" />);
    expect(container.textContent).toContain('> PRESS [ENTER]');
  });

  it('renders a cursor when asked to', () => {
    const { container } = render(<KeyboardPromptView text="hi" cursor />);
    expect(container.textContent).toContain('█');
  });

  it('renders no cursor by default', () => {
    const { container } = render(<KeyboardPromptView text="hi" />);
    expect(container.textContent).not.toContain('█');
  });
});
