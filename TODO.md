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

## Phase 0 — Joint: ratify the protocol, then build `shared/`

Do this together before splitting off into `server/` and `client/`. Everything
downstream imports from here, so divergence here desynchronises the whole app.

- [ ] Review and ratify the socket protocol proposal in `CLAUDE.md` §7 (event
      names, payloads); resolve the three open questions listed there
      (ack vs. fire-and-forget on `player:lines_cleared`, reconnect semantics,
      full vs. delta `roomState`). Remove the "pending ratification" warning
      once done.
- [ ] `shared/src/protocol/socket_event_names.ts` — frozen constant object of
      event names.
- [ ] `shared/src/protocol/client_to_server_payloads.ts` and
      `server_to_client_payloads.ts` — payload types for every event in §7.
- [ ] `shared/src/protocol/socket_typed_interfaces.ts` — typed `Socket`
      interfaces built from the above (no untyped `emit` anywhere, either side).
- [ ] `shared/src/game_rules/board_dimension_constants.ts` — the single source
      for 10×20 (C9); nobody hardcodes these numbers elsewhere.
- [ ] `shared/src/game_rules/tetromino_type_enum.ts` and
      `tetromino_shape_definitions.ts` — the seven tetrominoes and their
      rotation states.
- [ ] `shared/src/game_rules/piece_sequence_generator.ts` — pure, seeded 7-bag
      generator (D2, C10). This file must never be forked or reimplemented
      independently by either side.
- [ ] `shared/src/domain_types/board_cell_value.ts`,
      `spectrum_column_heights.ts`, `player_public_state.ts`,
      `room_public_state.ts` — shared value types.
- [ ] `shared/src/utils/seeded_random_number_generator.ts` — deterministic RNG
      backing the piece generator.
- [ ] `shared/` tests for the generator and board constants (this workspace's
      70/50 coverage gate applies too).

---

## Backend — Héloise (`server/`)

Owns: HTTP, config, socket layer, domain classes, room lifecycle, seed
generation, penalty routing, spectrum relay, elimination/winner resolution,
server tests. Never touches `client/`.

### Config & HTTP (extract from the current bootstrap)
- [ ] `config/server_configuration_loader.ts` — centralise the `PORT`/env
      reading currently inlined in `main_server_entry_point.ts`.
- [ ] `http/static_asset_http_server.ts` — the static-file serving currently
      inlined in the entry point.
- [ ] `http/single_page_application_fallback_route.ts` — the catch-all
      `index.html` fallback (C5, C6), same source, split out.
- [ ] Slim `main_server_entry_point.ts` down to wiring these pieces together
      plus the socket bootstrap.

### Domain classes (C3 — the only place classes exist server-side)
- [ ] `domain/piece.ts` — `Piece`: type, rotation index, spawn coordinates.
- [ ] `domain/player.ts` — `Player`: socket id, name, host flag, alive flag,
      latest spectrum, round reset.
- [ ] `domain/game.ts` — `Game`: player collection, status
      (`waiting`/`running`/`finished`), round seed, add/remove player, start
      round, distribute penalties (C11), mark elimination, resolve winner
      (C14).
- [ ] `domain/game_room_registry.ts` — `GameRoomRegistry`: room name → `Game`,
      creates on first join, destroys when empty (C14: multiple concurrent
      rooms).
- [ ] `domain/host_succession_resolver.ts` — `HostSuccessionResolver`: host
      election on join, promotion on host departure (C12), isolated for
      independent unit testing.

### Socket layer
- [ ] `socket/socket_server_bootstrap.ts` — attaches `socket.io` to the HTTP
      server, wires the handlers below.
- [ ] `socket/connection_lifecycle_handler.ts` — connect/disconnect, including
      the reconnect semantics ratified in Phase 0.
- [ ] `socket/room_membership_event_handler.ts` — `room:join_request` /
      `room:leave_request`, host assignment, join rejection reasons (C13).
- [ ] `socket/game_lifecycle_event_handler.ts` — `game:start_request` (host
      only), round start/seed broadcast, round finish.
- [ ] `socket/player_progress_event_handler.ts` — `player:spectrum_update`,
      `player:lines_cleared` → penalty routing (n−1, C11),
      `player:game_over_report` (D5).
- [ ] `socket/room_state_broadcaster.ts` — `room:state_updated` /
      `game:opponent_spectrum_updated` broadcasts.

### Errors
- [ ] `errors/game_already_started_error.ts`
- [ ] `errors/player_name_already_taken_error.ts`
- [ ] `errors/room_not_found_error.ts`

### Tests
- [ ] Unit tests for each domain class (`Game`, `Player`,
      `HostSuccessionResolver` especially — host-leaves-mid-round is easy to
      get wrong).
- [ ] Socket integration tests: real `socket.io-client` against an ephemeral
      server instance, covering join/reject flows, start gating (C13), penalty
      distribution, and win resolution.
- [ ] `npm run test:coverage -w server` ≥ thresholds in C7 before calling any
      module done.

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
