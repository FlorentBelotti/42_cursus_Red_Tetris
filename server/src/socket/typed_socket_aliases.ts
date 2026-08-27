import type { Server as SocketIoServer, Socket } from 'socket.io';

import type { ClientToServerEvents, ServerToClientEvents } from 'shared';

export type TypedSocketIoServer = SocketIoServer<ClientToServerEvents, ServerToClientEvents>;

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
