# CLAUDE.md — Red Tetris

Networked multiplayer Tetris, full-stack TypeScript, npm workspaces monorepo.
Two developers: **backend owner** (`server/`) and **frontend owner** (`client/`).
`shared/` is co-owned.

The subject PDF is in the repository and is the authority on gameplay rules.
This file is the authority on **architecture, conventions, and protocol**.
Where this file and the PDF disagree on a *requirement*, the PDF wins — and the
disagreement must be reported, not silently resolved.

---

## 1. Hard constraints (graded — violating any of these fails the project)

| # | Constraint | Consequence |
|---|---|---|
| C1 | Client code must not use the `this` keyword (only exception: `Error` subclasses) | React function components + hooks only. No classes anywhere under `client/`. An ESLint rule bans `ThisExpression` in `client/src/**`. |
| C2 | Board and piece logic must be **pure functions** | `client/src/game_engine/` is side-effect-free: no I/O, no mutation of arguments, no `Date.now()`, no `Math.random()`. |
| C3 | Server code must be **object-oriented using prototypes**, defining at minimum `Player`, `Piece`, `Game` | Classes exist **only** under `server/src/domain/`. |
| C4 | No canvas, no SVG, no `<table>`, no DOM-manipulation libraries, no direct DOM access | Board is a CSS Grid of `<div>`s. Layout uses grid/flexbox exclusively. |
| C5 | Client is a Single Page Application: `index.html` + bundle, no further HTML exchanged | Vite build output served statically by the Node server, with a catch-all fallback route. |
| C6 | Join URL is `http://<host>:<port>/<room>/<player_name>` | `BrowserRouter` + server-side SPA fallback so deep links resolve. |
| C7 | Coverage ≥ 70% statements / functions / lines, ≥ 50% branches | Thresholds enforced in `vitest.config.ts` from day one. A run below threshold fails the build. |
| C8 | No credentials, API keys, or env values committed | `.env` is gitignored; `.env.example` is the documented template. |
| C9 | Board is 10 columns × 20 rows | `shared/src/game_rules/board_dimension_constants.ts` is the single source. Never hardcode 10 or 20 elsewhere. |
| C10 | Every player in a room receives the **same pieces, same positions, same coordinates**, possibly at different times | Deterministic seeded generator in `shared/`, identical on both sides. |
| C11 | Clearing *n* lines sends *n − 1* indestructible penalty lines to every opponent | Penalty rows are a distinct cell value and are never cleared by line completion. |
| C12 | First player to join is host; host controls start/restart; if the host leaves, another player is promoted | `HostSuccessionResolver` isolates this rule. |
| C13 | Once started, no new player may join until the next round | Enforced server-side; the client must handle the rejection gracefully. |
| C14 | Last player standing wins. Solo play is valid. Multiple concurrent rooms are supported. | Solo round ends when the single player tops out. |
| C15 | No data persistence | All state is in-memory. Process restart wipes everything, by design. |

---

## 2. Stack (locked — do not renegotiate mid-task)

**Monorepo:** npm workspaces. Root `tsconfig.base.json`, `strict: true`,
`noUncheckedIndexedAccess: true`. TypeScript project references
(`client` → `shared`, `server` → `shared`).

| Workspace | Runtime | Dependencies |
|---|---|---|
| `shared/` | — | none (pure TypeScript, zero runtime deps) |
| `server/` | Node 20+ | `express` (static + fallback only), `socket.io@4`, `dotenv`; `tsx` in dev, `tsc` for build |
| `client/` | Browser | `react@18`, `react-dom@18`, `@reduxjs/toolkit`, `react-redux`, `react-router-dom@6`, `socket.io-client`; Vite + CSS Modules |

**Testing:** Vitest in all three workspaces. Client adds `jsdom` +
`@testing-library/react`. Server integration tests use a real `socket.io-client`
against an ephemeral server instance.

**Explicitly excluded — do not add:** lodash, ramda, Immutable.js,
standalone `redux-thunk` (bundled in RTK), jQuery or any DOM library,
any canvas or SVG library, any CSS framework, any state library other than RTK.

Adding a dependency not listed above requires explicit approval. Say so and stop;
do not install it and continue.

---

## 3. Architecture decisions (with rationale — do not re-litigate)

**D1 — Client-authoritative simulation.** Each client simulates its own board:
gravity, collision, rotation, line clearing, penalty insertion, top-out
detection. The server never holds a board matrix.
*Rationale:* C2 requires the board logic to live client-side as pure functions.
A server-authoritative design would duplicate it and add input latency. Cheating
is out of scope for this subject.

