import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAuthUserFromCookie } from '$lib/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = getAuthUserFromCookie(cookies.get('alicorn_user'));
	if (user) redirect(302, '/chat');
	redirect(302, '/login');
};
