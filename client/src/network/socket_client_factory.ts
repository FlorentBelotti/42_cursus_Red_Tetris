import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import type { ClientToServerEvents, ServerToClientEvents } from 'shared';

/**
 * This browser's connection to the Red Tetris server, typed against the
 * shared protocol: it may only listen for events the server actually emits
 * (`ServerToClientEvents`) and may only emit events the server actually
 * listens for (`ClientToServerEvents`). No file outside `client/src/network/`
 * should construct or hold a value of this type directly — the network layer
 * is the single place allowed to touch the socket.
 */
export type TypedClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Opens a new connection to the Red Tetris server and returns the typed
 * socket for it.
 *
 * `io()` is called with no server address on purpose: the socket always
 * connects to the page's own origin.
 *
 * @returns A freshly created socket. Connecting starts immediately; nothing
 *   further needs to be called to begin the handshake.
 */
export function createSocketClient(): TypedClientSocket {
  return io();
}
