import { useEffect } from 'react';

/**
 * A key handler for the current screen. Returns true when it acted on the
 * event, which tells the hook to call preventDefault (COMPONENTS.md: "un
 * seul listener keydown... preventDefault sur flèches, espace, tab et
 * backspace").
 */
export type KeyboardInputHandler = (event: KeyboardEvent) => boolean;

/**
 * Attaches a single `keydown` listener on `window` for the lifetime of the
 * calling component, dispatching every key press to `handler`. No component
 * in this application registers its own `onClick` navigation — this hook is
 * the only input path.
 *
 * @param handler - Called on every keydown; return true if the event was
 * acted on, so its default browser behaviour is prevented.
 */
export function useKeyboardInputBindings(handler: KeyboardInputHandler): void {
  useEffect(() => {
    function handleWindowKeyDown(event: KeyboardEvent): void {
      const wasHandled = handler(event);

      if (wasHandled) {
        event.preventDefault();
      }
    }

    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [handler]);
}
