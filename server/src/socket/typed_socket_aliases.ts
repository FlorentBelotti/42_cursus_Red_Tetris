import type { Server as SocketIoServer, Socket } from 'socket.io';

import type { ClientToServerEvents, ServerToClientEvents } from 'shared';

/** The socket.io server, typed against the protocol. */
export type TypedSocketIoServer = SocketIoServer<ClientToServerEvents, ServerToClientEvents>;

/** One connected client socket, typed against the protocol. */
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
