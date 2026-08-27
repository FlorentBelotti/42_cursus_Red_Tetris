import { JOIN_REJECTED_KEY_LEGEND, type KeyLegendEntry } from '../mock_data/key_legend_per_page';

/**
 * The key legend for the Join Rejected screen.
 */
export const JOIN_REJECTED_PAGE_KEY_LEGEND: readonly KeyLegendEntry[] = JOIN_REJECTED_KEY_LEGEND;

/**
 * Whether a keydown event should return to Home to try again.
 *
 * @param event - The keyboard event to inspect.
 * @returns True when the player should be sent back to Home.
 */
export function isJoinRejectedRetryKey(event: KeyboardEvent): boolean {
  return event.key === 'Enter';
}
