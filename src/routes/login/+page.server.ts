import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getAuthUserFromCookie } from '$lib/auth';

export function load({ cookies }) {
	const user = getAuthUserFromCookie(cookies.get('alicorn_user'));
	if (user) redirect(302, '/chat');
	return {};
}

export const actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		if (!name) {
			return { message: '이름을 입력하세요.' };
		}
		const user = { id: `user_${Date.now()}`, name };
		cookies.set('alicorn_user', JSON.stringify(user), {
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
			httpOnly: true,
			sameSite: 'lax'
		});
		redirect(302, '/chat');
	}
} satisfies Actions;
