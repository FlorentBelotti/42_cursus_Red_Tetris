import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const SERVER_DEV_PORT = 3001;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: `http://localhost:${SERVER_DEV_PORT}`,
        ws: true,
      },
    },
  },
});
