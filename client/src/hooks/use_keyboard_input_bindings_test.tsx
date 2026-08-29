import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useKeyboardInputBindings } from './use_keyboard_input_bindings';

describe('useKeyboardInputBindings', () => {
  it('calls the handler on keydown and prevents default when handled', () => {
    const handler = vi.fn().mockReturnValue(true);
    renderHook(() => useKeyboardInputBindings(handler));

    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    window.dispatchEvent(event);

    expect(handler).toHaveBeenCalledWith(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not prevent default when the handler declines the key', () => {
    const handler = vi.fn().mockReturnValue(false);
    renderHook(() => useKeyboardInputBindings(handler));

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('removes its listener on unmount', () => {
    const handler = vi.fn().mockReturnValue(true);
    const { unmount } = renderHook(() => useKeyboardInputBindings(handler));

    unmount();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(handler).not.toHaveBeenCalled();
  });
});
