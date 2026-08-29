import { useEffect } from 'react';

const GRAVITY_TICK_INTERVAL_MS = 800;

export function useGravityIntervalTicker(isActive: boolean, onTick: () => void): void {
  useEffect(() => {
    if (isActive === false) {
      return;
    }

    const intervalId = setInterval(onTick, GRAVITY_TICK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, onTick]);
}
