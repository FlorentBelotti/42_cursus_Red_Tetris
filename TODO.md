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

## Where things stand — 2026-08-07

**Backend: the domain layer is finished.** `config/`, `http/`, `Piece`,
`Player`, `Game`, `GameRoomRegistry`, `HostSuccessionResolver` and the errors
are all done and tested. Every graded rule the domain owns is implemented:
**C9, C10, C11, C12, C13, C14.**

```
typecheck  ✓ 0 errors        build  ✓ succeeds
test       ✓ 121 passing     coverage  95.85 / 95.85 / 98.69 / 97.18  ✓ C7
```

**§7 is ratified** (2026-08-07): fire-and-forget on progress events, a
reconnecting socket is a new player, `roomState` sent in full. Nothing in the
protocol is open any more.

**The critical path is now Phase 0 itself.** Writing
`shared/src/protocol/` is the joint commit that unblocks all four remaining
socket modules — roughly three quarters of the backend work still to do.

**Unblocked backend work, needing nobody:** commit the work (most of it is
still untracked), reconcile `errors/` with §4, add the missing JSDoc (§9).

**Awaiting Florent's review:** `player_public_state.ts` and
`room_public_state.ts` were written by the backend owner in the co-owned
`shared/` workspace (§5).

**Parked in `_pending_protocol/`, to restore once the protocol exists:**
`room_membership_event_handler.ts` and a started `socket_typed_interfaces.ts`.

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
- [ ] `shared/src/protocol/socket_event_names.ts` — frozen constant object of
      event names.
- [ ] `shared/src/protocol/client_to_server_payloads.ts` and
      `server_to_client_payloads.ts` — payload types for every event in §7.
- [ ] `shared/src/protocol/socket_typed_interfaces.ts` — typed `Socket`
      interfaces built from the above (no untyped `emit` anywhere, either side).
      A started fragment is parked in `_pending_protocol/`; restore it with
      `git mv _pending_protocol/socket_typed_interfaces.ts shared/src/protocol/`
      once the payload files exist.
- [x] `shared/src/game_rules/board_dimension_constants.ts` — the single source
      for 10×20 (C9); nobody hardcodes these numbers elsewhere. **100% covered.**
- [x] `shared/src/game_rules/tetromino_type_enum.ts` and
      `tetromino_shape_definitions.ts` — the seven tetrominoes and their
      rotation states. *Written but untested — see the test item below.*
- [ ] `shared/src/game_rules/piece_sequence_generator.ts` — pure, seeded 7-bag
      generator (D2, C10). This file must never be forked or reimplemented
      independently by either side.
- [ ] `shared/src/domain_types/` — shared value types. Partially done:
      - [x] `spectrum_column_heights.ts` — **100% covered**, includes an
            `isValidSpectrumColumnHeights` guard for the socket boundary.
      - [x] `player_public_state.ts` and `room_public_state.ts` — **written by
            the backend owner, awaiting Florent's review** (co-owned, §5).
      - [ ] `board_cell_value.ts`
- [ ] `shared/src/utils/seeded_random_number_generator.ts` — deterministic RNG
      backing the piece generator.
- [ ] `shared/` coverage gate (70/50) — **currently failing at 50.88%
      statements.** `tetromino_shape_definitions.ts` is 104 lines at 0%; it is
      pure rotation data, and a typo there desynchronises every board in the
      room, so it is worth testing on merit. Note that type-only files can
      never be covered — consider excluding them in `shared/vitest.config.ts`.
- [ ] `shared/src/index.ts` — the barrel `shared/package.json` already
      advertises as `main`/`types`. Until it exists, both workspaces import
      deep paths (`shared/src/...`), which will not resolve at runtime.

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
      *Untested (0%).*
- [x] `domain/player.ts` — `Player`: socket id, name, host flag, alive flag,
      latest spectrum, round reset. **100% covered.** Carries a `playerId`
      distinct from `socketId`: the first is the identity the protocol sends
      and never changes, the second is the current connection. They hold the
      same value today, and keeping them apart is what would let Q2 be answered
      "reconnect reclaims the seat" later without `playerId` changing mid-round.
- [ ] `domain/game.ts` — `Game`: player collection, status
      (`waiting`/`running`/`finished`), round seed, add/remove player, start
      round, distribute penalties (C11), mark elimination, resolve winner
      (C14). **Partially done (84% covered):**
      - [x] player collection, status, add/remove player
      - [x] host succession on departure (C12), delegated to the resolver
      - [x] `getRoomPublicState()` — full room state: status, host id, player list
      - [ ] round seed on `startRound()` (C10, D2) — currently generates nothing
      - [ ] `distributePenalties` (n−1, C11)
      - [ ] `markEliminated` and `resolveWinner` (C14)
      - [ ] restart path — `Player.resetForNewRound()` exists, nothing calls it
      - [ ] reject a duplicate player name — `NameAlreadyInUse` is defined but
            never thrown; `addPlayer` dedupes by object identity, so two
            players sharing a name are both seated
