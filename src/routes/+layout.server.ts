import type { LayoutServerLoad } from './$types';
import { authUserFromSupabase } from '$lib/auth';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();
	return { session, user, authUser: authUserFromSupabase(user) };
};
