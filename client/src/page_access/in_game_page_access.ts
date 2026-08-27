import { IN_GAME_KEY_LEGEND, type KeyLegendEntry } from '../mock_data/key_legend_per_page';

/**
 * The key legend for the In-Game screen. Movement keys are decorative in
 * this visual-only pass (see isInGameLeaveKey / isInGameRoundOverShortcutKey
 * for the two keys that are actually wired).
 */
export const IN_GAME_PAGE_KEY_LEGEND: readonly KeyLegendEntry[] = IN_GAME_KEY_LEGEND;

/**
 * Whether a keydown event should leave the room, back to Home. Mid-round
 * this would be a forfeit once real game logic exists.
 *
 * @param event - The keyboard event to inspect.
 * @returns True when the player should leave the room.
 */
export function isInGameLeaveKey(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}

/**
 * Temporary shortcut to reach the Round Over screen without real game-over
 * detection (that lands with the game engine). See CLAUDE.md TODO.md.
 *
 * @param event - The keyboard event to inspect.
 * @returns True when the round should end.
 */
export function isInGameRoundOverShortcutKey(event: KeyboardEvent): boolean {
  return event.key === 'Enter';
}
