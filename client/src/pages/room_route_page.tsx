import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlayerPublicState } from 'shared';

import { ApplicationShell } from '../components/layout/application_shell';
import { RoomLobbyView } from '../components/room/room_lobby_view';
import { PlayerBoardGridView } from '../components/board/player_board_grid_view';
import { PlayerDataConsoleView } from '../components/room/player_data_console_view';
import { GameOverOverlayView } from '../components/feedback/game_over_overlay_view';
import { JoinRejectedView } from '../components/feedback/join_rejected_view';
import { KeyboardPromptView } from '../components/ui/keyboard_prompt_view';
import { projectBoardForDisplay } from '../game_engine/board_display_projection';
import { useKeyboardInputBindings, type KeyboardInputHandler } from '../hooks/use_keyboard_input_bindings';
import { useGravityIntervalTicker } from '../hooks/use_gravity_interval_ticker';
import { useRoomUrlParameters } from '../hooks/use_room_url_parameters';
import { requestGameStart, requestRoomJoin, requestRoomLeave } from '../network/socket_redux_middleware';
import { resolveJoinRejectedReasonMessage } from '../mock_data/join_rejected_reason_messages';
import { JOIN_REJECTED_PAGE_KEY_LEGEND, isJoinRejectedRetryKey } from '../page_access/join_rejected_page_access';
import { IN_GAME_PAGE_KEY_LEGEND, isInGameLeaveKey } from '../page_access/in_game_page_access';
import {
  isRoomLobbyLeaveKey,
  isRoomLobbyStartGameKey,
  resolveRoomLobbyKeyLegend,
  resolveRoomLobbyPrompt,
} from '../page_access/room_lobby_page_access';
import {
  isRoundOverBackToLobbyKey,
  isRoundOverRestartKey,
  resolveRoundOverKeyLegend,
  resolveRoundOverOverlayContent,
} from '../page_access/round_over_page_access';
import { localGameActions } from '../state/slices/local_game_slice';
import { roomMembershipActions } from '../state/slices/room_membership_slice';
import { useAppDispatch, useAppSelector } from '../state/redux_store_configuration';
import styles from './room_route_page.module.css';

function findPlayerNameById(players: readonly PlayerPublicState[], playerId: string | null): string | null {
  const found = players.find((player) => player.playerId === playerId);
  return found === undefined ? null : found.playerName;
}

export function RoomRoutePage(): JSX.Element {
  const { room, playerName } = useRoomUrlParameters();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const roomMembership = useAppSelector((state) => state.roomMembership);
  const localGame = useAppSelector((state) => state.localGame);

  useEffect(() => {
    dispatch(requestRoomJoin({ roomName: room, playerName }));

    return () => {
      dispatch(requestRoomLeave());
      dispatch(roomMembershipActions.left());
    };
  }, [dispatch, room, playerName]);

  const isHost = roomMembership.roomState !== null && roomMembership.roomState.hostPlayerId === roomMembership.localPlayerId;
  const roundStatus = roomMembership.roomState?.status ?? 'waiting';

  const handleKeyDown: KeyboardInputHandler = useCallback(
    (event) => {
      if (roomMembership.rejectionReason !== null) {
        if (isJoinRejectedRetryKey(event)) {
          navigate('/');
          return true;
        }
        return false;
      }

      if (roundStatus === 'waiting') {
        if (isRoomLobbyStartGameKey(event, isHost)) {
          dispatch(requestGameStart());
          return true;
        }
        if (isRoomLobbyLeaveKey(event)) {
          navigate('/');
          return true;
        }
        return false;
      }

      if (roundStatus === 'running') {
        if (event.key === 'ArrowLeft') {
          dispatch(localGameActions.movedLeft());
          return true;
        }
        if (event.key === 'ArrowRight') {
          dispatch(localGameActions.movedRight());
          return true;
        }
        if (event.key === 'ArrowUp') {
          dispatch(localGameActions.rotated());
          return true;
        }
        if (event.key === 'ArrowDown') {
          dispatch(localGameActions.gravityTicked());
          return true;
        }
        if (event.key === ' ') {
          dispatch(localGameActions.hardDropped());
          return true;
        }
        if (isInGameLeaveKey(event)) {
          navigate('/');
          return true;
        }
        return false;
      }

      if (isRoundOverRestartKey(event, isHost)) {
        dispatch(requestGameStart());
        return true;
      }
      if (isRoundOverBackToLobbyKey(event)) {
        navigate('/');
        return true;
      }
      return false;
    },
    [dispatch, navigate, roomMembership.rejectionReason, roundStatus, isHost],
  );

  useKeyboardInputBindings(handleKeyDown);

  const onGravityTick = useCallback(() => {
    dispatch(localGameActions.gravityTicked());
  }, [dispatch]);
  useGravityIntervalTicker(roundStatus === 'running' && localGame.isGameOver === false, onGravityTick);

  if (roomMembership.rejectionReason !== null) {
    const reasonMessage = resolveJoinRejectedReasonMessage(roomMembership.rejectionReason);

    return (
      <ApplicationShell room={room} playerName={playerName} socketStatus="LINK LOST" legend={JOIN_REJECTED_PAGE_KEY_LEGEND}>
        <div className={styles.body}>
          <JoinRejectedView displayCode={reasonMessage.displayCode} explanation={reasonMessage.explanation} />
          <KeyboardPromptView text="> PRESS [ENTER] TO TRY AGAIN" state="active" cursor />
        </div>
      </ApplicationShell>
    );
  }

  if (roomMembership.roomState === null) {
    return (
      <ApplicationShell room={room} playerName={playerName} socketStatus="CONNECTING" legend={[]}>
        <div className={styles.body}>CONNECTING...</div>
      </ApplicationShell>
    );
  }

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
          players={roomMembership.roomState.players}
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
    const winnerName = findPlayerNameById(roomMembership.roomState.players, roomMembership.lastRoundWinnerPlayerId);
    const overlayContent = resolveRoundOverOverlayContent(isHost, playerName, winnerName);
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
          <PlayerBoardGridView cells={projectBoardForDisplay(localGame.board, localGame.activePiece)} />

          <PlayerDataConsoleView
            players={roomMembership.roomState.players}
            localPlayerId={roomMembership.localPlayerId}
            linesClearedCount={localGame.linesClearedCount}
            penaltyLinesSentCount={localGame.penaltyLinesSentCount}
            opponentSpectrums={roomMembership.opponentSpectrums}
          />
        </div>

        {overlayElement}
      </div>
    </ApplicationShell>
  );
}
