import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (session) redirect(302, '/chat');
	return {};
};

export const actions = {
	login: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim();
		const password = (data.get('password') as string) ?? '';

		if (!email) {
			return fail(400, { message: '이메일을 입력하세요.' });
		}
		if (!password) {
			return fail(400, { message: '비밀번호를 입력하세요.' });
		}

		const { error } = await supabase.auth.signInWithPassword({ email, password });

		if (error) {
			if (error.message.includes('Invalid login')) {
				return fail(401, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
			}
			return fail(500, { message: error.message || '로그인에 실패했습니다.' });
		}

		redirect(302, '/chat');
	},
	signup: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim();
		const password = (data.get('password') as string) ?? '';
		const name = (data.get('name') as string)?.trim();

		if (!email) {
			return fail(400, { message: '이메일을 입력하세요.' });
		}
		if (!password || password.length < 6) {
			return fail(400, { message: '비밀번호는 6자 이상이어야 합니다.' });
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: { data: { full_name: name || email.split('@')[0] } }
		});

		if (error) {
			const raw = typeof error.message === 'string' ? error.message : JSON.stringify(error.message ?? error);
			if (raw.includes('email rate limit exceeded') || raw.includes('rate limit')) {
				return fail(429, {
					message: '이메일 발송 한도를 초과했습니다. 잠시 후(몇 분~몇 시간) 다시 시도해 주세요.'
				});
			}
			return fail(500, { message: raw || '회원가입에 실패했습니다.' });
		}

		// 이메일 확인이 필요할 수 있음 (Supabase 설정에 따름)
		return { message: '가입 완료. 이메일 확인이 필요하면 메일을 확인해 주세요.' };
	}
} satisfies Actions;
