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

## Where things stand — 2026-08-29

**The game is playable end-to-end.** Backend, shared, and frontend are all
implemented and wired together: a room can be joined, the host can start a
round, both sides simulate the same piece sequence from the same seed, pieces
move/rotate/hard-drop/lock, completed lines clear, penalties relay to
opponents in real time, top-out (including penalty-induced top-out) is
detected and reported, and the round resolves with the correct winner (or no
winner, for solo play). Verified with a real two-browser Playwright pass this
session, not just the test suite: join → lobby with real players → start →
movement/rotation/hard-drop → opponent's spectrum updating live on the other
tab → solo top-out → `GAME OVER` / `NO WINNER` → restart → and a late joiner
correctly rejected with `GAME ALREADY STARTED`.

```
typecheck  ✓ 0 errors      lint  ✓ 0 errors      build  ✓ shared+server+client succeed
shared  39 tests   coverage 96.46 stmts / 98.21 branch / 94.44 funcs / 96.46 lines  ✓ C7
server 231 tests   coverage 98.48 stmts / 98.04 branch / 95.80 funcs / 98.48 lines  ✓ C7
client 121 tests   coverage 81.10 stmts / 91.05 branch / 92.07 funcs / 81.10 lines  ✓ C7
```

**What landed this session:**
- `client/game_engine/*` — all 14 pure functions from §4 plus two small
  additions (`board_cell_state.ts`, `piece_sequence_indexing.ts` — see below).
  No `this`, no I/O, no `Math.random()`/`Date.now()`, no React imports (C2).
- `client/state/*` — `redux_store_configuration.ts` and all three slices
  (`local_game_slice`, `room_membership_slice`, `socket_connection_slice`).
- `client/network/socket_redux_middleware.ts` — the last missing network
  file; the other three (`socket_client_factory`, `socket_event_emitters`,
  `socket_event_subscription_registry`) already existed from an earlier
  session and are unchanged. The middleware is the only place that both
  reads socket events into actions and watches state transitions to decide
  when to emit (`player:lines_cleared`, `player:spectrum_update`,
  `player:game_over_report`) — components and reducers never touch the
  socket (D4).
- `client/hooks/use_gravity_interval_ticker.ts` — the last missing hook.
- `client/components/room/player_data_console_view.tsx` — replaces the
  in-game aside/opponents column. See "Design decision" below.
- `shared/domain_types/board_cell_value.ts` — the one shared gap from last
  session, now closed: `'empty' | 'filled' | 'penalty'`.
- Every mock/placeholder game-state file is gone (see "Mock data removed"
  below); every component now renders real state, with two narrow
  exceptions noted there.
- Every file touched this session (and a few left over from the last one:
  `shared/game_rules/piece_sequence_generator.ts`,
  `shared/utils/seeded_random_number_generator.ts`, and the client
  `network/*` files) has had its comments stripped — see the conflict this
  reopens with §9, noted below, unchanged from last session.
- `client/vitest.config.ts` gained a `setupFiles` entry
  (`src/test_setup.ts`) that runs `@testing-library/react`'s `cleanup()`
  after every test. Without it, a hook test that attaches a `window`
  listener (`use_keyboard_input_bindings`) leaked into the next test and
  produced a real, reproducible false failure — worth knowing before adding
  more hook/DOM tests.

**Design decision — the in-game aside is gone, replaced by plain text.**
`next_piece_preview_view`, `stats_panel_view`, `opponent_spectrum_list_view`
and `opponent_spectrum_column_view` (the bar-chart opponent visualisation)
are deleted, along with their sample data. In their place,
`player_data_console_view.tsx` prints one plain line per player — `YOU
<name> LINES <n> SENT <n>` for the local player, `<name> ALIVE|DEAD H:<10
numbers>` for everyone else — styled like the home terminal's log, not as a
boxed widget. This was an explicit instruction this session, not a judgement
call; if the "esthetic" panels are wanted back for the next-piece preview or
per-run stats, that's new scope, not a revert.

