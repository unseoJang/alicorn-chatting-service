/**
 * Socket.io 이벤트 핸들러 (dev/prod 공용)
 * @param {import('socket.io').Server} io
 */
export function attachSocketHandlers(io) {
	io.on('connection', (socket) => {
		socket.on('join', (roomId) => {
			if (roomId) socket.join('room:' + roomId);
		});

		socket.on('message', (data) => {
			const roomId = data?.roomId;
			const message = data?.message;
			if (roomId && message) {
				io.to('room:' + roomId).emit('message', message);
			}
		});
	});
}
