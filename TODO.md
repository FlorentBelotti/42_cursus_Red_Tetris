# TODO — Red Tetris

Task dispatch between the two developers, derived from `CLAUDE.md` (file tree
§4, responsibility split §5, key modules §6, protocol §7). Scaffolding
(workspaces, tsconfig, ESLint, Vitest, Vite, bootstrap entry points) is done —
see the repo root and `README.md`.

**Owners:** Héloise — backend (`server/`). Florent — frontend (`client/`).
`shared/` is co-owned: any change there needs the other owner's review and
lands as a single joint commit (§5).

Check items off as they land, and update the "Current state" table in
`CLAUDE.md` §8 at the end of each session — that table is the handover point
between sessions and between the two of you.

---

## Where things stand — 2026-08-27

**Backend is functionally complete, including the socket layer.** `config/`,
`http/`, the three domain classes, `GameRoomRegistry`,
`HostSuccessionResolver`, and all five socket modules
(`socket_server_bootstrap`, `connection_lifecycle_handler`,
`room_membership_event_handler`, `game_lifecycle_event_handler`,
`player_progress_event_handler`, `room_state_broadcaster`) are implemented,
typed end-to-end against `shared/src/protocol/`, and tested — including a
real `socket.io-client` integration suite. Every graded rule the backend owns
is implemented: **C9, C10, C11, C12, C13, C14.** See "What's left for the
socket layer" below for the (small) remaining items.

```
typecheck  ✓ 0 errors (root)      build  ✓ shared + server succeed
server test  ✓ 231 passing        coverage  98.48 stmts / 98.03 branch / 95.8 funcs / 98.48 lines  ✓ C7
shared test  ✓ 39 passing         coverage  96.46 stmts / 99.09 branch / 100 funcs / 96.46 lines  ✓ C7
```

**§7 is ratified** (2026-08-07) and fully implemented: fire-and-forget on
progress events, a reconnecting socket is a new player, `roomState` sent in
full. Nothing in the protocol is open, typed, or unimplemented any more.

**Phase 0 is effectively done.** `piece_sequence_generator.ts` and
`seeded_random_number_generator.ts` landed 2026-08-27 (deterministic LCG +
7-bag, closures only, tested, exported from the barrel). The only
outstanding shared item is `domain_types/board_cell_value.ts`.

**Fixed 2026-08-27:** `server/src/domain/game.ts` imported
`PlayerPublicState`/`RoomPublicState`/`RoomStatus` via the deep path
`shared/src/domain_types/...` instead of the `shared` barrel — exactly the
trap `shared/src/index.ts`'s own docstring warns about. It typechecked fine
but would have thrown `MODULE_NOT_FOUND` the moment a built server actually
loaded `game.js`, since `shared/package.json`'s `main` only exposes `dist/`.
Confirmed by building both workspaces and `require()`-ing the compiled
`game.js` before and after the fix. Now imports from `'shared'` like every
other file; all 231 server tests still pass.

**The critical path now is the frontend.** `client/` has no engine, state,
network, hooks, or components yet (see the Frontend section below) — that is
essentially the entire remaining scope of the project.

**Still open on the backend, not urgent:** reconcile `errors/` with §4 (see
that section below), decide whether to backfill coverage for
`main_server_entry_point.ts`'s `listen()`/`require.main` lines (currently
~53%, doesn't threaten the aggregate C7 gate).

---

## Phase 0 — Joint: ratify the protocol, then build `shared/`

Do this together before splitting off into `server/` and `client/`. Everything
downstream imports from here, so divergence here desynchronises the whole app.

- [x] **Ratify the socket protocol** in `CLAUDE.md` §7 — **done 2026-08-07**,
      warning removed. The three decisions, with rationale, are recorded in §7:
      - [x] Q1 — **fire-and-forget**, for all three client-to-server progress
            events. No acknowledgement callback anywhere in
            `ClientToServerEvents`.
      - [x] Q2 — **a reconnecting socket is a new player.** The seat is freed at
            once on `disconnect`, which is what `connection_lifecycle_handler`
            already does, so that code is now final rather than provisional. A
            returning client sends a fresh `room:join_request` and is refused
            mid-round like any other latecomer (C13).
      - [x] Q3 — **`roomState` in full on every update.**
            `Game.getRoomPublicState()` already implements this.
