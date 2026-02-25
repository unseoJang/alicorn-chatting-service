import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ parent }) => {
	const { session, authUser } = await parent();
	if (!session || !authUser) redirect(302, '/login');
	return { user: authUser };
};
