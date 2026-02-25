import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockApi } from '$lib/api/mock';

export const GET: RequestHandler = async ({ params }) => {
	const messages = await mockApi.getMessages(params.roomId);
	return json(messages);
};