- [x] `shared/src/protocol/socket_event_names.ts` — frozen constant object of
      event names.
- [x] `shared/src/protocol/client_to_server_payloads.ts` and
      `server_to_client_payloads.ts` — payload types for every event in §7.
- [x] `shared/src/protocol/socket_typed_interfaces.ts` — typed `Socket`
      interfaces built from the above. Both `TypedSocketIoServer`/`TypedSocket`
      (server) consume these; no untyped `emit` anywhere in `server/src/socket/*`.
- [x] `shared/src/game_rules/board_dimension_constants.ts` — the single source
      for 10×20 (C9); nobody hardcodes these numbers elsewhere. **100% covered.**
- [x] `shared/src/game_rules/tetromino_type_enum.ts` and
      `tetromino_shape_definitions.ts` — the seven tetrominoes and their
      rotation states. **100% covered**, 156-line test suite.
- [x] `shared/src/game_rules/piece_sequence_generator.ts` — **done 2026-08-27.**
      `createPieceSequenceGenerator(seed)`: closure-based 7-bag (Fisher-Yates
      per bag, refilled on exhaustion), driven by the seeded RNG below (D2,
      C10). Tested (bag-property + determinism + cross-seed divergence), 100%
      of its own lines/branches bar one defensive unreachable throw. Exported
      from the barrel. **Do not fork or reimplement this file independently on
      either side — see the file's own docstring.**
- [ ] `shared/src/domain_types/` — shared value types. Nearly done:
      - [x] `spectrum_column_heights.ts` — **100% covered**, includes an
            `isValidSpectrumColumnHeights` guard for the socket boundary.
      - [x] `player_public_state.ts` and `room_public_state.ts` — written by
            the backend owner in the co-owned `shared/` workspace, in active use
            by `server/src/domain/game.ts` and the socket layer.
      - [ ] `board_cell_value.ts` — **the one remaining shared gap**, needed
            once the client board matrix exists.
- [x] `shared/src/utils/seeded_random_number_generator.ts` — **done
      2026-08-27.** `createSeededRandomNumberGenerator(seedValue)`: closure-based
      LCG (Numerical Recipes constants), deterministic, no `Math.random()`/
      `Date.now()`. 100% covered. Exported from the barrel.
- [x] `shared/` coverage gate (70/50) — **met: 96.46% stmts / 99.09% branch /
      100% funcs / 96.46% lines** (`npm run test:coverage -w shared`,
      2026-08-27).
- [x] `shared/src/index.ts` — the barrel exists and both workspaces import
      from `'shared'`. **One deep-path regression found and fixed 2026-08-27:**
      `server/src/domain/game.ts` was importing
      `shared/src/domain_types/{player_public_state,room_public_state}`
      directly — compiles fine, but is exactly the "typechecks, then throws
      `MODULE_NOT_FOUND` at runtime" trap this barrel exists to prevent, since
      `shared/package.json`'s `main` only exposes `dist/`. Now imports from
      `'shared'`; verified by building both workspaces and `require()`-ing the
      compiled `game.js`. Worth a quick `grep -rn "from ['\"]shared/src" server
      client` next time either workspace is touched, in case it recurs.

---

## Backend — Héloise (`server/`)

Owns: HTTP, config, socket layer, domain classes, room lifecycle, seed
generation, penalty routing, spectrum relay, elimination/winner resolution,
server tests. Never touches `client/`.

### Config & HTTP (extract from the current bootstrap)
- [x] `config/server_configuration_loader.ts` — centralise the `PORT`/env
      reading currently inlined in `main_server_entry_point.ts`.
