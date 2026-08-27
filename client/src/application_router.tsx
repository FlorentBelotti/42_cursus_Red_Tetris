import { Routes, Route } from 'react-router-dom';
import { HomeTerminalPage } from './pages/home_terminal_page';
import { RoomRoutePage } from './pages/room_route_page';
import { JoinRejectedPreviewPage } from './pages/join_rejected_preview_page';

export function ApplicationRouter(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomeTerminalPage />} />
      <Route path="/__preview/rejected" element={<JoinRejectedPreviewPage />} />
      <Route path="/:room/:playerName" element={<RoomRoutePage />} />
    </Routes>
  );
}
