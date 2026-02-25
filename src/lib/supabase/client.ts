import { env } from '$env/dynamic/public';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
	const url = env.PUBLIC_SUPABASE_URL ?? '';
	const key = env.PUBLIC_SUPABASE_ANON_KEY ?? '';
	return createBrowserClient(url, key);
}
