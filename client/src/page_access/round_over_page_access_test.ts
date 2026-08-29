import { describe, expect, it } from 'vitest';

import {
  isRoundOverBackToLobbyKey,
  isRoundOverRestartKey,
  resolveRoundOverKeyLegend,
  resolveRoundOverOverlayContent,
} from './round_over_page_access';

function makeKeyEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key });
}

describe('round_over_page_access', () => {
  it('titles the overlay WINNER for the local player who won', () => {
    const content = resolveRoundOverOverlayContent(false, 'ALPHA', 'ALPHA');
    expect(content.title).toBe('WINNER');
    expect(content.subtitle).toBe('LAST FIELD STANDING : ALPHA');
  });

  it('titles the overlay GAME OVER for a solo round with no winner', () => {
    const content = resolveRoundOverOverlayContent(true, 'ALPHA', null);
    expect(content.title).toBe('GAME OVER');
    expect(content.subtitle).toBe('NO WINNER');
  });

  it('only lets the host restart with Enter', () => {
    expect(isRoundOverRestartKey(makeKeyEvent('Enter'), true)).toBe(true);
    expect(isRoundOverRestartKey(makeKeyEvent('Enter'), false)).toBe(false);
  });

  it('goes back to the lobby on Escape', () => {
    expect(isRoundOverBackToLobbyKey(makeKeyEvent('Escape'))).toBe(true);
  });

  it('gives the host a longer legend than a guest', () => {
    expect(resolveRoundOverKeyLegend(true).length).toBeGreaterThan(resolveRoundOverKeyLegend(false).length);
  });
});
