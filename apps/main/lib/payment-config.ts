/**
 * Payment Configuration
 * Centralized pricing configuration for credit packages
 * Easy to update pricing without changing code throughout the app
 */

export interface CreditPackage {
	credits: number;
	inr: number;
	usd: number;
	originalInr?: number;
	originalUsd?: number;
	note: string;
	popular?: boolean;
	badge: string;
	savings?: string;
	color: string;
}

export interface PricingConfig {
	baseRateINR: number;
	baseRateUSD: number;
	packages: CreditPackage[];
	minCredits: number;
	maxCredits: number;
}

// Base rates for custom credit calculations
const baseRateINR = 0.5; // Price per credit in INR
const baseRateUSD = 0.006; // Price per credit in USD

// Credit packages with pricing
export const creditPackages: CreditPackage[] = [
    {
		credits: 20,
		inr: 1,
		usd: 0.012,
		originalInr: 15,
		originalUsd: 0.015,
		note: "Perfect for trying premium features",
		popular: false,
		badge: "Free",
		savings: "20%",
		color: "from-blue-500/80 to-indigo-600/80"
	},	
	{
		credits: 25,
		inr: 12,
		usd: 0.15,
		originalInr: 15,
		originalUsd: 0.18,
		note: "Perfect for trying premium features",
		popular: false,
		badge: "Starter",
		savings: "20%",
		color: "from-blue-500/80 to-indigo-600/80"
	},
	{
		credits: 50,
		inr: 22,
		usd: 0.27,
		originalInr: 30,
		originalUsd: 0.36,
		note: "Best value for regular users",
		popular: true,
		badge: "Most Popular",
		savings: "27%",
		color: "from-emerald-500/80 to-teal-600/80"
	},
	{
		credits: 75,
		inr: 30,
		usd: 0.36,
		originalInr: 45,
		originalUsd: 0.54,
		note: "Great for active learners",
		popular: false,
		badge: "Pro",
		savings: "33%",
		color: "from-purple-500/80 to-violet-600/80"
	},
	{
		credits: 100,
		inr: 35,
		usd: 0.42,
		originalInr: 60,
		originalUsd: 0.72,
		note: "Maximum credits package",
		popular: false,
		badge: "Max",
		savings: "42%",
		color: "from-orange-500/80 to-red-500/80"
	},
];

export const paymentConfig: PricingConfig = {
	baseRateINR,
	baseRateUSD,
	packages: creditPackages,
	minCredits: 20,
	maxCredits: 1000,
};

/**
 * Calculate price for custom credit amount
 */
export function calculatePrice(credits: number, currency: 'INR' | 'USD'): number {
	const rate = currency === 'INR' ? baseRateINR : baseRateUSD;
	return Math.round(credits * rate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get package by credits amount
 */
export function getPackageByCredits(credits: number): CreditPackage | null {
	return creditPackages.find(pkg => pkg.credits === credits) || null;
}

/**
 * Convert amount to paise (for Razorpay - INR uses paise)
 */
export function convertToPaise(amount: number, currency: 'INR' | 'USD'): number {
	if (currency === 'INR') {
		return Math.round(amount * 100); // Convert rupees to paise
	}
	// For USD, convert to cents (if needed) or keep as is based on Razorpay requirements
	return Math.round(amount * 100);
}