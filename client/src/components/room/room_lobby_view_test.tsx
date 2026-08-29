import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { RoomLobbyView } from './room_lobby_view';

describe('RoomLobbyView', () => {
  it('renders the players and the start prompt', () => {
    const { container } = render(
      <RoomLobbyView
        players={[{ playerId: 'p1', playerName: 'ALPHA', isHost: true, isAlive: true }]}
        startPromptText="> PRESS [ENTER] TO START GAME"
        startPromptState="active"
      />,
    );

    expect(container.textContent).toContain('WAITING ROOM');
    expect(container.textContent).toContain('ALPHA');
    expect(container.textContent).toContain('> PRESS [ENTER] TO START GAME');
  });
});
