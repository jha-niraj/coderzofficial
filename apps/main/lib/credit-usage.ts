export type UsageRange = { min: number; max: number };

export interface SectionUsageConfig {
	key: 'projects' | 'aiInterview' | 'bugHunter' | 'mock';
	title: string;
	description: string;
	// Private usage cost in credits (range allowed)
	privateCost: UsageRange;
	// Public cost is a multiplier of private
	publicMultiplier: number; // e.g., 0.5 for half
	icon?: string; // emoji or icon name for UI
	badge?: string;
}

export interface UsageSummaryItem {
	key: SectionUsageConfig['key'];
	title: string;
	privateCount: UsageRange; // how many can be done with given credits
	publicCount: UsageRange;
	description: string;
	icon?: string;
	badge?: string;
}

export const creditUsageConfig: SectionUsageConfig[] = [
	{
		key: 'projects',
		title: 'Projects',
		description: 'Spin up private or public projects powered by AI.',
		privateCost: { min: 50, max: 60 },
		publicMultiplier: 0.5,
		icon: '🧩',
		badge: 'Build'
	},
	{
		key: 'aiInterview',
		title: 'AI Job Interview',
		description: 'Practice structured AI interviews with dynamic difficulty.',
		privateCost: { min: 50, max: 100 },
		publicMultiplier: 0.5,
		icon: '🎤',
		badge: 'Practice'
	},
	{
		key: 'bugHunter',
		title: 'Bug Hunter',
		description: 'Compete in debugging challenges and sharpen problem-solving.',
		privateCost: { min: 50, max: 60 },
		publicMultiplier: 0.5,
		icon: '🕵️‍♂️',
		badge: 'Challenge'
	},
	{
		key: 'mock',
		title: 'Mock (Coming Soon)',
		description: 'Additional mock experiences are in the works.',
		privateCost: { min: 0, max: 0 },
		publicMultiplier: 1,
		icon: '🧪',
		badge: 'Soon'
	}
];

function floorSafe(value: number): number {
	return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function computeUsageForCredits(credits: number, sections: SectionUsageConfig[] = creditUsageConfig): UsageSummaryItem[] {
	return sections.map((section) => {
		const privateMinCount = section.privateCost.max > 0 ? floorSafe(credits / section.privateCost.max) : 0;
		const privateMaxCount = section.privateCost.min > 0 ? floorSafe(credits / section.privateCost.min) : 0;

		const publicMinCost = section.privateCost.max * section.publicMultiplier;
		const publicMaxCost = section.privateCost.min * section.publicMultiplier;

		const publicMinCount = publicMinCost > 0 ? floorSafe(credits / publicMinCost) : 0;
		const publicMaxCount = publicMaxCost > 0 ? floorSafe(credits / publicMaxCost) : 0;

		return {
			key: section.key,
			title: section.title,
			privateCount: { min: privateMinCount, max: privateMaxCount },
			publicCount: { min: publicMinCount, max: publicMaxCount },
			description: section.description,
			icon: section.icon,
			badge: section.badge,
		};
	});
}

export function formatCountRange(range: UsageRange): string {
	if (range.min === range.max) return `${range.min}`;
	return `${range.min}-${range.max}`;
}