**D2 — Piece distribution by shared seed.** The server generates one seed per
round and broadcasts it. Both sides derive the identical sequence from the same
pure 7-bag generator in `shared/src/game_rules/piece_sequence_generator.ts`.
*Rationale:* satisfies C10 with a single broadcast and no per-piece traffic, and
is trivially unit-testable. **The generator must never be reimplemented or
forked** — any divergence desynchronises the whole room.

**D3 — Gravity clock lives on the client.** One interval per player.
*Rationale:* fall speed is constant per the subject; a server tick would impose
lockstep and latency for no benefit.

**D4 — Redux Toolkit for client state, socket.io wired through middleware.**
*Rationale:* the subject recommends Redux; RTK's Immer keeps reducers free of
`this` and of manual immutability. The socket middleware is the single async
boundary — components never touch the socket directly.

**D5 — Top-out caused by penalty lines is detected client-side.** When inserting
penalty rows pushes the stack past the ceiling, the affected client runs
`game_over_detection` and reports its own elimination. The server records it and
evaluates the win condition.
*Rationale:* keeps all board reasoning in one place (D1) and avoids the server
needing stack heights beyond the spectrum.

**D6 — Lock delay is exactly one gravity tick.** A piece that lands is marked
lock-pending and locks on the *next* tick unless a movement or rotation frees it.
*Rationale:* the subject's "immobile only on the next frame" requirement.

**D7 — The provided boilerplate is not used.** It is webpack/Babel-era JavaScript
with a dated test pipeline; the subject explicitly warns against outdated
libraries and permits TypeScript. Vite + Vitest + TS replaces it.

---

## 4. File tree (validated)

```
red_tetris/
├── package.json                  # workspaces, root scripts
├── tsconfig.base.json
├── eslint.config.js
├── .prettierrc
├── .env.example
├── .gitignore                    # must include .env
├── README.md
├── CLAUDE.md
│
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── protocol/
│       │   ├── socket_event_names.ts
│       │   ├── client_to_server_payloads.ts
│       │   ├── server_to_client_payloads.ts
│       │   └── socket_typed_interfaces.ts
│       ├── game_rules/
│       │   ├── board_dimension_constants.ts
│       │   ├── tetromino_type_enum.ts
│       │   ├── tetromino_shape_definitions.ts
│       │   └── piece_sequence_generator.ts
│       ├── domain_types/
│       │   ├── board_cell_value.ts
│       │   ├── spectrum_column_heights.ts
│       │   ├── player_public_state.ts
│       │   └── room_public_state.ts
│       └── utils/
│           └── seeded_random_number_generator.ts
│
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── main_server_entry_point.ts
│       ├── config/
│       │   └── server_configuration_loader.ts
│       ├── http/
│       │   ├── static_asset_http_server.ts
│       │   └── single_page_application_fallback_route.ts
│       ├── domain/
│       │   ├── piece.ts
│       │   ├── player.ts
│       │   ├── game.ts
│       │   ├── game_room_registry.ts
│       │   └── host_succession_resolver.ts
│       ├── socket/
│       │   ├── socket_server_bootstrap.ts
│       │   ├── connection_lifecycle_handler.ts
│       │   ├── room_membership_event_handler.ts
│       │   ├── game_lifecycle_event_handler.ts
│       │   ├── player_progress_event_handler.ts
│       │   └── room_state_broadcaster.ts
│       └── errors/
│           ├── game_already_started_error.ts
│           ├── player_name_already_taken_error.ts
│           └── room_not_found_error.ts
│
└── client/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── vitest.config.ts
    ├── index.html
    └── src/
        ├── main_client_entry_point.tsx
        ├── application_router.tsx
        ├── game_engine/
        │   ├── empty_board_matrix_factory.ts
        │   ├── active_piece_state.ts
        │   ├── piece_spawn_positioning.ts
        │   ├── collision_detection.ts
        │   ├── piece_horizontal_movement.ts
        │   ├── piece_rotation_resolution.ts
        │   ├── piece_gravity_step.ts
        │   ├── piece_hard_drop_resolution.ts
        │   ├── piece_locking_into_board.ts
        │   ├── completed_line_clearing.ts
        │   ├── penalty_line_insertion.ts
        │   ├── spectrum_column_computation.ts
        │   ├── game_over_detection.ts
        │   └── board_display_projection.ts
        ├── state/
        │   ├── redux_store_configuration.ts
        │   └── slices/
        │       ├── local_game_slice.ts
        │       ├── room_membership_slice.ts
        │       └── socket_connection_slice.ts
        ├── network/
        │   ├── socket_client_factory.ts
        │   ├── socket_event_emitters.ts
        │   ├── socket_event_subscription_registry.ts
        │   └── socket_redux_middleware.ts
        ├── hooks/
        │   ├── use_gravity_interval_ticker.ts
        │   ├── use_keyboard_input_bindings.ts
        │   └── use_room_url_parameters.ts
        ├── components/
        │   ├── layout/
        │   │   └── application_shell.tsx
        │   ├── board/
        │   │   ├── player_board_grid_view.tsx
        │   │   ├── board_cell_view.tsx
        │   │   └── next_piece_preview_view.tsx
        │   ├── opponents/
        │   │   ├── opponent_spectrum_list_view.tsx
        │   │   └── opponent_spectrum_column_view.tsx
        │   ├── room/
        │   │   ├── room_lobby_view.tsx
        │   │   └── host_start_button_view.tsx
        │   └── feedback/
        │       └── game_over_overlay_view.tsx
        └── styles/
```

