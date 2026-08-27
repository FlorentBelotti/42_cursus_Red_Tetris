import { Routes, Route } from 'react-router-dom';
import { HomeTerminalPage } from './pages/home_terminal_page';
import { RoomRoutePage } from './pages/room_route_page';
import { JoinRejectedPreviewPage } from './pages/join_rejected_preview_page';

/**
 * The application's routes (C6). `/__preview/rejected` is a dev-only route
 * for inspecting the Join Rejected screen before the real
 * `room:join_rejected` socket event exists (see PROMPT.md pages §5).
 */
export function ApplicationRouter(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomeTerminalPage />} />
      <Route path="/__preview/rejected" element={<JoinRejectedPreviewPage />} />
      <Route path="/:room/:playerName" element={<RoomRoutePage />} />
    </Routes>
  );
}
