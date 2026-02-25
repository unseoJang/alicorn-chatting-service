import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getAuthUserFromCookie } from '$lib/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = getAuthUserFromCookie(cookies.get('alicorn_user'));
	if (!user) redirect(302, '/login');
	return { user };
};
