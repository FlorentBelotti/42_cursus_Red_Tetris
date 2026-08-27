import { JOIN_REJECTED_KEY_LEGEND, type KeyLegendEntry } from '../mock_data/key_legend_per_page';

export const JOIN_REJECTED_PAGE_KEY_LEGEND: readonly KeyLegendEntry[] = JOIN_REJECTED_KEY_LEGEND;

export function isJoinRejectedRetryKey(event: KeyboardEvent): boolean {
  return event.key === 'Enter';
}
