import { describe, expect, it } from 'vitest';

import {
  isRoomLobbyLeaveKey,
  isRoomLobbyStartGameKey,
  resolveRoomLobbyKeyLegend,
  resolveRoomLobbyPrompt,
} from './room_lobby_page_access';

function makeKeyEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key });
}

describe('room_lobby_page_access', () => {
  it('gives the host an active start prompt', () => {
    expect(resolveRoomLobbyPrompt(true)).toEqual({ text: '> PRESS [ENTER] TO START GAME', state: 'active' });
  });

  it('gives a guest a muted waiting prompt', () => {
    expect(resolveRoomLobbyPrompt(false)).toEqual({ text: '> WAITING FOR HOST', state: 'muted' });
  });

  it('only lets the host start with Enter', () => {
    expect(isRoomLobbyStartGameKey(makeKeyEvent('Enter'), true)).toBe(true);
    expect(isRoomLobbyStartGameKey(makeKeyEvent('Enter'), false)).toBe(false);
  });

  it('leaves on Escape', () => {
    expect(isRoomLobbyLeaveKey(makeKeyEvent('Escape'))).toBe(true);
    expect(isRoomLobbyLeaveKey(makeKeyEvent('Enter'))).toBe(false);
  });

  it('gives the host a longer legend than a guest', () => {
    expect(resolveRoomLobbyKeyLegend(true).length).toBeGreaterThan(resolveRoomLobbyKeyLegend(false).length);
  });
});
