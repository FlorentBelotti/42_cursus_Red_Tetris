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

**Backend is done.** Config, HTTP, all five domain classes (`Piece`, `Player`,
`Game`, `GameRoomRegistry`, `HostSuccessionResolver`), all five socket handler
modules and a real end-to-end socket.io-client integration suite are all
implemented and tested. Every graded rule the backend owns is closed: **C9,
C10 (seed broadcast + relay), C11 (penalty routing), C12 (host succession),
C13 (join gating), C14 (elimination/winner resolution), C15.**

```
typecheck  ✓ 0 errors        build  ✓ succeeds
server: 13 files, 231 tests passing   coverage 98.54 / 98.21 / 95.8 / 98.54  ✓ C7
shared:  2 files,  26 tests passing   coverage 94.80 / 98.50 / 85.71 / 94.80 ✓ C7
```

**Two unreconciled nits, harmless but still open:**
- `server/src/domain/game.ts` imports two types via a deep path
  (`shared/src/domain_types/...`) instead of `from 'shared'`. Confirmed
  harmless — both imports are type-only and TypeScript elides them from the
  compiled output entirely — but it is still a §4/§7 violation ("no deep
  paths") that should be fixed for hygiene.
- `errors/` is one file, `management_errors.ts`, exporting
  `GameAlreadyRunningError`, `NameAlreadyInUse`, `GameEndedError`. §4 names
  three separate files with different class names and no `room_not_found`
  equivalent. Either split the file to match §4 or amend §4 to match the
  code — the two must stop disagreeing.

**The critical path is now `shared/game_rules/` and `shared/utils/`.** Nothing
on the client can deal a piece until the seeded 7-bag generator exists — this
is the one gap blocking all client game-engine work, and it is small,
self-contained, and unblocked by anything else.

**The client is the real remaining body of work.** The visual layer is fully
built — every page, every component, all mock-data-driven — but it is
disconnected from any real game: `game_engine/`, `network/`, and
`state/slices/` are all still empty directories, `socket.io-client` is a
declared dependency that is never imported anywhere in `client/src`, and there
are zero client tests. See the Frontend section below; this is most of what's
left to reach a working, playable game.

**Housekeeping done this session:** every inline `//` and block `/* */ /**
*/` comment has been stripped from `client/src`, `server/src`, `shared/src`
and the five config files (`eslint.config.js`, `vite.config.ts`,
`vitest.config.ts` ×3). **This directly contradicts CLAUDE.md §9** ("Mandatory
function-level docstrings... Docstrings are JSDoc blocks on every exported
function, class, and method") **and §10.4** (declaring a task done requires
following the coding standard). Per §10.6, a conflict between an instruction
and this file's own standard is reported, not silently resolved: the comment
removal was done because it was explicitly requested, but §9/§10 have not
been changed to match, so the two now disagree. Decide one of:
- amend §9 to drop the JSDoc mandate, or
- treat comment-free as the current state only and re-add docstrings before
  the project is graded against §9 as written.

---

## Phase 0 — Joint: finish `shared/`

Everything downstream imports from here, so divergence here desynchronises
the whole app. The protocol (§7) is ratified and fully implemented — this
phase is now just the two files nothing else can proceed without, plus one
type nobody needs yet.

- [x] `shared/src/protocol/*` — all four files, ratified and implemented.
      `shared/src/index.ts` barrel exists; both workspaces import from
      `'shared'` (except the one deep-import nit above).
- [x] `shared/src/game_rules/board_dimension_constants.ts` — the single
      source for 10×20 (C9). **100% covered.**
- [x] `shared/src/game_rules/tetromino_type_enum.ts` and
      `tetromino_shape_definitions.ts` — the seven tetrominoes and their
      rotation states. **100% covered, 14 tests.**
- [ ] `shared/src/utils/seeded_random_number_generator.ts` — deterministic
      RNG. **Not started.** Directory is empty.
- [ ] `shared/src/game_rules/piece_sequence_generator.ts` — pure, seeded
      7-bag generator (D2, C10), built on the RNG above. **Not started — the
      single blocker for any client game-engine work.** Must never be forked
      or reimplemented independently by either side.
- [x] `shared/src/domain_types/spectrum_column_heights.ts` — **100%
      covered**, includes an `isValidSpectrumColumnHeights` guard used at the
      server's socket boundary.
- [x] `shared/src/domain_types/player_public_state.ts` and
      `room_public_state.ts` — written, reviewed, in use by the server.
- [ ] `shared/src/domain_types/board_cell_value.ts` — **not started.** Not
      urgent by itself, but the client board matrix (below) needs it.
- [x] `shared/` coverage gate (70/50) — **met: 94.80% statements, 98.50%
      branches, 85.71% functions.**

---

## Backend — Héloise (`server/`) — done, two nits remaining

Owns: HTTP, config, socket layer, domain classes, room lifecycle, seed
generation, penalty routing, spectrum relay, elimination/winner resolution,
server tests. Never touches `client/`.

- [x] `config/server_configuration_loader.ts`, `http/static_asset_http_server.ts`,
      `http/single_page_application_fallback_route.ts` — all implemented and
      tested, wired from `main_server_entry_point.ts`.
- [x] `domain/piece.ts`, `domain/player.ts` — implemented, tested, 100%
      covered.
- [x] `domain/game.ts` — round seed on `startRound()` (C10/D2), penalty
      computation (`computePenaltyLineCount`, `listOpponentsToPenalise`, C11),
      elimination (`markPlayerAsEliminated`), winner resolution
      (`resolveWinner`, C14), restart via `startRound`, duplicate-name
      rejection (`NameAlreadyInUse` thrown from `addPlayer`). **100% covered,
      47 tests.**
- [x] `domain/game_room_registry.ts` — room name → `Game`, creates on first
      join, destroys when empty (C14: multiple concurrent rooms). Tested, 22
      tests.
- [x] `domain/host_succession_resolver.ts` — host election and promotion
      (C12), isolated and independently tested. 95.45% covered, 7 tests.
- [x] `socket/socket_server_bootstrap.ts` — typed `SocketIoServer`, injects a
      fresh `GameRoomRegistry` per bootstrap (no module-level singleton, so
      integration tests never leak state between runs).
- [x] `socket/connection_lifecycle_handler.ts` — connect/disconnect, seat
      release via `releaseSocketFromItsRoom`, reused by the explicit leave
      path. 100% covered.
- [x] `socket/room_membership_event_handler.ts` — `room:join_request` /
      `room:leave_request`, host assignment, all four join-rejection reasons
      (C13). 97.26% covered, 26 tests.
- [x] `socket/game_lifecycle_event_handler.ts` — `game:start_request`
      (host-only gating), round start/seed broadcast, round finish. 96.74%
      covered, 16 tests.
- [x] `socket/player_progress_event_handler.ts` — `player:spectrum_update`
      (validated via `isValidSpectrumColumnHeights` before it reaches the
      domain), `player:lines_cleared` → penalty routing (C11),
      `player:game_over_report` (D5). 95.87% covered, 26 tests.
- [x] `socket/room_state_broadcaster.ts` — `room:state_updated` /
      `game:opponent_spectrum_updated` broadcasts. 100% covered, 11 tests.
- [x] Real end-to-end socket integration suite (`socket_integration_test.ts`,
      31 tests) against an ephemeral server with a real `socket.io-client`,
      covering join/reject flows, host succession, start gating, and the
      round lifecycle. Flaky-listener bug fixed this session (see below).
- [ ] `errors/` — reconcile with §4 (see the nit above).
- [ ] `domain/game.ts` — drop the two deep `shared/src/...` imports in favor
      of `from 'shared'` (see the nit above).
- [x] `npm run test:coverage -w server` ≥ thresholds in C7 — **met: 98.54%
      statements/lines, 98.21% branches, 95.8% functions.**

---

## Frontend — Florent (`client/`) — visual layer built, wiring not started

Owns: pure game engine, Redux store and slices, socket middleware, hooks, all
components and styling, client tests. Never touches `server/`. No `this`
anywhere (C1, ESLint-enforced) — function components and hooks only.

**Built and working:** the terminal-styled home page, room lobby, board and
opponent-spectrum views, join-rejected and game-over feedback screens, and
all their CSS Modules — all rendering from `mock_data/`, not from real game
or network state. `application_router.tsx` and `use_room_url_parameters.ts`
already handle the `/:room/:playerName` route (C6). This is real, substantial
work, but none of it is connected to a socket or to gameplay yet.

### Game engine (C2 — pure functions only: no I/O, no mutation, no `Date.now()`/`Math.random()`, no React imports)
Blocked on `shared/game_rules/piece_sequence_generator.ts` (Phase 0) for
anything that deals a piece; the board-matrix/collision files can start
sooner but need `shared/domain_types/board_cell_value.ts` first.
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
- [ ] `game_engine/game_over_detection.ts` — top-out, including
      penalty-induced top-out (D5).
- [ ] `game_engine/board_display_projection.ts` — board + active piece →
      render matrix.

### State (Redux Toolkit, D4) — directory exists, empty
- [ ] `state/redux_store_configuration.ts`
- [ ] `state/slices/local_game_slice.ts` — calls into `game_engine/`, never
      reimplements its logic.
- [ ] `state/slices/room_membership_slice.ts`
- [ ] `state/slices/socket_connection_slice.ts`

### Network (the only layer allowed to touch the socket, D4) — directory exists, empty
`socket.io-client` is already a `client/package.json` dependency but is not
imported anywhere yet.
- [ ] `network/socket_client_factory.ts`
- [ ] `network/socket_event_emitters.ts`
- [ ] `network/socket_event_subscription_registry.ts`
- [ ] `network/socket_redux_middleware.ts` — the single async boundary;
      components must keep not touching the socket directly.

### Hooks
- [x] `hooks/use_keyboard_input_bindings.ts` — arrows + spacebar.
- [x] `hooks/use_room_url_parameters.ts` — reads `room`/`playerName` from the
      route.
- [ ] `hooks/use_gravity_interval_ticker.ts` — one interval per player (D3).
      **Not started.**

### Components — built
- [x] `components/layout/application_shell.tsx`, `key_legend_view.tsx`
- [x] `components/board/player_board_grid_view.tsx`, `board_cell_view.tsx`,
      `next_piece_preview_view.tsx`, `stats_panel_view.tsx`
- [x] `components/opponents/opponent_spectrum_list_view.tsx`,
      `opponent_spectrum_column_view.tsx`
- [x] `components/room/room_lobby_view.tsx`, `host_start_button_view.tsx`,
      `player_table_view.tsx`
- [x] `components/feedback/game_over_overlay_view.tsx`, `join_rejected_view.tsx`
- [x] `components/home/terminal_input_view.tsx`, `terminal_intro_view.tsx`,
      `terminal_log_view.tsx`
- [x] `components/ui/block_cursor_view.tsx`, `keyboard_prompt_view.tsx`,
      `panel_view.tsx`

All of the above render from `mock_data/`; wiring them to `state/slices/`
instead is part of the state/network work above, not new component work.

### Tests
- [ ] Unit tests for every `game_engine/` function once written — pure
      functions, highest leverage for the coverage gate.
- [ ] Component tests with `@testing-library/react` for board rendering,
      spectrum display, and the lobby/host-start flow.
- [ ] `npm run test:coverage -w client` ≥ thresholds in C7. **Currently 0
      test files — client coverage has never been measured.**

---

## Phase 2 — Joint integration

- [ ] End-to-end manual pass: two browser tabs, same room URL, verify shared
      piece sequence (C10), penalty lines on line clear (C11), spectrum
      updates in real time, host succession on host tab close (C12), no join
      after start (C13), solo play (C14).
- [ ] `npm run typecheck && npm run lint && npm run test:coverage` all green
      at the repo root, including client coverage above C7.
- [ ] Resolve the two backend nits (deep import in `game.ts`, `errors/` vs
      §4) and the comment-removal vs. §9 conflict above.
- [ ] Update `CLAUDE.md` §8 to `done` across the board.
