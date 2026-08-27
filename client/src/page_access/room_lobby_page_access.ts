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

export function resolveRoomLobbyKeyLegend(isHost: boolean): readonly KeyLegendEntry[] {
  if (isHost) {
    return ROOM_LOBBY_HOST_KEY_LEGEND;
  }

  return ROOM_LOBBY_GUEST_KEY_LEGEND;
}

export function resolveRoomLobbyPrompt(isHost: boolean): RoomLobbyPrompt {
  if (isHost) {
    return { text: '> PRESS [ENTER] TO START GAME', state: 'active' };
  }

  return { text: '> WAITING FOR HOST', state: 'muted' };
}

export function isRoomLobbyStartGameKey(event: KeyboardEvent, isHost: boolean): boolean {
  return isHost && event.key === 'Enter';
}

export function isRoomLobbyLeaveKey(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}
