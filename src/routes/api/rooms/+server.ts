import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockApi } from '$lib/api/mock';

export const GET: RequestHandler = async () => {
	const rooms = await mockApi.getRooms();
	return json(rooms);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const partnerId = typeof body?.partnerId === 'string' ? body.partnerId : null;
	if (!partnerId) {
		return json({ message: 'partnerId is required' }, { status: 400 });
	}
	const room = await mockApi.createRoom(partnerId);
	return json(room);
};
