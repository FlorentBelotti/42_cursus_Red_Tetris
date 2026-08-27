import styles from './block_cursor_view.module.css';

export function BlockCursorView(): JSX.Element {
  return <span className={styles.cursor}>█</span>;
}