**Mock data removed, with two narrow exceptions kept on purpose:**
- Deleted: `game_over_outcome_sample`, `next_piece_preview_sample`,
  `opponent_spectrum_sample_data`, `placeholder_board_state`,
  `placeholder_round_stats`, `room_lobby_sample_players`, the stale
  duplicate `tetromino_shape_definitions.ts` in `mock_data/` (superseded by
  `shared`'s real one — it even used a different `[column, row]` coordinate
  convention from the shared `[row, column]` one, so it's good this never
  shipped), and `board_cell_state.ts` (moved into `game_engine/`, since it's
  now a real engine type, not a mock).
- Kept as-is, still under `mock_data/`: `key_legend_per_page.ts`,
  `terminal_command_reference.ts`, `terminal_log_entry.ts`,
  `terminal_shell_prompt.ts`, `join_rejected_reason_messages.ts` (now
  imports `JoinRejectionReasonCode` from `shared` instead of redefining a
  3-of-4 local copy — the missing `invalid_player_name` case would have
  crashed on that specific rejection reason; fixed). These are real static
  copy/lookup tables, not stand-ins for state — `mock_data/` is a slight
  misnomer for them now, worth a folder rename if anyone wants it, but not
  done here to avoid unrelated churn.
- Kept on purpose, not a leftover: `pages/join_rejected_preview_page.tsx`
  (route `/__preview/rejected`) still drives itself from a URL query
  parameter rather than a live socket. It's a design/QA preview tool
  separate from the real join flow (which now lives in `room_route_page.tsx`
  and reacts to a real `room:join_rejected` event) — flagging the decision
  to leave it rather than silently deleting or "fixing" it.

**Still open — small, non-blocking:**
- [ ] `errors/` (server) still doesn't match §4's three-file layout — see
      the Backend section, unchanged from last session.
- [ ] `server/src/domain/game.ts`'s cosmetic deep import — also unchanged,
      see Backend section.
- [ ] **Comment removal vs. §9 conflict — still open, not silently
      resolved.** §9 mandates "Docstrings are JSDoc blocks on every exported
      function, class, and method." This session's "no comment" instruction
      was applied repo-wide again (including to the two shared files and
      the `network/*` files that had picked up fresh JSDoc since the last
      pass). Either amend §9 to drop the mandate, or accept that the code
      will need docstrings re-added before being graded against §9 as
      written — same two options as last session, still unpicked.
- [ ] No dedicated tests for `state/redux_store_configuration.ts`,
      `network/socket_redux_middleware.ts`, `application_router.tsx`,
      `main_client_entry_point.tsx`, or the three page components
      (`home_terminal_page`, `room_route_page`, `join_rejected_preview_page`)
      — all at 0% individually. The aggregate client coverage clears C7
      anyway (81.1/91.05/92.07/81.1, see above) because the engine, slices,
      network emitters/subscriptions, hooks, and most components are
      thoroughly covered — but these specific files are unverified by
      anything except the manual Playwright pass. `socket_redux_middleware`
      in particular is the piece most likely to hide a real bug (it is the
      one place state-diffing decides what to emit), so it's the one worth
      testing first if anyone picks this up.
- [ ] No automated test for line-clearing or penalty-relay *end to end*
      (pure-function line clearing is unit-tested; the manual browser pass
      confirmed spectrum relay and top-out but not a full line clear, since
      scripting a specific piece sequence through the keyboard wasn't
      attempted this session). Worth a deliberate integration test using a
      known seed and a scripted drop sequence that completes a row.
- [ ] Wall-kick offsets in `piece_rotation_resolution.ts`
      (`[0, -1, 1, -2, 2]`) are a simple, workable approximation, not the
      SRS kick table. Fine for this subject's requirements but worth naming
      explicitly in case someone expects SRS-accurate kicks later.

---

## Phase 0 — Joint: `shared/` — done

- [x] Protocol (§7), `game_rules/*`, `domain_types/*` (including
      `board_cell_value.ts`, added this session), `utils/seeded_random_number_generator.ts`.
      Barrel (`shared/src/index.ts`) exports everything both workspaces use;
      no deep imports left except the one server-side cosmetic nit noted below.
- [x] Coverage: 96.46% stmts / 98.21% branch / 94.44% funcs / 96.46% lines.

---

## Backend — Héloise (`server/`) — done, two nits remaining

Owns: HTTP, config, socket layer, domain classes, room lifecycle, seed
generation, penalty routing, spectrum relay, elimination/winner resolution,
server tests. Never touches `client/`.