- [x] `http/static_asset_http_server.ts` — the static-file serving currently
      inlined in the entry point.
- [x] `http/single_page_application_fallback_route.ts` — the catch-all
      `index.html` fallback (C5, C6), same source, split out.
- [x] Slim `main_server_entry_point.ts` down to wiring these pieces together
      plus the socket bootstrap.

### Domain classes (C3 — the only place classes exist server-side)
- [x] `domain/piece.ts` — `Piece`: type, rotation index, spawn coordinates.
      **100% covered, 13 tests.**
- [x] `domain/player.ts` — `Player`: socket id, name, host flag, alive flag,
      latest spectrum, round reset. **100% covered.** Carries a `playerId`
      distinct from `socketId`: the first is the identity the protocol sends
      and never changes, the second is the current connection. They hold the
      same value today, and keeping them apart is what would let Q2 be answered
      "reconnect reclaims the seat" later without `playerId` changing mid-round.
- [x] `domain/game.ts` — `Game`: player collection, status
      (`waiting`/`running`/`finished`), round seed, add/remove player, start
      round, distribute penalties (C11), mark elimination, resolve winner
      (C14). **Done, 99.36% covered, 47 tests:**
      - [x] player collection, status, add/remove player
      - [x] host succession on departure (C12), delegated to the resolver
      - [x] `getRoomPublicState()` — full room state: status, host id, player list
      - [x] round seed on `startRound()` (C10, D2) — `getRoundSeed()` consumed by
            `game_lifecycle_event_handler`'s `announceRoundStarted`
      - [x] `computePenaltyLineCount` + `listOpponentsToPenalise` (n−1, C11)
      - [x] `markPlayerAsEliminated` and `resolveWinner` (C14)
      - [x] restart path
      - [x] duplicate player name rejected via `NameAlreadyInUse`
- [x] `domain/game_room_registry.ts` — `GameRoomRegistry`: room name → `Game`,
      creates on first join, destroys when empty (C14: multiple concurrent
      rooms). **100% covered, 22 tests.**
- [x] `domain/host_succession_resolver.ts` — `HostSuccessionResolver`: host
      election on join, promotion on host departure (C12), isolated for
      independent unit testing. **C12 closed, 95% covered, 7 tests.** Written as
      a single invariant — a non-empty room has exactly one host — re-asserted
      by `Game` after every membership change, so election and succession are
      the same call.

### Socket layer — **done.** All five modules implemented, typed against
`shared/src/protocol/` end-to-end (no untyped `emit` anywhere), and covered by
both per-handler unit tests and a real `socket.io-client` integration suite.

- [x] `socket/socket_server_bootstrap.ts` — attaches `socket.io` to the HTTP
      server, typed as `TypedSocketIoServer` (`SocketIoServer<ClientToServerEvents,
      ServerToClientEvents>`). Creates the one `GameRoomRegistry` the process
      shares and injects it per connection, rather than a module-level
      singleton, so each bootstrapped server owns its rooms and integration
      tests never inherit state from a previous test.
- [x] `socket/connection_lifecycle_handler.ts` — connect/disconnect, including
      the reconnect semantics ratified in §7 (a reconnecting socket is a new
      player, Q2). Holds a per-socket `SocketRoomSession` and releases the seat
      on `disconnect` via exported `releaseSocketFromItsRoom`, reused by the
      leave path and by re-join-from-another-room.
- [x] `socket/room_membership_event_handler.ts` — `room:join_request` /
      `room:leave_request`, host assignment, join rejection reasons (C13).
      Both earlier bugs are fixed: `USABLE_NAME_PATTERN` is now
      `/^[\p{L}\p{N}_-]+$/u` (unicode-aware — "Chloé" and digits are accepted),
      and `findNameProblem` reports `invalid_room_name` vs `invalid_player_name`
      against the correct field. 26 tests.
