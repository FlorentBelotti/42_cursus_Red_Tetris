import { describe, expect, it } from 'vitest';

import { JOIN_REJECTED_PAGE_KEY_LEGEND, isJoinRejectedRetryKey } from './join_rejected_page_access';

function makeKeyEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key });
}

describe('join_rejected_page_access', () => {
  it('retries on Enter only', () => {
    expect(isJoinRejectedRetryKey(makeKeyEvent('Enter'))).toBe(true);
    expect(isJoinRejectedRetryKey(makeKeyEvent('Escape'))).toBe(false);
  });

  it('exposes a non-empty key legend', () => {
    expect(JOIN_REJECTED_PAGE_KEY_LEGEND.length).toBeGreaterThan(0);
  });
});
