import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';

import { useRoomUrlParameters } from './use_room_url_parameters';

function withRoute(initialPath: string) {
  return function Wrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/:room/:playerName" element={children} />
        </Routes>
      </MemoryRouter>
    );
  };
}

describe('useRoomUrlParameters', () => {
  it('reads the room and player name from the route', () => {
    const { result } = renderHook(() => useRoomUrlParameters(), {
      wrapper: withRoute('/redroom/pelican'),
    });

    expect(result.current).toEqual({ room: 'redroom', playerName: 'pelican' });
  });

  it('throws outside of the room route', () => {
    expect(() => renderHook(() => useRoomUrlParameters())).toThrow();
  });
});
