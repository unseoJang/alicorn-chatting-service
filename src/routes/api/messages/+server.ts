import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockApi } from '$lib/api/mock';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json() as { roomId: string; content: string };
	if (!body.roomId || typeof body.content !== 'string') {
		return json({ message: 'roomId and content required' }, { status: 400 });
	}
	const message = await mockApi.sendMessage(body.roomId, body.content);
	return json(message);
};
