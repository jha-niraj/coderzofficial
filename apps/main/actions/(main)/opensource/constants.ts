// Opensource constants - NOT a server action file
// These constants need to be accessible on the client side

export const PROJECT_TYPES = [
    { value: 'ALL', label: 'All Projects', icon: '🎯' },
    { value: 'FREE', label: 'Free', icon: '🆓', description: 'Community learning projects' },
    { value: 'PAID', label: 'Paid', icon: '💰', description: 'Bounty projects from companies' },
    { value: 'EXCLUSIVE', label: 'Exclusive', icon: '⭐', description: 'Premium invite-only' },
] as const

export const DIFFICULTY_LEVELS = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'GOOD_FIRST_ISSUE', label: '🌱 Good First Issue', color: 'green' },
    { value: 'EASY', label: '🟢 Easy', color: 'emerald' },
    { value: 'MEDIUM', label: '🟡 Medium', color: 'yellow' },
    { value: 'HARD', label: '🔴 Hard', color: 'red' },
    { value: 'EXPERT', label: '⚫ Expert', color: 'purple' },
] as const

export type ProjectType = typeof PROJECT_TYPES[number]['value']
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]['value']
