import type { ReactNode } from 'react';
import type { KeyLegendEntry } from '../../mock_data/key_legend_per_page';
import { KeyLegendView } from './key_legend_view';
import styles from './application_shell.module.css';

export type SocketConnectionStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'LINK LOST';

export type ApplicationShellProps = {
  readonly room: string;
  readonly playerName: string;
  readonly socketStatus: SocketConnectionStatus;
  readonly legend: readonly KeyLegendEntry[];
  readonly children: ReactNode;
};

/**
 * The persistent CRT/BIOS chrome wrapping every screen: header (room,
 * player, socket status), the screen's own content, the key legend, and the
 * non-interactive CRT overlay layers (scanlines, vignette, flicker) —
 * applied here once, never repeated per page.
 *
 * @param props - room name, player name, socket status, key legend, and the
 * screen content to render inside the shell's body.
 */
export function ApplicationShell(props: ApplicationShellProps): JSX.Element {
  return (
    <div className={styles.viewport}>
      <div className={styles.bezel}>
        <div className={styles.shell}>
          <div className={styles.header}>
            <span>
              RED TETRIS — ROOM <span className={styles.headerValue}>{props.room}</span>{' '}
              PLAYER <span className={styles.headerValue}>{props.playerName}</span>
            </span>
            <span className={styles.headerSocket}>SOCKET {props.socketStatus}</span>
          </div>

          <div className={styles.body}>{props.children}</div>

          <KeyLegendView legend={props.legend} />
        </div>

        <div className={`${styles.crtLayer} ${styles.scanlines}`} />
        <div className={`${styles.crtLayer} ${styles.vignette}`} />
        <div className={`${styles.crtLayer} ${styles.flicker}`} />
      </div>
    </div>
  );
}
