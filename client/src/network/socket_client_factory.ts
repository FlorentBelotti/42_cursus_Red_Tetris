import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import type { ClientToServerEvents, ServerToClientEvents } from 'shared';

export type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocketClient(): TypedClientSocket {
  return io();
}