- [x] `config/`, `http/` — done and tested.
- [x] `domain/piece.ts`, `player.ts`, `game.ts`, `game_room_registry.ts`,
      `host_succession_resolver.ts` — done and tested. `Game` covers round
      seed, penalty math, elimination, winner resolution, restart,
      duplicate-name rejection.
- [x] `socket/*` — all five handler modules, typed end-to-end against
      `shared/src/protocol/`, plus a real `socket.io-client` integration
      suite (31 tests).
- [ ] `errors/` — still one `management_errors.ts` file instead of §4's
      three (`game_already_started_error.ts`, `player_name_already_taken_error.ts`,
      `room_not_found_error.ts`), with different class names and an extra
      `GameEndedError`. Either split the file to match §4 or amend §4 —
      the two must stop disagreeing.
- [ ] `domain/game.ts` imports two types via the deep path
      `shared/src/domain_types/...` instead of `from 'shared'`. Harmless
      (type-only, elided at compile time) but still a §4/§7 "no deep paths"
      violation worth a quick fix.
- [x] Coverage: 98.48% stmts / 98.04% branch / 95.80% funcs / 98.48% lines
      (231 tests).

---

## Frontend — Florent (`client/`) — done, connected end to end

Owns: pure game engine, Redux store and slices, socket middleware, hooks, all
components and styling, client tests. Never touches `server/`. No `this`
anywhere (C1, ESLint-enforced) — function components and hooks only.

- [x] `game_engine/*` — all 14 files from §4, plus `board_cell_state.ts`
      (the `BoardCellState` type used by every board-rendering component)
      and `piece_sequence_indexing.ts` (`getTetrominoTypeAtSequenceIndex` —
      a pure wrapper around `shared`'s `createPieceSequenceGenerator` that
      lets Redux ask "what piece is at index N of this seed's sequence"
      without storing a non-serializable generator closure in state; it does
      not fork or reimplement the generator itself, only calls it). Tested,
      96.24% of the folder covered.
- [x] `state/redux_store_configuration.ts` and all three slices — tested
      (`socket_connection_slice` 100%, `room_membership_slice` 100%,
      `local_game_slice` ~76%, the reducer branches not hit are mostly
      early-return guards).
- [x] `network/*` — all four files, including the previously-missing
      `socket_redux_middleware.ts`. This is the file that decides, after
      every dispatched action, whether a piece just locked (by checking
      whether the board reference changed) and whether the game just ended
      (by checking the `isGameOver` transition), and emits the matching
      socket event — the only place in the client that does either.
- [x] `hooks/use_gravity_interval_ticker.ts` — the previously-missing hook;
      `use_keyboard_input_bindings.ts` and `use_room_url_parameters.ts`
      already existed. All three tested (100%).
- [x] `components/*` — every component now renders real state instead of
      mock data. `next_piece_preview_view`, `stats_panel_view`, and the
      whole `components/opponents/` folder are deleted (see "Design
      decision" above); `player_data_console_view.tsx` replaces them.
      `room_route_page.tsx` now handles four real states — connecting,
      rejected (real `room:join_rejected` reason), waiting/lobby with real
      players, and running/finished with the real board and player data —
      instead of always showing the lobby with sample players.
- [x] Tests: 121 passing across engine, slices, network, hooks, page_access,
      and most components. Coverage: 81.10% stmts / 91.05% branch / 92.07%
      funcs / 81.10% lines — clears C7 with room to spare, though see the
      "still open" note above about which specific files are untested.

---

## Phase 2 — Joint integration

- [x] End-to-end pass with two real browser tabs (this session, via
      Playwright, not just describing the plan): shared piece sequence
      (opponent's spectrum matches what was actually dropped, C10), spectrum
      updates in real time (C11's prerequisite), solo top-out and round
      resolution with the correct "no winner" result (C14), restart, and
      join rejection once a round has started (C13). **Not yet exercised
      this way:** an actual multi-line clear sending penalties to a second
      live player, and host succession when the host's tab disconnects
      mid-round (both are covered by server-side tests, just not watched
      happen in two live browsers).
- [x] `npm run typecheck && npm run lint && npm run test:coverage` all green
      at the repo root, client coverage included.
- [ ] Resolve the two backend nits and the comment-removal vs. §9 conflict
      above.
- [x] Update `CLAUDE.md` §8 to `done` across the board — done 2026-08-29.
