import type { KeyboardPromptState } from '../components/ui/keyboard_prompt_view';
import {
  ROOM_LOBBY_GUEST_KEY_LEGEND,
  ROOM_LOBBY_HOST_KEY_LEGEND,
  type KeyLegendEntry,
} from '../mock_data/key_legend_per_page';

export type RoomLobbyPrompt = {
  readonly text: string;
  readonly state: KeyboardPromptState;
};

/**
 * The key legend for the Room Lobby screen, which differs for the host.
 *
 * @param isHost - Whether the local player is the room's host.
 * @returns The key legend entries to render.
 */
export function resolveRoomLobbyKeyLegend(isHost: boolean): readonly KeyLegendEntry[] {
  if (isHost) {
    return ROOM_LOBBY_HOST_KEY_LEGEND;
  }

  return ROOM_LOBBY_GUEST_KEY_LEGEND;
}

/**
 * The start-game prompt shown in the Room Lobby, which only the host can act on.
 *
 * @param isHost - Whether the local player is the room's host.
 * @returns The prompt text and visual state to render.
 */
export function resolveRoomLobbyPrompt(isHost: boolean): RoomLobbyPrompt {
  if (isHost) {
    return { text: '> PRESS [ENTER] TO START GAME', state: 'active' };
  }

  return { text: '> WAITING FOR HOST', state: 'muted' };
}

/**
 * Whether a keydown event should start the round. Host only (C12).
 *
 * @param event - The keyboard event to inspect.
 * @param isHost - Whether the local player is the room's host.
 * @returns True when the round should start.
 */
export function isRoomLobbyStartGameKey(event: KeyboardEvent, isHost: boolean): boolean {
  return isHost && event.key === 'Enter';
}

/**
 * Whether a keydown event should leave the room, back to Home.
 *
 * @param event - The keyboard event to inspect.
 * @returns True when the player should leave the room.
 */
export function isRoomLobbyLeaveKey(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}
