import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { TerminalLogView } from './terminal_log_view';

describe('TerminalLogView', () => {
  it('renders an echoed command line', () => {
    const { container } = render(<TerminalLogView entries={[{ kind: 'echo', commandLine: 'HELP' }]} />);
    expect(container.textContent).toContain('HELP');
  });

  it('marks error output distinctly from normal output', () => {
    const { container } = render(
      <TerminalLogView entries={[{ kind: 'output', text: 'UNKNOWN COMMAND', isError: true }]} />,
    );
    expect(container.textContent).toContain('UNKNOWN COMMAND');
  });

  it('renders a command reference table', () => {
    const { container } = render(
      <TerminalLogView
        entries={[
          {
            kind: 'table',
            rows: [{ command: 'HELP', usage: 'HELP', description: 'SHOW THIS LIST' }],
          },
        ]}
      />,
    );
    expect(container.textContent).toContain('SHOW THIS LIST');
  });
});
