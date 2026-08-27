import { useParams } from 'react-router-dom';

export type RoomUrlParameters = {
  readonly room: string;
  readonly playerName: string;
};

export function useRoomUrlParameters(): RoomUrlParameters {
  const params = useParams<{ room: string; playerName: string }>();

  if (params.room === undefined || params.playerName === undefined) {
    throw new Error('useRoomUrlParameters must be used within the "/:room/:playerName" route');
  }

  return { room: params.room, playerName: params.playerName };
}
