import type { RequestHandler } from './$types';
import { mockApi } from '$lib/api/mock';

export const POST: RequestHandler = async ({ params }) => {
	mockApi.markRoomAsRead(params.roomId);
	return new Response(null, { status: 204 });
};
