/**
 * 인증 유틸 (쿠키 기반, 백엔드 미구현 시 mock)
 */

export interface AuthUser {
	id: string;
	name: string;
}

/** 서버: cookies.get('alicorn_user') 값으로 사용 */
export function getAuthUserFromCookie(cookieValue: string | undefined): AuthUser | null {
	if (!cookieValue) return null;
	try {
		const parsed = JSON.parse(cookieValue) as AuthUser;
		return parsed?.id && parsed?.name ? parsed : null;
	} catch {
		return null;
	}
}
