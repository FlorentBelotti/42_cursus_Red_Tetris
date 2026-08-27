import styles from './block_cursor_view.module.css';

/**
 * The blinking block cursor glyph, used wherever a keyboard input or action
 * is expected. Rendered conditionally by callers — never hidden with
 * `opacity`, since the blink animation would fight a hidden state.
 */
export function BlockCursorView(): JSX.Element {
  return <span className={styles.cursor}>█</span>;
}
