import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { mockApi } from '$lib/api/mock';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const users = await mockApi.searchUsers(q);
	return json(users);
};
