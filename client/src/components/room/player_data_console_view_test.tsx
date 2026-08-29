import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { PlayerDataConsoleView } from './player_data_console_view';

describe('PlayerDataConsoleView', () => {
  it('shows the local player as YOU with their line counts', () => {
    const { container } = render(
      <PlayerDataConsoleView
        players={[{ playerId: 'p1', playerName: 'ALPHA', isHost: true, isAlive: true }]}
        localPlayerId="p1"
        linesClearedCount={3}
        penaltyLinesSentCount={2}
        opponentSpectrums={{}}
      />,
    );

    expect(container.textContent).toContain('YOU ALPHA');
    expect(container.textContent).toContain('LINES 3');
    expect(container.textContent).toContain('SENT 2');
  });

  it('shows an opponent with their status and spectrum', () => {
    const { container } = render(
      <PlayerDataConsoleView
        players={[{ playerId: 'p2', playerName: 'BETA', isHost: false, isAlive: false }]}
        localPlayerId="p1"
        linesClearedCount={0}
        penaltyLinesSentCount={0}
        opponentSpectrums={{ p2: [1, 2, 3] }}
      />,
    );

    expect(container.textContent).toContain('BETA');
    expect(container.textContent).toContain('DEAD');
    expect(container.textContent).toContain('H:1 2 3');
  });
});