Test files sit beside their target as `<target_name>_test.ts` / `_test.tsx`.

---

## 5. Responsibility split

| Area | Owner |
|---|---|
| `shared/` | **Co-owned.** Any change requires the other owner's review. Protocol changes are a single joint commit; both rebase immediately. |
| `server/` — HTTP, config, socket layer, domain classes, room lifecycle, seed generation, penalty routing, spectrum relay, elimination and winner resolution, server tests | Backend owner |
| `client/` — pure game engine, Redux store and slices, socket middleware, hooks, all components and styling, client tests | Frontend owner |

Never modify files in the other owner's workspace. If a change there is needed,
state precisely what and why, and stop.

**Server owns:** room membership rules, host election and succession, round
seed, relaying penalties and spectrums, deciding the round is over.
**Client owns:** everything that reads or writes a board matrix.

---

## 6. Key modules

### Server domain (classes — the only place classes exist)

| Class | File | Responsibility |
|---|---|---|
| `Piece` | `domain/piece.ts` | One tetromino instance: type, rotation index, spawn coordinates. Deliberately thin; exists to satisfy C3. |
| `Player` | `domain/player.ts` | Socket id, name, host flag, alive flag, latest spectrum. Round reset. |
| `Game` | `domain/game.ts` | One room: player collection, status (`waiting` / `running` / `finished`), round seed, add/remove player, start round, distribute penalties, mark elimination, resolve winner. |
| `GameRoomRegistry` | `domain/game_room_registry.ts` | Room name → `Game`. Creates on first join, destroys when empty. |
| `HostSuccessionResolver` | `domain/host_succession_resolver.ts` | The "host left, promote someone" rule, isolated for independent testing. |

### Client game engine (pure functions — no `this`, no React imports, no side effects)

One or two exported functions per file, taking `(board, activePiece, …)` and
returning new values. Never mutate arguments. The Redux slice is the only
stateful layer and does nothing but call these functions.

Notable: `piece_rotation_resolution` (rotation + wall-kick handling),
`penalty_line_insertion` (shift up, insert indestructible rows),
`spectrum_column_computation` (10 integers: height of the highest block per
column), `board_display_projection` (board + active piece → render matrix; the
active piece is never written into the board until it locks).

---

## 7. Socket protocol — **PROPOSAL, pending ratification**

> ⚠️ This section is a starting proposal, not a decision. Both owners review and
> ratify (or amend) it in the day-1 pair session, then remove this warning.
> Until ratified, treat any implementation against it as provisional.

Event names live in `shared/src/protocol/socket_event_names.ts` as a frozen
constant object. Payload types live in the two payload files. Both sides import
the typed `Socket` interfaces — no untyped `emit` anywhere.

### Client → server

| Event | Payload | Notes |
|---|---|---|
| `room:join_request` | `{ roomName, playerName }` | Sent on mount, derived from the URL. May be rejected. |
| `room:leave_request` | `{}` | Explicit leave; disconnect is handled separately. |
| `game:start_request` | `{}` | Host only. Rejected otherwise. |
| `player:spectrum_update` | `{ spectrumColumnHeights }` | Sent after every piece lock. |
| `player:lines_cleared` | `{ clearedLineCount }` | Server derives penalties (`count − 1`). |
| `player:game_over_report` | `{}` | Self-reported top-out (see D5). |

### Server → client

