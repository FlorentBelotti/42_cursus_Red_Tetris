import { Fragment } from 'react';
import type { RoomLobbySamplePlayer } from '../../mock_data/room_lobby_sample_players';
import styles from './player_table_view.module.css';

export type PlayerTableViewProps = {
  readonly players: readonly RoomLobbySamplePlayer[];
};

function describePlayerRow(player: RoomLobbySamplePlayer): { role: string; cellClassName: string } {
  if (player.isHost) {
    return { role: 'HOST', cellClassName: `${styles.cell} ${styles.cellHost}` };
  }

  return { role: 'PLAYER', cellClassName: styles.cell ?? '' };
}

export function PlayerTableView(props: PlayerTableViewProps): JSX.Element {
  return (
    <div className={styles.table}>
      <span className={styles.headCell}>#</span>
      <span className={styles.headCell}>PLAYER</span>
      <span className={styles.headCell}>ROLE</span>

      {props.players.map((player, playerIndex) => {
        const { role, cellClassName } = describePlayerRow(player);
        const displayIndex = String(playerIndex + 1).padStart(2, '0');

        return (
          <Fragment key={player.playerName}>
            <span className={styles.headCell}>{displayIndex}</span>
            <span className={cellClassName}>{player.playerName}</span>
            <span className={cellClassName}>{role}</span>
          </Fragment>
        );
      })}
    </div>
  );
}
