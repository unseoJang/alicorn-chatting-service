/**
 * 프로덕션: SvelteKit + Socket.io 한 서버
 * 빌드 후 실행: node server/index.js
 */
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { handler } from '../build/handler.js';
import { attachSocketHandlers } from './socket-handlers.js';

const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer((req, res) => {
	if (req.url?.startsWith('/socket.io')) return;
	handler(req, res, () => {});
});

const io = new Server(httpServer, {
	cors: { origin: true }
});

attachSocketHandlers(io);

httpServer.listen(PORT, () => {
	console.log(`Server with Socket.io on http://localhost:${PORT}`);
});
