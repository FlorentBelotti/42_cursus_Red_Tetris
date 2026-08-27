import type { TypedSocket, TypedSocketIoServer } from './typed_socket_aliases';

export interface RecordedMessage {
  eventName: string;
  payload: unknown;
}

export interface RecordedRoomMessage extends RecordedMessage {
  roomName: string;
}

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

export function findLastMessage<MessageType extends RecordedMessage>(
  messages: MessageType[],
): MessageType | undefined {
  return messages[messages.length - 1];
}

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
