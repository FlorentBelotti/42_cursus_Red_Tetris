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

export function resolveRoundOverKeyLegend(isHost: boolean): readonly KeyLegendEntry[] {
  if (isHost) {
    return ROUND_OVER_HOST_KEY_LEGEND;
  }

  return ROUND_OVER_GUEST_KEY_LEGEND;
}

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

export function isRoundOverRestartKey(event: KeyboardEvent, isHost: boolean): boolean {
  return isHost && event.key === 'Enter';
}

export function isRoundOverBackToLobbyKey(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}
