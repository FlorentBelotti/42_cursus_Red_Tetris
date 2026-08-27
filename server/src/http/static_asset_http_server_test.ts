import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createStaticAssetHttpApplication,
  resolveClientBuildDirectoryPath,
} from './static_asset_http_server';

const SINGLE_PAGE_APPLICATION_MARKUP = '<!doctype html><title>Red Tetris</title>';
const BUNDLED_ASSET_CONTENT = 'console.log("bundle");';

let clientBuildDirectoryPath: string;
let httpServer: HttpServer;
let baseUrl: string;

beforeAll(async () => {
  clientBuildDirectoryPath = fs.mkdtempSync(path.join(os.tmpdir(), 'red_tetris_static_'));
  fs.writeFileSync(
    path.join(clientBuildDirectoryPath, 'index.html'),
    SINGLE_PAGE_APPLICATION_MARKUP,
  );
  fs.mkdirSync(path.join(clientBuildDirectoryPath, 'assets'));
  fs.writeFileSync(
    path.join(clientBuildDirectoryPath, 'assets', 'main.js'),
    BUNDLED_ASSET_CONTENT,
  );

  httpServer = createServer(createStaticAssetHttpApplication(clientBuildDirectoryPath));
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

describe('createStaticAssetHttpApplication', () => {
  it('serves a built asset with its own content', async () => {
    const response = await fetch(`${baseUrl}/assets/main.js`);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe(BUNDLED_ASSET_CONTENT);
  });

  it('falls back to index.html for a route that matches no asset', async () => {
    const response = await fetch(`${baseUrl}/my_room/heloise`);

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe(SINGLE_PAGE_APPLICATION_MARKUP);
  });

  it('does not let the fallback shadow a real asset', async () => {
    const assetResponse = await fetch(`${baseUrl}/assets/main.js`);
    const fallbackResponse = await fetch(`${baseUrl}/assets/does_not_exist.js`);

    await expect(assetResponse.text()).resolves.toBe(BUNDLED_ASSET_CONTENT);
    await expect(fallbackResponse.text()).resolves.toBe(SINGLE_PAGE_APPLICATION_MARKUP);
  });
});

describe('resolveClientBuildDirectoryPath', () => {
  it('resolves to the client workspace build directory at the repository root', () => {
    const resolvedPath = resolveClientBuildDirectoryPath();

    expect(path.isAbsolute(resolvedPath)).toBe(true);
    expect(resolvedPath.endsWith(path.join('client', 'dist'))).toBe(true);
    expect(resolvedPath).not.toContain(path.join('server', 'client'));
  });
});