- [x] `socket/game_lifecycle_event_handler.ts` — `game:start_request` (host
      only, silently ignored otherwise — no rejection event exists because the
      client never shows the control to a non-host), round start/seed
      broadcast (`announceRoundStarted`), round finish
      (`announceRoundFinishedWhenOver`, exported for reuse by the progress
      handler on elimination). Double-start is treated as a no-op via
      `GameAlreadyRunningError`, not a crash. 16 tests.
- [x] `socket/player_progress_event_handler.ts` — `player:spectrum_update`
      (validated with `isValidSpectrumColumnHeights` before touching the
      domain), `player:lines_cleared` → server-derived penalty routing (n−1,
      C11, via `Game.computePenaltyLineCount`/`listOpponentsToPenalise`, never
      trusting a client-sent penalty count), `player:game_over_report` (D5,
      triggers `markPlayerAsEliminated` + `announceRoundFinishedWhenOver`).
      Every handler is gated on `findRunningRoundContext` so a stale report
      (after the reporter left, or after the round closed) is silently
      ignored rather than resurrecting closed state. 26 tests.
- [x] `socket/room_state_broadcaster.ts` — `room:state_updated` (full state,
      §7 decision 3) and `game:opponent_spectrum_updated` (relayed via the
      reporting socket's own `.to(room)`, which excludes the reporter — no
      client-side self-filtering needed). 11 tests.

**What's left for the socket layer** (small, non-blocking):
- [ ] `errors/` reconciliation (see the Errors section below) — affects
      `resolveJoinRejectionReasonCode`'s mapping if the error class names or
      file layout change.
- [ ] Decide whether a duplicate `game:start_request` from a *former* host
      (one who just lost the role, e.g. mid-succession race) should be
      distinguishable from a non-host spam click — currently both are silently
      ignored, which matches the documented rationale but has no dedicated
      test for the race specifically.
- [ ] No rate-limiting/flood protection on any client→server event (not
      required by the subject, but worth a conscious "out of scope" note
      rather than silence, given `player:spectrum_update` fires on every
      piece lock).

### Errors
- [x] Implemented as a single `errors/management_errors.ts` exporting
      `GameAlreadyRunningError`, `NameAlreadyInUse` and `GameEndedError`.
- [ ] **Reconcile with §4**, which names three separate files
      (`game_already_started_error.ts`, `player_name_already_taken_error.ts`,
      `room_not_found_error.ts`). The current code has different file and class
      names, no `room_not_found` equivalent, and an extra `GameEndedError`.
      Either split the file to match §4 or amend §4 to match the code — but the
      two must stop disagreeing.

### Tests — **done.** 13 server test files, 231 tests passing.
- [x] Unit tests for each domain class:
      - [x] `host_succession_resolver_test.ts` — 7 tests, incl. chained host
            departures and the solo player leaving
      - [x] `player_test.ts` — 16 tests, incl. the defensive copies around the
            spectrum and hostship surviving a round reset
      - [x] `game_test.ts` — 47 tests, incl. round seed, penalties, elimination,
            winner resolution, restart, duplicate-name rejection
      - [x] `game_room_registry_test.ts` — 22 tests
      - [x] `piece_test.ts` — 13 tests
- [x] Socket integration tests: `socket_integration_test.ts`, a real
      `socket.io-client` against an ephemeral server instance (413 lines, 31
      tests) — join/reject flows, start gating (C13), penalty distribution,
      spectrum relay, elimination, and win resolution, plus a
      `socket_integration_test_harness.ts` and `socket_test_doubles.ts` for it.
