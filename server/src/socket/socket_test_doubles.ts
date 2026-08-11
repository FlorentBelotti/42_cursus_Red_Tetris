import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

export interface RecordedMessage {
  eventName: string;
  payload: unknown;
}

export interface RecordedRoomMessage extends RecordedMessage {
  roomName: string;
}

/**
 * Builds a stand-in for one connected socket.
 *
 * @param socketId - The id the fake socket reports, as socket.io would.
 * @returns The fake socket, plus the records a test asserts on.
 */
export function createFakeSocket(socketId: string) {
  const emittedToThisSocket: RecordedMessage[] = [];
  const broadcastToOthers: RecordedRoomMessage[] = [];
  const joinedRooms: string[] = [];
  const leftRooms: string[] = [];
  const registeredHandlers = new Map<string, (payload?: unknown) => void>();

  const fakeSocket = {
    id: socketId,
    on(eventName: string, handler: (payload?: unknown) => void) {
      registeredHandlers.set(eventName, handler);
    },
    emit(eventName: string, payload: unknown) {
      emittedToThisSocket.push({ eventName, payload });
    },
    join(roomName: string) {
      joinedRooms.push(roomName);
    },
    leave(roomName: string) {
      leftRooms.push(roomName);
    },
    to(roomName: string) {
      return {
        emit(eventName: string, payload: unknown) {
          broadcastToOthers.push({ roomName, eventName, payload });
        },
      };
    },
  };

  /**
   * Fires an event at the server as a client would.
   *
   * @param eventName - The event the client is sending.
   * @param payload - What it carries, if anything.
   * @throws Error when no handler was registered for that event, which means
   *         the module under test never wired it up.
   */
  function receiveFromClient(eventName: string, payload?: unknown): void {
    const handler = registeredHandlers.get(eventName);

    if (handler === undefined) {
      throw new Error(`The server never registered a handler for ${eventName}`);
    }

    handler(payload);
  }

  return {
    emittedToThisSocket,
    broadcastToOthers,
    joinedRooms,
    leftRooms,
    receiveFromClient,
    asTypedSocket: fakeSocket as unknown as TypedSocket,
  };
}

/**
 * Builds a stand-in for the socket.io server that records room broadcasts.
 *
 * @returns The fake server, plus the broadcasts a test asserts on.
 */
export function createFakeServer() {
  const roomBroadcasts: RecordedRoomMessage[] = [];

  const fakeServer = {
    to(roomName: string) {
      return {
        emit(eventName: string, payload: unknown) {
          roomBroadcasts.push({ roomName, eventName, payload });
        },
      };
    },
  };

  return { roomBroadcasts, asTypedServer: fakeServer as unknown as TypedSocketIoServer };
}

/**
 * The last message of a recording, which is usually the one a test cares about.
 *
 * @param messages - Everything recorded so far.
 * @returns The most recent message, or undefined when nothing was recorded.
 */
export function findLastMessage<MessageType extends RecordedMessage>(
  messages: MessageType[],
): MessageType | undefined {
  return messages[messages.length - 1];
}

/**
 * Every recorded message sent under one event name.
 *
 * @param messages - Everything recorded so far.
 * @param eventName - The event to filter on.
 * @returns The messages sent under that event, in order.
 */
export function findMessagesNamed<MessageType extends RecordedMessage>(
  messages: MessageType[],
  eventName: string,
): MessageType[] {
  const matchingMessages: MessageType[] = [];

  for (const message of messages) {
    if (message.eventName === eventName) {
      matchingMessages.push(message);
    }
  }

  return matchingMessages;
}
