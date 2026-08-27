import type { KeyLegendEntry } from '../../mock_data/key_legend_per_page';
import styles from './key_legend_view.module.css';

export type KeyLegendViewProps = {
  readonly legend: readonly KeyLegendEntry[];
};

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
