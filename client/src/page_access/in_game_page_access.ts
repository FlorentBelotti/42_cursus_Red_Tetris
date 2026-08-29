import { IN_GAME_KEY_LEGEND, type KeyLegendEntry } from '../mock_data/key_legend_per_page';

export const IN_GAME_PAGE_KEY_LEGEND: readonly KeyLegendEntry[] = IN_GAME_KEY_LEGEND;

export function isInGameLeaveKey(event: KeyboardEvent): boolean {
  return event.key === 'Escape';
}
