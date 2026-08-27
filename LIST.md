# LIST.md — Pages & Buttons

Inventory of every screen the client renders and every clickable control on
it. Derived from the subject (join-URL scheme, keyboard controls) and from
`CLAUDE.md` §4/§6 (component tree) and §7 (socket protocol).

The app has exactly **two routes** (`application_router.tsx`, C6): `/` and
`/:room/:playerName`. Everything else below is a **view**, switched by
`Game.status` (`waiting` / `running` / `finished`) inside the room route, not
a separate URL. Component file names in parentheses refer to `CLAUDE.md` §4.

Keyboard game controls (←/→/↑/↓/Space, subject §V.1.1) are **not buttons** —
they're listed once at the bottom for completeness, not repeated per page.

---

## Pages overview

| # | Page / view | Route | Shown when |
|---|---|---|---|
| 1 | Home / Join | `/` | No room in the URL yet. |
| 2 | Room Lobby | `/:room/:playerName` | `Game.status === 'waiting'`. |
| 3 | In-Game | `/:room/:playerName` | `Game.status === 'running'`. |
| 4 | Round Over overlay | `/:room/:playerName` | `Game.status === 'finished'`, drawn on top of view 3. |
| 5 | Join Rejected | `/:room/:playerName` | Server sent `room:join_rejected`. |

Persistent across all of them: the **application shell**
(`components/layout/application_shell.tsx`) — room name, your player name,
socket connection indicator.

---

## 1. Home / Join page

Entry point for anyone who doesn't already have a `/<room>/<player_name>`
link. Not required by the subject's URL scheme itself, but there must be
*something* at `/`, and typing two text fields is friendlier than editing the
address bar for a live demo/peer-eval.

| Button | Action |
|---|---|
| **Join** | Reads the room-name and player-name text inputs, navigates to `/<room>/<player_name>` (client-side; this is what actually triggers `room:join_request` once mounted there). Disabled until both fields are non-empty. |

---

## 2. Room Lobby page (`components/room/room_lobby_view.tsx`)

Shown to every player in the room while waiting for the host to start.
Displays the player list and who is host.

| Button | Action | Who sees it |
|---|---|---|
| **Start Game** (`components/room/host_start_button_view.tsx`) | Emits `game:start_request`. Enabled even with a single player (C14: solo play is valid). | Host only (C12) — not rendered for non-hosts. |
| **Leave Room** | Emits `room:leave_request`, navigates back to `/`. | Everyone. |

---

## 3. In-Game page (`components/board/*`, `components/opponents/*`)

Your board, next-piece preview, and opponents' spectrums. Gameplay itself is
keyboard-only (see bottom section) — there is **no on-screen button for
moving, rotating, or dropping a piece**.

| Button | Action | Who sees it |
|---|---|---|
| **Leave Room** (in the shell) | Emits `room:leave_request`; if you're mid-round this counts as a forfeit/elimination. | Everyone. |

That's the only clickable control on this page — everything else
(`player_board_grid_view.tsx`, `board_cell_view.tsx`,
`next_piece_preview_view.tsx`, `opponent_spectrum_list_view.tsx`,
`opponent_spectrum_column_view.tsx`) is read-only rendering.

---

## 4. Round Over overlay (`components/feedback/game_over_overlay_view.tsx`)

Drawn over the In-Game page once `game:round_finished` arrives. States the
winner (or "no winner" for a solo top-out).

| Button | Action | Who sees it |
|---|---|---|
| **Restart** | Emits `game:start_request` for a new round in the same room (C12: host controls restart). | Host only. |
| **Back to Lobby** | Dismisses the overlay; returns everyone to the Room Lobby view (no new socket event — the room state already reflects `waiting` once the host restarts, or players choose to wait there). | Everyone. |
| **Leave Room** | Same as elsewhere — emits `room:leave_request`, navigates to `/`. | Everyone. |

---

## 5. Join Rejected page

Shown instead of the lobby/game when `room:join_rejected` arrives, with the
reason code from `CLAUDE.md` §7 (`game_already_started`,
`player_name_already_taken`, `invalid_room_name`) rendered as a message.

| Button | Action |
|---|---|
| **Try Again** | Navigates back to `/` (Home) so the player can pick a different room or name. |

---

## Keyboard controls (not buttons, subject §V.1.1)

| Key | Effect |
|---|---|
| ← / → | Move piece horizontally |
| ↑ | Rotate piece |
| ↓ | Soft drop |
| Space | Hard drop |

Implemented by `hooks/use_keyboard_input_bindings.ts`, active only on the
In-Game page.