- [x] `domain/game_room_registry.ts` — `GameRoomRegistry`: room name → `Game`,
      creates on first join, destroys when empty (C14: multiple concurrent
      rooms). *Untested (0%).*
- [x] `domain/host_succession_resolver.ts` — `HostSuccessionResolver`: host
      election on join, promotion on host departure (C12), isolated for
      independent unit testing. **C12 closed, 95% covered, 7 tests.** Written as
      a single invariant — a non-empty room has exactly one host — re-asserted
      by `Game` after every membership change, so election and succession are
      the same call.

### Socket layer

> Everything below except the bootstrap imports `shared/src/protocol/`, so it
> is gated on Phase 0. Write `room_state_broadcaster` **first** once the
> protocol lands — all three handlers call it.

- [x] `socket/socket_server_bootstrap.ts` — attaches `socket.io` to the HTTP
      server, wires the handlers below. Also creates the one `GameRoomRegistry`
      the process shares and injects it per connection, rather than exporting a
      module-level singleton, so each bootstrapped server owns its rooms and
      integration tests never inherit state from a previous test.
      *Still untyped — swap in `SocketIoServer<ClientToServerEvents,
      ServerToClientEvents>` as soon as the protocol exists (§7: no untyped
      `emit` anywhere).*
- [ ] `socket/connection_lifecycle_handler.ts` — connect/disconnect, including
      the reconnect semantics ratified in Phase 0. **Partially done:** holds a
      per-socket `SocketRoomSession` and releases the seat on `disconnect` via
      an exported `releaseSocketFromItsRoom`, reusable by the leave path.
      Reconnect handling waits on Q2.
- [ ] `socket/room_membership_event_handler.ts` — `room:join_request` /
      `room:leave_request`, host assignment, join rejection reasons (C13).
      **In progress and currently red — this file is the only reason
      `npm run typecheck -w server` and `npm run build -w server` fail.** Ten
      errors; eight need the protocol, two do not:
      - [ ] `isUsableRoomAndPlayerName(payload)` has an implicit `any` parameter
      - [ ] `/^[a-zA-Z]+$/` on the player name rejects digits and accents
            ("Chloé", "player1"), and a bad *player* name is reported as
            `reasonCode: 'invalid_room_name'`, which misleads the client
      Consider parking it in `_pending_protocol/` so the build gate goes green
      until Phase 0 lands.
- [ ] `socket/game_lifecycle_event_handler.ts` — `game:start_request` (host
      only), round start/seed broadcast, round finish. *Empty file.*
- [ ] `socket/player_progress_event_handler.ts` — `player:spectrum_update`,
      `player:lines_cleared` → penalty routing (n−1, C11),
      `player:game_over_report` (D5). Validate incoming spectrums with
      `isValidSpectrumColumnHeights` before they reach the domain.
- [ ] `socket/room_state_broadcaster.ts` — `room:state_updated` /
      `game:opponent_spectrum_updated` broadcasts.

### Errors
- [x] Implemented as a single `errors/management_errors.ts` exporting
      `GameAlreadyRunningError`, `NameAlreadyInUse` and `GameEndedError`.
- [ ] **Reconcile with §4**, which names three separate files
      (`game_already_started_error.ts`, `player_name_already_taken_error.ts`,
      `room_not_found_error.ts`). The current code has different file and class
      names, no `room_not_found` equivalent, and an extra `GameEndedError`.
      Either split the file to match §4 or amend §4 to match the code — but the
      two must stop disagreeing.

### Tests
- [ ] Unit tests for each domain class (`Game`, `Player`,
      `HostSuccessionResolver` especially — host-leaves-mid-round is easy to
      get wrong). **Partially done, 58 tests passing:**
      - [x] `host_succession_resolver_test.ts` — 7 tests, incl. chained host
            departures and the solo player leaving
      - [x] `player_test.ts` — 16 tests, incl. the defensive copies around the
            spectrum and hostship surviving a round reset
      - [x] `game_test.ts` — 19 tests, host succession and room public state
      - [ ] `game_room_registry_test.ts` — file is at **0%**
      - [ ] `piece_test.ts` — file is at **0%**
- [ ] Socket integration tests: real `socket.io-client` against an ephemeral
      server instance, covering join/reject flows, start gating (C13), penalty
      distribution, and win resolution.
- [x] `npm run test:coverage -w server` ≥ thresholds in C7 — **met:
      78.65% statements / 78.65% lines / 96.31% branches / 86.00% functions.**
      Margin is thin against the 70% floor, so the next untested module will
      break it; `game_room_registry_test.ts` and `piece_test.ts` buy headroom.

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
