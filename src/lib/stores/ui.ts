import { writable } from 'svelte/store';

/** 사이드바 열림 여부 (여러 컴포넌트에서 공유할 때 스토어 사용) */
export const sidebarOpen = writable(true);

/** 스토어 예: 카운터 (필요 없으면 삭제해도 됨) */
export const count = writable(0);
