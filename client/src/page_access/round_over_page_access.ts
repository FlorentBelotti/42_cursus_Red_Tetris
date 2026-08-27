import type { KeyboardPromptState } from '../components/ui/keyboard_prompt_view';
import {
  ROUND_OVER_GUEST_KEY_LEGEND,
  ROUND_OVER_HOST_KEY_LEGEND,
  type KeyLegendEntry,
} from '../mock_data/key_legend_per_page';

export type RoundOverPrompt = {
  readonly text: string;
  readonly state: KeyboardPromptState;
};

export type RoundOverOverlayContent = {
  readonly title: string;
  readonly subtitle: string;
  readonly restartPrompt: RoundOverPrompt;
};

/**
 * The key legend for the Round Over screen, which differs for the host.
 *
 * @param isHost - Whether the local player is the room's host.
 * @returns The key legend entries to render.
 */
export function resolveRoundOverKeyLegend(isHost: boolean): readonly KeyLegendEntry[] {
  if (isHost) {
    return ROUND_OVER_HOST_KEY_LEGEND;
  }

  return ROUND_OVER_GUEST_KEY_LEGEND;
}

/**
 * Builds the Round Over overlay's title, subtitle, and restart prompt.
 *
 * @param isHost - Whether the local player is the room's host.
 * @param localPlayerName - The local player's name.
 * @param winnerName - The winning player's name, or null for a solo top-out.
 * @returns The overlay copy to render.
 */
export function resolveRoundOverOverlayContent(
  isHost: boolean,
  localPlayerName: string,
  winnerName: string | null,
): RoundOverOverlayContent {
  let title = 'GAME OVER';
  if (winnerName === localPlayerName) {
    title = 'WINNER';
  }

  let subtitle = 'NO WINNER';
  if (winnerName !== null) {
    subtitle = `LAST FIELD STANDING : ${winnerName}`;
  }

  let restartPrompt: RoundOverPrompt = { text: '> WAITING FOR HOST TO RESTART', state: 'muted' };
  if (isHost) {
    restartPrompt = { text: '> PRESS [ENTER] TO RESTART', state: 'active' };
  }

  return { title, subtitle, restartPrompt };
}

/**
 * Whether a keydown event should restart the round. Host only (C12).
 *
 * @param event - The keyboard event to inspect.
 * @param isHost - Whether the local player is the room's host.
 * @returns True when a new round should start.
 */
export function isRoundOverRestartKey(event: KeyboardEvent, isHost: boolean): boolean {
  return isHost && event.key === 'Enter';
}

/**
 * Whether a keydown event should return to the Room Lobby.
 *
 * @param event - The keyboard event to inspect.
 * @returns True when the player should go back to the lobby.
 */
export function isRoundOverBackToLobbyKey(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}
