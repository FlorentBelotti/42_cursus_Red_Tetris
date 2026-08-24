import type { AddressInfo } from 'node:net';
import type { Server as HttpServer } from 'node:http';

import { io as connectSocketIoClient, type Socket as ClientSocket } from 'socket.io-client';

import { createRedTetrisHttpServer } from '../main_server_entry_point';

/** How long a test waits for an expected event before giving up. */
const LONGEST_WAIT_FOR_AN_EVENT_IN_MILLISECONDS = 2000;

/** Port number that asks the operating system for any free port. */
const ANY_FREE_PORT = 0;

/**
 * A running server plus every client connected to it, so a test can tear the
 * whole thing down in one call.
 */
export interface RunningTestServer {
  port: number;
  httpServer: HttpServer;
  connectedClients: ClientSocket[];
}

/**
 * Starts the real server on a port the operating system picks.
 *
 * Each test gets its own server, and therefore its own room registry, so no
 * test can see rooms left behind by another.
 *
 * @returns The running server, ready to be connected to.
 */
export async function startTestServer(): Promise<RunningTestServer> {
  const httpServer = createRedTetrisHttpServer();

  await new Promise<void>((resolve) => {
    httpServer.listen(ANY_FREE_PORT, resolve);
  });

  return { port: readListeningPort(httpServer), httpServer, connectedClients: [] };
}

/**
 * Reads the port a server ended up listening on.
 *
 * @param httpServer - A server that is already listening.
 * @returns The port number it bound to.
 * @throws Error when the server is not listening on a TCP port.
 */
function readListeningPort(httpServer: HttpServer): number {
  const serverAddress = httpServer.address();

  if (serverAddress === null || typeof serverAddress === 'string') {
    throw new Error('The test server is not listening on a TCP port');
  }

  return (serverAddress as AddressInfo).port;
}

/**
 * Disconnects every client and shuts the server down.
 *
 * @param testServer - The server to tear down.
 */
export async function stopTestServer(testServer: RunningTestServer): Promise<void> {
  for (const connectedClient of testServer.connectedClients) {
    connectedClient.disconnect();
  }

  testServer.connectedClients.length = 0;

  await new Promise<void>((resolve) => {
    testServer.httpServer.close(() => {
      resolve();
    });
  });
}

/**
 * Opens a real client connection to the test server and waits for it to be up.
 *
 * @param testServer - The server to connect to.
 * @returns The connected client.
 */
export async function connectClient(testServer: RunningTestServer): Promise<ClientSocket> {
  const client = connectSocketIoClient(`http://localhost:${testServer.port}`, {
    transports: ['websocket'],
    forceNew: true,
  });

  testServer.connectedClients.push(client);

  await waitForEvent(client, 'connect');

  return client;
}

/**
 * Waits for one event to arrive on a client.
 *
 * The wait is bounded so a handler that never fires fails the test with the
 * name of the event it was waiting for, instead of hanging the whole run.
 *
 * @param client - The client to listen on.
 * @param eventName - The event to wait for.
 * @returns The payload the event carried.
 */
export function waitForEvent<PayloadType = unknown>(
  client: ClientSocket,
  eventName: string,
): Promise<PayloadType> {
  return new Promise<PayloadType>((resolve, reject) => {
    const giveUpTimer = setTimeout(() => {
      client.off(eventName);
      reject(new Error(`Timed out waiting for "${eventName}"`));
    }, LONGEST_WAIT_FOR_AN_EVENT_IN_MILLISECONDS);

    client.once(eventName, (payload: PayloadType) => {
      clearTimeout(giveUpTimer);
      resolve(payload);
    });
  });
}

/**
 * Waits for an event carrying a payload that satisfies a condition, ignoring
 * earlier ones that do not.
 *
 * Needed because a client can legitimately receive several messages under the
 * same event name in quick succession — a joining player is sent the room
 * state for their own arrival before anyone else's — and a test should wait
 * for the one it means rather than assume it comes first.
 *
 * @param client - The client to listen on.
 * @param eventName - The event to wait for.
 * @param isTheExpectedPayload - Tells the awaited payload from the others.
 * @returns The first payload that satisfies the condition.
 */
export function waitForEventMatching<PayloadType = unknown>(
  client: ClientSocket,
  eventName: string,
  isTheExpectedPayload: (payload: PayloadType) => boolean,
): Promise<PayloadType> {
  return new Promise<PayloadType>((resolve, reject) => {
    const noteArrival = (payload: PayloadType) => {
      if (isTheExpectedPayload(payload) === false) {
        return;
      }

      clearTimeout(giveUpTimer);
      client.off(eventName, noteArrival);
      resolve(payload);
    };

    const giveUpTimer = setTimeout(() => {
      client.off(eventName, noteArrival);
      reject(new Error(`Timed out waiting for a matching "${eventName}"`));
    }, LONGEST_WAIT_FOR_AN_EVENT_IN_MILLISECONDS);

    client.on(eventName, noteArrival);
  });
}

/**
 * Asserts that an event does *not* arrive within a short window.
 *
 * Used for the cases where the protocol says the server stays silent, such as
 * a start request from someone who is not the host.
 *
 * @param client - The client that should hear nothing.
 * @param eventName - The event that must not arrive.
 * @param waitInMilliseconds - How long to listen before concluding silence.
 * @returns True when nothing arrived, false when the event did.
 */
export async function staysSilent(
  client: ClientSocket,
  eventName: string,
  waitInMilliseconds = 150,
): Promise<boolean> {
  let eventArrived = false;

  const noteArrival = () => {
    eventArrived = true;
  };

  client.on(eventName, noteArrival);

  await new Promise<void>((resolve) => {
    setTimeout(resolve, waitInMilliseconds);
  });

  client.off(eventName, noteArrival);

  return eventArrived === false;
}

/**
 * Joins a room with a real client and waits for the server's answer.
 *
 * @param testServer - The server to connect to.
 * @param roomName - The room to join.
 * @param playerName - The name to join under.
 * @returns The connected client and the acceptance payload.
 */
export async function connectAndJoin(
  testServer: RunningTestServer,
  roomName: string,
  playerName: string,
) {
  const client = await connectClient(testServer);
  const acceptancePromise = waitForEvent<{ playerId: string; isHost: boolean }>(
    client,
    'room:join_accepted',
  );

  client.emit('room:join_request', { roomName, playerName });

  const acceptance = await acceptancePromise;

  return { client, acceptance };
}
