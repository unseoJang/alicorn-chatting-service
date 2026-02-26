/**
 * 표시용 포맷 유틸
 */

/** URL을 클릭 가능한 링크 HTML로 */
export function linkify(text: string): string {
	const urlPattern = /(https?:\/\/[^\s<]+)/g;
	return text.replace(
		urlPattern,
		(url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
	);
}

/** 메시지 시간 표시 (HH:MM) */
export function formatMessageTime(createdAt: string): string {
	return new Date(createdAt).toLocaleTimeString('ko-KR', {
		hour: '2-digit',
		minute: '2-digit'
	});
}
