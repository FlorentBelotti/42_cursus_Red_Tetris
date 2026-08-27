import type { KeyLegendEntry } from '../../mock_data/key_legend_per_page';
import styles from './key_legend_view.module.css';

export type KeyLegendViewProps = {
  readonly legend: readonly KeyLegendEntry[];
};

/**
 * The single-line key legend pinned to the bottom of every screen. Never
 * wraps, never scrolls — it changes per page (see page_access/).
 *
 * @param props - The key legend entries for the current screen.
 */
export function KeyLegendView(props: KeyLegendViewProps): JSX.Element {
  return (
    <div className={styles.legend}>
      {props.legend.map((entry) => (
        <span key={entry.key}>
          <span className={styles.key}>{entry.key}</span> = {entry.label}
        </span>
      ))}
    </div>
  );
}
