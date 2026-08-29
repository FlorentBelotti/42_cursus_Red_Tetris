import { describe, expect, it } from 'vitest';

import { IN_GAME_PAGE_KEY_LEGEND, isInGameLeaveKey } from './in_game_page_access';

function makeKeyEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key });
}

describe('in_game_page_access', () => {
  it('leaves on Escape only', () => {
    expect(isInGameLeaveKey(makeKeyEvent('Escape'))).toBe(true);
    expect(isInGameLeaveKey(makeKeyEvent('ArrowLeft'))).toBe(false);
  });

  it('exposes a non-empty key legend', () => {
    expect(IN_GAME_PAGE_KEY_LEGEND.length).toBeGreaterThan(0);
  });
});
