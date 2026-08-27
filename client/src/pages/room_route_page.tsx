import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicationShell } from '../components/layout/application_shell';
import { RoomLobbyView } from '../components/room/room_lobby_view';
import { NextPiecePreviewView } from '../components/board/next_piece_preview_view';
import { StatsPanelView } from '../components/board/stats_panel_view';
import { PlayerBoardGridView } from '../components/board/player_board_grid_view';
import { OpponentSpectrumListView } from '../components/opponents/opponent_spectrum_list_view';
import { GameOverOverlayView } from '../components/feedback/game_over_overlay_view';
import { useKeyboardInputBindings, type KeyboardInputHandler } from '../hooks/use_keyboard_input_bindings';
import { useRoomUrlParameters } from '../hooks/use_room_url_parameters';
import { ROOM_LOBBY_SAMPLE_PLAYERS } from '../mock_data/room_lobby_sample_players';
import { NEXT_PIECE_PREVIEW_CELLS } from '../mock_data/next_piece_preview_sample';
import { PLACEHOLDER_BOARD_CELLS } from '../mock_data/placeholder_board_state';
import { PLACEHOLDER_LINES_CLEARED_COUNT, PLACEHOLDER_PENALTY_LINES_SENT_COUNT } from '../mock_data/placeholder_round_stats';
import { OPPONENT_SPECTRUM_SAMPLES } from '../mock_data/opponent_spectrum_sample_data';
import { PLACEHOLDER_ROUND_WINNER_NAME } from '../mock_data/game_over_outcome_sample';
import {
  isRoomLobbyLeaveKey,
  isRoomLobbyStartGameKey,
  resolveRoomLobbyKeyLegend,
  resolveRoomLobbyPrompt,
} from '../page_access/room_lobby_page_access';
import { IN_GAME_PAGE_KEY_LEGEND, isInGameLeaveKey, isInGameRoundOverShortcutKey } from '../page_access/in_game_page_access';
import {
  isRoundOverBackToLobbyKey,
  isRoundOverRestartKey,
  resolveRoundOverKeyLegend,
  resolveRoundOverOverlayContent,
} from '../page_access/round_over_page_access';
import styles from './room_route_page.module.css';

type RoundStatus = 'waiting' | 'running' | 'finished';

/**
 * Reads the `?host=0` dev-only query parameter used to preview the
 * non-host key legend and prompts without real room membership. Defaults to
 * host, matching design_handoff_red_tetris/02 Room Lobby.dc.html.
 *
 * @param hostQueryValue - The raw "host" query parameter value, if present.
 * @returns Whether the local player should be treated as host.
 */
function resolveIsHostFromQueryParameter(hostQueryValue: string | null): boolean {
  if (hostQueryValue === '0') {
    return false;
  }

  return true;
}

/**
 * The room route (`/:room/:playerName`). Owns the waiting/running/finished
 * state machine described in PROMPT.md — three of the five screens are
 * states here, not separate URLs.
 */
export function RoomRoutePage(): JSX.Element {
  const { room, playerName } = useRoomUrlParameters();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHost = resolveIsHostFromQueryParameter(searchParams.get('host'));
  const [roundStatus, setRoundStatus] = useState<RoundStatus>('waiting');

  const handleKeyDown: KeyboardInputHandler = useCallback(
    (event) => {
      if (roundStatus === 'waiting') {
        if (isRoomLobbyStartGameKey(event, isHost)) {
          setRoundStatus('running');
          return true;
        }
        if (isRoomLobbyLeaveKey(event)) {
          navigate('/');
          return true;
        }
        return false;
      }

      if (roundStatus === 'running') {
        if (isInGameRoundOverShortcutKey(event)) {
          setRoundStatus('finished');
          return true;
        }
        if (isInGameLeaveKey(event)) {
          navigate('/');
          return true;
        }
        return false;
      }

      if (isRoundOverRestartKey(event, isHost)) {
        setRoundStatus('running');
        return true;
      }
      if (isRoundOverBackToLobbyKey(event)) {
        setRoundStatus('waiting');
        return true;
      }
      return false;
    },
    [roundStatus, isHost, navigate],
  );

  useKeyboardInputBindings(handleKeyDown);

  if (roundStatus === 'waiting') {
    const startPrompt = resolveRoomLobbyPrompt(isHost);

    return (
      <ApplicationShell
        room={room}
        playerName={playerName}
        socketStatus="CONNECTED"
        legend={resolveRoomLobbyKeyLegend(isHost)}
      >
        <RoomLobbyView
          players={ROOM_LOBBY_SAMPLE_PLAYERS}
          startPromptText={startPrompt.text}
          startPromptState={startPrompt.state}
        />
      </ApplicationShell>
    );
  }

  let overlayElement = null;
  let legend = IN_GAME_PAGE_KEY_LEGEND;

  if (roundStatus === 'finished') {
    legend = resolveRoundOverKeyLegend(isHost);
    const overlayContent = resolveRoundOverOverlayContent(isHost, playerName, PLACEHOLDER_ROUND_WINNER_NAME);
    overlayElement = (
      <GameOverOverlayView
        title={overlayContent.title}
        subtitle={overlayContent.subtitle}
        restartPromptText={overlayContent.restartPrompt.text}
        restartPromptState={overlayContent.restartPrompt.state}
      />
    );
  }

  return (
    <ApplicationShell room={room} playerName={playerName} socketStatus="CONNECTED" legend={legend}>
      <div className={styles.body}>
        <div className={styles.gameGrid}>
          <div className={styles.aside}>
            <NextPiecePreviewView cells={NEXT_PIECE_PREVIEW_CELLS} />
            <StatsPanelView
              linesClearedCount={PLACEHOLDER_LINES_CLEARED_COUNT}
              penaltyLinesSentCount={PLACEHOLDER_PENALTY_LINES_SENT_COUNT}
            />
          </div>

          <PlayerBoardGridView cells={PLACEHOLDER_BOARD_CELLS} />

          <div className={styles.opponentsColumn}>
            <OpponentSpectrumListView opponents={OPPONENT_SPECTRUM_SAMPLES} />
          </div>
        </div>

        {overlayElement}
      </div>
    </ApplicationShell>
  );
}
