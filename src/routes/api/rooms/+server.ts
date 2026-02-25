import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockApi } from '$lib/api/mock';

export const GET: RequestHandler = async () => {
	const rooms = await mockApi.getRooms();
	return json(rooms);
};
