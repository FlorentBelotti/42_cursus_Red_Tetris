import type { ReactNode } from 'react';
import styles from './panel_view.module.css';

export type PanelViewProps = {
  readonly title?: string;
  readonly variant?: 'default' | 'alert';
  readonly children: ReactNode;
};

export function PanelView(props: PanelViewProps): JSX.Element {
  let outerClassName = styles.panel;
  if (props.variant === 'alert') {
    outerClassName = `${styles.panel} ${styles.panelAlert}`;
  }

  let titleElement = null;
  if (props.title !== undefined) {
    titleElement = <div className={styles.title}>{props.title}</div>;
  }

  return (
    <div className={outerClassName}>
      <div className={styles.inner}>
        {titleElement}
        {props.children}
      </div>
    </div>
  );
}
