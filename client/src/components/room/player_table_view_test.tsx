import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { PlayerTableView } from './player_table_view';

describe('PlayerTableView', () => {
  it('renders each player with their role', () => {
    const { container } = render(
      <PlayerTableView
        players={[
          { playerId: 'p1', playerName: 'ALPHA', isHost: true, isAlive: true },
          { playerId: 'p2', playerName: 'BETA', isHost: false, isAlive: true },
        ]}
      />,
    );

    expect(container.textContent).toContain('ALPHA');
    expect(container.textContent).toContain('HOST');
    expect(container.textContent).toContain('BETA');
    expect(container.textContent).toContain('PLAYER');
  });
});
