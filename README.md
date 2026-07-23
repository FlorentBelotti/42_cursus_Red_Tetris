# Red Tetris

Networked multiplayer Tetris, full-stack TypeScript, npm workspaces monorepo.

## Workspaces

- `shared/` — pure TypeScript, zero runtime deps, consumed by `server/` and `client/`.
- `server/` — Node.js, Express, socket.io.
- `client/` — React SPA, Vite, Redux Toolkit.

## Prerequisites

- Node.js 20+
- npm 10+

## Installation

```sh
git clone <repository-url> red_tetris
cd red_tetris
npm install
cp .env.example .env
```

`npm install` resolves all three workspaces (`shared`, `server`, `client`) in
one pass — there is nothing to install per-workspace. `.env` is read by the
server (see `server/src/main_server_entry_point.ts`) and is gitignored; never
commit it.

## Run (development)

```sh
npm run dev
```

This starts both processes concurrently:

- `server/` via `tsx watch`, listening on `http://localhost:3001` (or `PORT`
  from `.env`).
- `client/` via the Vite dev server, listening on `http://localhost:5173`,
  with `/socket.io` proxied to the server (see `client/vite.config.ts`).

Open `http://localhost:5173` in a browser.

## Run (production)

```sh
npm run build
npm run start
```

`npm run build` compiles `shared/`, compiles `server/` to `server/dist/`, and
builds the client's static assets to `client/dist/`. `npm run start` then
runs the compiled server (`node server/dist/main_server_entry_point.js`),
which serves `client/dist/` (with an SPA fallback to `index.html`) and hosts
socket.io on the same HTTP server — there is no separate client process in
production. The listening port again comes from `PORT` in `.env` (default
`3001`).

## Other scripts

| Script | Purpose |
|---|---|
| `npm run typecheck` | Type-checks all three workspaces. |
| `npm run test` | Runs Vitest in all three workspaces. |
| `npm run test:coverage` | Runs Vitest with coverage thresholds enforced (C7: 70% statements/functions/lines, 50% branches). |
| `npm run lint` | Lints the whole repository. |
