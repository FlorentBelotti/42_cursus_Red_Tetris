import type { RoomLobbySamplePlayer } from '../../mock_data/room_lobby_sample_players';
import type { KeyboardPromptState } from '../ui/keyboard_prompt_view';
import { PanelView } from '../ui/panel_view';
import { PlayerTableView } from './player_table_view';
import { HostStartButtonView } from './host_start_button_view';
import styles from './room_lobby_view.module.css';

export type RoomLobbyViewProps = {
  readonly players: readonly RoomLobbySamplePlayer[];
  readonly startPromptText: string;
  readonly startPromptState: KeyboardPromptState;
};

/**
 * The Room Lobby screen: the player table and the (host-only) start prompt.
 *
 * @param props - The current player list and the resolved start prompt.
 */
export function RoomLobbyView(props: RoomLobbyViewProps): JSX.Element {
  return (
    <div className={styles.lobby}>
      <div className={styles.label}>WAITING ROOM</div>
      <div className={styles.panelWidth}>
        <PanelView>
          <PlayerTableView players={props.players} />
        </PanelView>
      </div>
      <HostStartButtonView text={props.startPromptText} state={props.startPromptState} />
    </div>
  );
}
