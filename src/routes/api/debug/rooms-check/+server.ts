/**
 * 방이 안 나올 때 원인 확인용. 로그인한 userId와 RLS 안내를 반환합니다.
 * 배포 시에는 이 라우트를 제거하거나 비활성화하세요.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user?.id) {
		return json(
			{ ok: false, reason: 'not_logged_in', message: '로그인이 필요합니다. /login에서 로그인 후 다시 시도하세요.' },
			{ status: 401 }
		);
	}
	return json({
		ok: true,
		userId: user.id,
		message: 'Supabase Table Editor → rooms에서 해당 방의 user_a 또는 user_b가 이 userId와 같은지 확인하세요.',
		rlsHint:
			'rooms에 user_a/user_b 컬럼이 있는데 방이 안 보이면, Supabase SQL Editor에서 아래 정책을 추가한 뒤 다시 시도하세요.',
		rlsSqlUserAUserB: `-- rooms에 user_a, user_b가 있을 때
create policy "rooms_select_own_ab" on public.rooms for select
  using (user_a = auth.uid() or user_b = auth.uid());`,
		rlsSqlUser1User2: `-- rooms에 user1, user2가 있을 때
create policy "rooms_select_own_u1u2" on public.rooms for select
  using (user1 = auth.uid() or user2 = auth.uid());`
	});
};
