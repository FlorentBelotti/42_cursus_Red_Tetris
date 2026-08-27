import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import express from 'express';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { registerSinglePageApplicationFallbackRoute } from './single_page_application_fallback_route';

const SINGLE_PAGE_APPLICATION_MARKUP = '<!doctype html><title>Red Tetris</title>';

let clientBuildDirectoryPath: string;
let httpServer: HttpServer;
let baseUrl: string;

beforeAll(async () => {
  clientBuildDirectoryPath = fs.mkdtempSync(path.join(os.tmpdir(), 'red_tetris_fallback_'));
  fs.writeFileSync(
    path.join(clientBuildDirectoryPath, 'index.html'),
    SINGLE_PAGE_APPLICATION_MARKUP,
  );

  const application = express();
  registerSinglePageApplicationFallbackRoute(application, clientBuildDirectoryPath);

  httpServer = createServer(application);
  await new Promise<void>((resolve) => {
    httpServer.listen(0, resolve);
  });

  const { port } = httpServer.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve) => {
    httpServer.close(() => {
      resolve();
    });
  });
  fs.rmSync(clientBuildDirectoryPath, { recursive: true, force: true });
});

describe('registerSinglePageApplicationFallbackRoute', () => {
  it('answers the root path with index.html', async () => {
    const response = await fetch(`${baseUrl}/`);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe(SINGLE_PAGE_APPLICATION_MARKUP);
  });

  it('answers a room deep link with index.html so the client router can resolve it', async () => {
    const response = await fetch(`${baseUrl}/my_room/heloise`);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe(SINGLE_PAGE_APPLICATION_MARKUP);
  });

  it('answers an arbitrarily deep unknown path with index.html', async () => {
    const response = await fetch(`${baseUrl}/one/two/three/four`);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe(SINGLE_PAGE_APPLICATION_MARKUP);
  });
});
