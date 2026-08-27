import { useEffect } from 'react';

export type KeyboardInputHandler = (event: KeyboardEvent) => boolean;

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
