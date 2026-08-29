import type { PlayerPublicState, SpectrumColumnHeights } from 'shared';

import styles from './player_data_console_view.module.css';

export type PlayerDataConsoleViewProps = {
  readonly players: readonly PlayerPublicState[];
  readonly localPlayerId: string | null;
  readonly linesClearedCount: number;
  readonly penaltyLinesSentCount: number;
  readonly opponentSpectrums: Record<string, SpectrumColumnHeights>;
};

function renderPlayerRow(
  player: PlayerPublicState,
  props: PlayerDataConsoleViewProps,
): JSX.Element {
  if (player.playerId === props.localPlayerId) {
    return (
      <div className={`${styles.row} ${styles.self}`}>
        YOU {player.playerName} LINES {props.linesClearedCount} SENT {props.penaltyLinesSentCount}
      </div>
    );
  }

  const statusLabel = player.isAlive ? 'ALIVE' : 'DEAD';
  const spectrum = props.opponentSpectrums[player.playerId] ?? [];
  let rowClassName = styles.row ?? '';
  if (player.isAlive === false) {
    rowClassName = `${styles.row} ${styles.dead}`;
  }

  return (
    <div className={rowClassName}>
      {player.playerName} {statusLabel} H:{spectrum.join(' ')}
    </div>
  );
}

export function PlayerDataConsoleView(props: PlayerDataConsoleViewProps): JSX.Element {
  return (
    <div className={styles.console}>
      <div className={styles.heading}>PLAYER DATA</div>
      {props.players.map((player) => (
        <div key={player.playerId}>{renderPlayerRow(player, props)}</div>
      ))}
    </div>
  );
}
