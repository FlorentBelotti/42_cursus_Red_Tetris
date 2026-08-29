import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { ApplicationShell } from './application_shell';

describe('ApplicationShell', () => {
  it('renders the room, player name, socket status, children and legend', () => {
    const { container } = render(
      <ApplicationShell room="REDROOM" playerName="PELICAN" socketStatus="CONNECTED" legend={[{ key: '[ESC]', label: 'LEAVE' }]}>
        <div>BODY CONTENT</div>
      </ApplicationShell>,
    );

    expect(container.textContent).toContain('REDROOM');
    expect(container.textContent).toContain('PELICAN');
    expect(container.textContent).toContain('SOCKET CONNECTED');
    expect(container.textContent).toContain('BODY CONTENT');
    expect(container.textContent).toContain('LEAVE');
  });
});
