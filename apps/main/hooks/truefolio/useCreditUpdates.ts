import { useUserStore } from '@/stores/userStore';
import { useCallback } from 'react';

export const useCreditUpdates = () => {
	const { updateCredits, setCredits, refreshCredits } = useUserStore();

	// Handle credit transfer completion
	const handleTransferSuccess = useCallback((newBalance: number) => {
		setCredits(newBalance);
	}, [setCredits]);

	// Handle credit deduction (when using features)
	const handleCreditDeduction = useCallback((amount: number) => {
		updateCredits(-amount);
	}, [updateCredits]);

	// Handle credit addition (manual or from transfers)
	const handleCreditAddition = useCallback((amount: number) => {
		updateCredits(amount);
	}, [updateCredits]);

	// Force refresh credits from server
	const handleRefreshCredits = useCallback(() => {
		refreshCredits();
	}, [refreshCredits]);

	return {
		handleTransferSuccess,
		handleCreditDeduction,
		handleCreditAddition,
		handleRefreshCredits
	};
}; 