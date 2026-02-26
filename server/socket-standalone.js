/**
 * 개발용 Socket.io 전용 서버 (Vite와 별도 포트)
 * 사용: pnpm run dev:socket
 */
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { attachSocketHandlers } from './socket-handlers.js';

const PORT = Number(process.env.SOCKET_PORT) || 3001;
const httpServer = createServer();

const io = new Server(httpServer, {
	cors: {
		origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
		methods: ['GET', 'POST']
	}
});

attachSocketHandlers(io);

httpServer.listen(PORT, () => {
	console.log(`[Socket.io] Dev server on http://localhost:${PORT}`);
});
