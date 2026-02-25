import type { User } from '@supabase/supabase-js';

/**
 * 앱에서 사용하는 인증 사용자 타입 (Supabase User와 호환)
 */
export interface AuthUser {
	id: string;
	name: string;
}

/** Supabase User → AuthUser (표시 이름: user_metadata > email) */
export function authUserFromSupabase(user: User | null): AuthUser | null {
	if (!user) return null;
	const name =
		(user.user_metadata?.full_name as string) ||
		(user.user_metadata?.name as string) ||
		user.email?.split('@')[0] ||
		user.id.slice(0, 8);
	return { id: user.id, name };
}

/** @deprecated Supabase 연동 후 쿠키 기반 미사용. authUserFromSupabase 사용 */
export function getAuthUserFromCookie(cookieValue: string | undefined): AuthUser | null {
	if (!cookieValue) return null;
	try {
		const parsed = JSON.parse(cookieValue) as AuthUser;
		return parsed?.id && parsed?.name ? parsed : null;
	} catch {
		return null;
	}
}
