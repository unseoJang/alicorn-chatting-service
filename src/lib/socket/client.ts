/**
 * Socket.io 연결 (단일 인스턴스)
 * 개발: PUBLIC_SOCKET_URL (예: http://localhost:3001)
 * 프로덕션: 미설정 시 현재 origin 사용
 */
import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

let socket: ReturnType<typeof io> | null = null;

/** 데모 등에서 Socket 서버가 없을 때 true. 연결 실패 시 알림용 */
export const socketUnavailable = writable(false);

function getSocketUrl(): string {
	if (!browser) return '';
	const url = env.PUBLIC_SOCKET_URL;
	if (url) return url;
	return window.location.origin;
}

function attachConnectionHandlers(s: ReturnType<typeof io>) {
	s.on('connect', () => socketUnavailable.set(false));
	s.on('connect_error', () => socketUnavailable.set(true));
}

export function getSocket(): ReturnType<typeof io> | null {
	if (!browser) return null;
	const url = getSocketUrl();
	if (!url) return null;
	if (!socket) {
		socket = io(url, { path: '/socket.io', autoConnect: true });
		attachConnectionHandlers(socket);
	}
	return socket;
}

export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
