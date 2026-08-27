import { useParams } from 'react-router-dom';

export type RoomUrlParameters = {
  readonly room: string;
  readonly playerName: string;
};

/**
 * Reads the room name and player name from the current URL
 * (`/:room/:playerName`, C6). Throws if mounted outside that route, since
 * that would be a routing bug, not a runtime condition to recover from.
 *
 * @returns The room name and player name from the URL.
 */
export function useRoomUrlParameters(): RoomUrlParameters {
  const params = useParams<{ room: string; playerName: string }>();

  if (params.room === undefined || params.playerName === undefined) {
    throw new Error('useRoomUrlParameters must be used within the "/:room/:playerName" route');
  }

  return { room: params.room, playerName: params.playerName };
}