| Event | Payload | Notes |
|---|---|---|
| `room:join_accepted` | `{ playerId, isHost, roomState }` | |
| `room:join_rejected` | `{ reasonCode }` | `game_already_started` \| `player_name_already_taken` \| `invalid_room_name` |
| `room:state_updated` | `{ roomState }` | Player list, host id, status. Broadcast on any membership change. |
| `game:round_started` | `{ pieceSequenceSeed }` | Client seeds its generator and begins. |
| `game:penalty_lines_received` | `{ penaltyLineCount, sourcePlayerId }` | |
| `game:opponent_spectrum_updated` | `{ playerId, spectrumColumnHeights }` | |
| `game:player_eliminated` | `{ playerId }` | |
| `game:round_finished` | `{ winnerPlayerId \| null }` | `null` for a solo round with no winner. |

**Open questions to settle when ratifying:**
1. Does the server acknowledge `player:lines_cleared`, or is it fire-and-forget?
2. Does a reconnecting socket rejoin its previous seat, or is it a new player?
3. Is `roomState` sent in full on every update, or as a delta? (Full is
   recommended: N is small and it removes a class of desync bugs.)

---

## 8. Current state

Legend: `not started` · `in progress` · `done` · `blocked`

| Module | Status |
|---|---|
| Repository scaffolding (workspaces, tsconfig, ESLint, Vitest, Vite) | not started |
| `shared/protocol/*` | not started |
| `shared/game_rules/*` | not started |
| `shared/domain_types/*` | not started |
| `shared/utils/seeded_random_number_generator` | not started |
| `server/config` + `server/http` | not started |
| `server/domain/piece` · `player` · `game` | not started |
| `server/domain/game_room_registry` · `host_succession_resolver` | not started |
| `server/socket/*` | not started |
| `server/errors/*` | not started |
| `client/game_engine/*` | not started |
| `client/state/*` | not started |
| `client/network/*` | not started |
| `client/hooks/*` | not started |
| `client/components/*` | not started |
| Server tests (domain + socket integration) | not started |
| Client tests (engine + components) | not started |
| Coverage thresholds met (C7) | not started |

**Update this table at the end of every session.** It is the handover between
sessions and between the two developers.

---

## 9. CODING STANDARD (applies to every file, without exception)

### Naming
- Function and variable names must be long and transparent about their role
  → Prefer `calculate_monthly_revenue_per_user()` over `calc_rev()`
- Consistent casing: snake_case for Python, camelCase for TypeScript
  → No mixing within a single file
- File and folder names in snake_case, transparent about their content
  → `user_authentication_handler.py` rather than `auth.py`
  → `data_pipeline/ingestion/raw_file_parser.py`

### Code decomposition
- Any identifiable logic must be encapsulated in its own function
- Any sub-logic within a function must be extracted into a sub-function
- A coherent set of functions tied to the same process → one class
- One class = one role, one file = one clear responsibility (SRP)
- Favor many small functions over few large ones

### File and folder structure
- Split into multiple files as soon as a file grows or mixes responsibilities
- Organize into folders that reflect the logical architecture of the project
  (e.g. /ingestion, /transformation, /storage, /api, /utils...)
- Each folder has a unique, readable role expressed in its name

### Style
- Chronological and readable code: the order of code reflects execution order
- Zero ternaries: always use explicit if/else
- No optimization at the expense of readability
- Mandatory function-level docstrings; inline comments only when logic is
  non-obvious

### Project-specific addenda
- **React files:** file name in `snake_case.tsx`, exported component in
  PascalCase. `player_board_grid_view.tsx` exports `PlayerBoardGridView`.
- **TypeScript identifiers** are camelCase (PascalCase for types, classes, and
  components); **file and folder names** are snake_case. No exceptions.
- No default exports except React components. Named exports everywhere else.
- Docstrings are JSDoc blocks on every exported function, class, and method,
  stating purpose, parameters, and return value.
- No ternaries — this includes JSX. Use an early return or a small named helper
  component instead of `cond ? <A/> : <B/>`.
- Magic numbers are forbidden. Board dimensions, penalty counts, tick intervals
  and cell values are named constants, in `shared/` when both sides need them.

---

## 10. Session protocol

1. **Architecture before code.** For any non-trivial task, propose the file and
   function breakdown and wait for validation before implementing.
2. **Stay in your workspace.** Do not edit the other owner's files. Do not edit
   `shared/` without flagging it explicitly.
3. **Do not add dependencies** beyond section 2 without approval.
4. **Before declaring a task done**, run `npm run typecheck`, `npm run lint`, and
   `npm run test:coverage`, and report the coverage figures against C7.
5. **Update section 8** and note any decision that amends sections 3 or 7.
6. If a requirement here conflicts with the subject PDF, **stop and report it**
   rather than choosing one.