- [x] `npm run test:coverage -w server` ≥ thresholds in C7 — **met, with real
      margin: 98.48% statements / 98.48% lines / 98.03% branches / 95.8%
      functions** (measured 2026-08-27, after the `game.ts` import fix — all
      231 tests still pass). Only `main_server_entry_point.ts` sits noticeably
      lower (~53%, the `listen()`/`require.main` lines aren't exercised), which
      doesn't threaten the aggregate gate.

---

## Frontend — Florent (`client/`)

Owns: pure game engine, Redux store and slices, socket middleware, hooks, all
components and styling, client tests. Never touches `server/`. No `this`
anywhere (C1, ESLint-enforced) — function components and hooks only.

### Routing
- [ ] `application_router.tsx` — `BrowserRouter` route for
      `/:room/:playerName` (C6), rendered from `main_client_entry_point.tsx`
      in place of today's placeholder heading.

### Game engine (C2 — pure functions only: no I/O, no mutation, no `Date.now()`/`Math.random()`, no React imports)
- [ ] `game_engine/empty_board_matrix_factory.ts`
- [ ] `game_engine/active_piece_state.ts`
- [ ] `game_engine/piece_spawn_positioning.ts`
- [ ] `game_engine/collision_detection.ts`
- [ ] `game_engine/piece_horizontal_movement.ts`
- [ ] `game_engine/piece_rotation_resolution.ts` — rotation + wall-kicks.
- [ ] `game_engine/piece_gravity_step.ts`
- [ ] `game_engine/piece_hard_drop_resolution.ts` (spacebar)
- [ ] `game_engine/piece_locking_into_board.ts` — one-tick lock delay (D6);
      active piece is never written into the board until it locks.
- [ ] `game_engine/completed_line_clearing.ts`
- [ ] `game_engine/penalty_line_insertion.ts` — shift up, insert indestructible
      rows (C11) that are never cleared as normal lines.
- [ ] `game_engine/spectrum_column_computation.ts` — 10 column heights.
- [ ] `game_engine/game_over_detection.ts` — top-out, including penalty-induced
      top-out (D5).
- [ ] `game_engine/board_display_projection.ts` — board + active piece →
      render matrix.

### State (Redux Toolkit, D4)
- [ ] `state/redux_store_configuration.ts`
- [ ] `state/slices/local_game_slice.ts` — calls into `game_engine/`, never
      reimplements its logic.
- [ ] `state/slices/room_membership_slice.ts`
- [ ] `state/slices/socket_connection_slice.ts`

### Network (the only layer allowed to touch the socket, D4)
- [ ] `network/socket_client_factory.ts`
- [ ] `network/socket_event_emitters.ts`
- [ ] `network/socket_event_subscription_registry.ts`
- [ ] `network/socket_redux_middleware.ts`

### Hooks
- [ ] `hooks/use_gravity_interval_ticker.ts` — one interval per player (D3).
- [ ] `hooks/use_keyboard_input_bindings.ts` — arrows + spacebar (§V.1.1 of the
      subject).
- [ ] `hooks/use_room_url_parameters.ts` — reads `room`/`playerName` from the
      route.

### Components (CSS Grid/flexbox only — no `<table>`, canvas, or SVG, C4)
- [ ] `components/layout/application_shell.tsx`
- [ ] `components/board/player_board_grid_view.tsx`,
      `board_cell_view.tsx`, `next_piece_preview_view.tsx`
- [ ] `components/opponents/opponent_spectrum_list_view.tsx`,
      `opponent_spectrum_column_view.tsx`
- [ ] `components/room/room_lobby_view.tsx`,
      `host_start_button_view.tsx` (host-only start/restart control)
- [ ] `components/feedback/game_over_overlay_view.tsx`

### Tests
- [ ] Unit tests for every `game_engine/` function (these are pure — highest
      leverage for the coverage gate).
- [ ] Component tests with `@testing-library/react` for board rendering,
      spectrum display, and the lobby/host-start flow.
- [ ] `npm run test:coverage -w client` ≥ thresholds in C7 before calling any
      module done.

---

## Phase 2 — Joint integration

- [ ] End-to-end manual pass: two browser tabs, same room URL, verify shared
      piece sequence (C10), penalty lines on line clear (C11), spectrum
      updates in real time, host succession on host tab close (C12), no join
      after start (C13), solo play (C14).
- [ ] `npm run typecheck && npm run lint && npm run test:coverage` all green
      at the repo root.
- [ ] Update `CLAUDE.md` §8 to `done` across the board.
