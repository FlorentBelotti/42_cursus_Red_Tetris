import { PanelView } from '../ui/panel_view';
import styles from './join_rejected_view.module.css';

export type JoinRejectedViewProps = {
  readonly displayCode: string;
  readonly explanation: string;
};

export function JoinRejectedView(props: JoinRejectedViewProps): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <PanelView title="JOIN REJECTED" variant="alert">
        <div className={styles.content}>
          <div className={styles.code}>{props.displayCode}</div>
          <div className={styles.explanation}>{props.explanation}</div>
        </div>
      </PanelView>
    </div>
  );
}
