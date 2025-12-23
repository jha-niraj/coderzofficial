import { useEffect, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useUser } from '@clerk/nextjs';

export const useAutoRefreshCredits = () => {
	const { fetchCredits } = useUserStore();
	const { user } = useUser();
	const lastRefreshRef = useRef<number>(0);

	useEffect(() => {
		if (!user) return;

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				// Only refresh if it's been more than 30 seconds since last refresh
				const now = Date.now();
				if (now - lastRefreshRef.current > 30000) {
					fetchCredits();
					lastRefreshRef.current = now;
				}
			}
		};

		const handleFocus = () => {
			const now = Date.now();
			if (now - lastRefreshRef.current > 30000) {
				fetchCredits();
				lastRefreshRef.current = now;
			}
		};

		// Refresh credits when page becomes visible or window gains focus
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', handleFocus);

		// Initial fetch
		fetchCredits();
		lastRefreshRef.current = Date.now();

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('focus', handleFocus);
		};
	}, [user, fetchCredits]);
}; 