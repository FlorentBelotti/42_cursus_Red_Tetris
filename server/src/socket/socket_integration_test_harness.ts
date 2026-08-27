import type { AddressInfo } from 'node:net';
import type { Server as HttpServer } from 'node:http';

import { io as connectSocketIoClient, type Socket as ClientSocket } from 'socket.io-client';

import { createRedTetrisHttpServer } from '../main_server_entry_point';

const LONGEST_WAIT_FOR_AN_EVENT_IN_MILLISECONDS = 2000;

const ANY_FREE_PORT = 0;

export interface RunningTestServer {
  port: number;
  httpServer: HttpServer;
  connectedClients: ClientSocket[];
}

export async function startTestServer(): Promise<RunningTestServer> {
  const httpServer = createRedTetrisHttpServer();

  await new Promise<void>((resolve) => {
    httpServer.listen(ANY_FREE_PORT, resolve);
  });

  return { port: readListeningPort(httpServer), httpServer, connectedClients: [] };
}

function readListeningPort(httpServer: HttpServer): number {
  const serverAddress = httpServer.address();

  if (serverAddress === null || typeof serverAddress === 'string') {
    throw new Error('The test server is not listening on a TCP port');
  }

  return (serverAddress as AddressInfo).port;
}

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

export async function connectClient(testServer: RunningTestServer): Promise<ClientSocket> {
  const client = connectSocketIoClient(`http://localhost:${testServer.port}`, {
    transports: ['websocket'],
    forceNew: true,
  });

  testServer.connectedClients.push(client);

  await waitForEvent(client, 'connect');

  return client;
}

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
