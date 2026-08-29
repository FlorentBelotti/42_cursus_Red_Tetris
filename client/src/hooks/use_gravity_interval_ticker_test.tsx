import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useGravityIntervalTicker } from './use_gravity_interval_ticker';

describe('useGravityIntervalTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ticks repeatedly while active', () => {
    const onTick = vi.fn();
    renderHook(() => useGravityIntervalTicker(true, onTick));

    vi.advanceTimersByTime(2500);

    expect(onTick.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('never ticks while inactive', () => {
    const onTick = vi.fn();
    renderHook(() => useGravityIntervalTicker(false, onTick));

    vi.advanceTimersByTime(5000);

    expect(onTick).not.toHaveBeenCalled();
  });

  it('stops ticking once unmounted', () => {
    const onTick = vi.fn();
    const { unmount } = renderHook(() => useGravityIntervalTicker(true, onTick));

    vi.advanceTimersByTime(900);
    unmount();
    const callCountAtUnmount = onTick.mock.calls.length;
    vi.advanceTimersByTime(5000);

    expect(onTick.mock.calls.length).toBe(callCountAtUnmount);
  });
});
