import { env } from '$env/dynamic/public';
import { createBrowserClient } from '@supabase/ssr';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends }) => {
	depends('supabase:auth');

	const url = env.PUBLIC_SUPABASE_URL ?? '';
	const key = env.PUBLIC_SUPABASE_ANON_KEY ?? '';
	const supabase = browser ? createBrowserClient(url, key) : null;

	return {
		supabase,
		session: data.session,
		user: data.user
	};
};
