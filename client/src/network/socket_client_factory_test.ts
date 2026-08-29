import { describe, expect, it, vi } from 'vitest';
import { io } from 'socket.io-client';

import { createSocketClient } from './socket_client_factory';

const FAKE_SOCKET = { id: 'fake-socket-id' };

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => FAKE_SOCKET),
}));

describe('createSocketClient connects to the page origin', () => {
  it('calls socket.io-client\'s io() with no explicit server address', () => {
    createSocketClient();

    expect(io).toHaveBeenCalledWith();
  });
});

describe('createSocketClient returns the created socket', () => {
  it('returns exactly what socket.io-client hands back, unchanged', () => {
    const createdSocket = createSocketClient();

    expect(createdSocket).toBe(FAKE_SOCKET);
  });
});
