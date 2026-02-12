// Achievements Types - Centralized type definitions for the Achievements & Gamification system

// =========================================
// Enums
// =========================================

export type BadgeCategory =
    | 'PROJECTS'
    | 'ASSESSMENTS'
    | 'CHALLENGES'
    | 'MOCK_INTERVIEWS'
    | 'COMMUNITY'
    | 'CONCEPTS'
    | 'SPACES'
    | 'STUDIO'
    | 'OPENSOURCE'
    | 'PATHFINDER'
    | 'LAUNCHPADS'
    | 'COLLECTIVE'
    | 'PORTFOLIO'
    | 'CONSISTENCY'
    | 'SOCIAL'
    | 'MILESTONE'
    | 'SPECIAL'

export type BadgeRarity =
    | 'COMMON'
    | 'RARE'
    | 'EPIC'
    | 'LEGENDARY'
    | 'MYTHIC'

export type AchievementStatus =
    | 'LOCKED'
    | 'IN_PROGRESS'
    | 'READY_TO_CLAIM'
    | 'CLAIMED'

export type SocialProvider =
    | 'TWITTER'
    | 'LINKEDIN'

// =========================================
// Core Types
// =========================================

export interface Badge {
    id: string
    slug: string
    name: string
    description: string
    icon: string
    color: string
    bgGradient: string | null
    category: BadgeCategory
    rarity: BadgeRarity
    tier: number
    requirements: BadgeRequirements
    xpReward: number
    creditsReward: number
    order: number
    isActive: boolean
    isLimited: boolean
    expiresAt: Date | null
}

export interface BadgeWithProgress extends Badge {
    status: AchievementStatus
    progress: BadgeProgress | null
    progressPercent: number
    claimedAt: Date | null
    isPinned: boolean
}

export interface BadgeProgress {
    current: number
    target?: number
    items?: string[]
}

export interface BadgeRequirements {
    type: 'count' | 'score' | 'streak' | 'level' | 'xp' | 'combined' | 'single' | 'rank' | 'amount' | 'join_date' | 'category_completion'
    target?: string
    targets?: string[]
    count?: number
    counts?: number[]
    minScore?: number
    days?: number
    level?: number
    amount?: number
    maxRank?: number
    before?: string
    allCategories?: boolean
}

// =========================================
// User Badge Types
// =========================================

export interface UserBadge {
    id: string
    userId: string
    badgeId: string
    badge: Badge
    status: AchievementStatus
    progress: BadgeProgress | null
    progressPercent: number
    unlockedAt: Date | null
    completedAt: Date | null
    claimedAt: Date | null
    sharedToTwitter: boolean
    sharedToLinkedIn: boolean
    shareCount: number
    isPinned: boolean
    displayOrder: number
}

export interface PinnedBadge {
    id: string
    slug: string
    name: string
    icon: string
    color: string
    bgGradient: string | null
    rarity: BadgeRarity
    claimedAt: Date | null
}

// =========================================
// Level Types
// =========================================

export interface Level {
    id: number
    level: number
    title: string
    description: string | null
    icon: string | null
    color: string | null
    xpRequired: number
    xpReward: number
    creditsReward: number
    perks: LevelPerks | null
    isActive: boolean
}

export interface LevelPerks {
    dailyBonus?: number
    unlocks?: string[]
    features?: string[]
}

export interface LevelInfo {
    level: number
    title: string
    icon: string | null
    color: string | null
    description: string | null
    xpRequired: number
    currentXp: number
    nextLevelXp: number | null
    progressPercent: number
    xpToNext: number
}

export interface UserLevelProgress {
    id: string
    userId: string
    level: number
    levelInfo: Level
    xpEarned: number
    creditsEarned: number
    achievedAt: Date
    sharedToSocial: boolean
}

// =========================================
// Statistics Types
// =========================================

export interface AchievementStats {
    totalBadges: number
    claimedBadges: number
    readyToClaim: number
    inProgress: number
    commonBadges: number
    rareBadges: number
    epicBadges: number
    legendaryBadges: number
    mythicBadges: number
    totalXpFromBadges: number
    totalCreditsFromBadges: number
    totalShares: number
}

export interface UserAchievementStats {
    id: string
    userId: string
    commonBadges: number
    rareBadges: number
    epicBadges: number
    legendaryBadges: number
    mythicBadges: number
    totalBadges: number
    badgesInProgress: number
    badgesReadyToClaim: number
    totalXpFromBadges: number
    totalCreditsFromBadges: number
    totalShares: number
}

// =========================================
// Social Connection Types
// =========================================

export interface SocialConnection {
    id: string
    provider: SocialProvider
    accountName: string | null
    accountHandle: string | null
    accountImage: string | null
    isActive: boolean
    connectedAt: Date
    lastUsedAt: Date | null
}

export interface SocialShare {
    id: string
    provider: SocialProvider
    shareType: string
    referenceId: string | null
    content: string
    externalPostId: string | null
    externalUrl: string | null
    wasSuccessful: boolean
    errorMessage: string | null
    sharedAt: Date
}

export interface ShareContent {
    twitter: string
    linkedin: string
}

// =========================================
// Notification Types
// =========================================

export interface AchievementNotification {
    id: string
    userId: string
    type: 'badge_unlocked' | 'badge_ready' | 'badge_claimed' | 'level_up' | 'milestone'
    title: string
    message: string
    referenceType: string | null
    referenceId: string | null
    icon: string | null
    color: string | null
    isRead: boolean
    isDismissed: boolean
    createdAt: Date
    readAt: Date | null
}

// =========================================
// Props Types
// =========================================

export interface AchievementsContentProps {
    badges: BadgeWithProgress[]
    stats: AchievementStats
    levelInfo: LevelInfo
    socialConnections: SocialConnection[]
    levels: Level[]
}

export interface BadgeCardProps {
    badge: BadgeWithProgress
    onClick?: () => void
    onShare?: () => void
    compact?: boolean
}

export interface LevelProgressProps {
    levelInfo: LevelInfo
    levels: Level[]
}

export interface ClaimBadgeSheetProps {
    badge: BadgeWithProgress | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onShare: (badge: BadgeWithProgress) => void
    socialConnections: SocialConnection[]
}

export interface ShareSheetProps {
    badge: BadgeWithProgress | null
    open: boolean
    onOpenChange: (open: boolean) => void
    socialConnections: SocialConnection[]
}

export interface BadgeCelebrationProps {
    badge: {
        id: string
        name: string
        icon: string
        color: string
        bgGradient?: string | null
        rarity: string
        xpReward: number
        creditsReward: number
    }
    show: boolean
    onClose: () => void
    onCollect?: () => void
    autoCollect?: boolean
}

export interface SocialIntegrationsContentProps {
    connections: SocialConnection[]
}

// =========================================
// Configuration Types
// =========================================

export interface RarityConfig {
    bg: string
    text: string
    border: string
    ring: string
    glow: string
    gradient: string
}

export const RARITY_COLORS: Record<BadgeRarity, RarityConfig> = {
    COMMON: {
        bg: 'bg-neutral-100 dark:bg-neutral-800',
        text: 'text-neutral-600 dark:text-neutral-400',
        border: 'border-neutral-300 dark:border-neutral-700',
        ring: 'ring-neutral-400',
        glow: '',
        gradient: 'from-neutral-400 to-neutral-600',
    },
    RARE: {
        bg: 'bg-blue-50 dark:bg-blue-950',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-700',
        ring: 'ring-blue-400',
        glow: 'hover:shadow-blue-500/20',
        gradient: 'from-blue-400 to-blue-600',
    },
    EPIC: {
        bg: 'bg-purple-50 dark:bg-purple-950',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700',
        ring: 'ring-purple-400',
        glow: 'hover:shadow-purple-500/30',
        gradient: 'from-purple-400 to-purple-600',
    },
    LEGENDARY: {
        bg: 'bg-amber-50 dark:bg-amber-950',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-700',
        ring: 'ring-amber-400',
        glow: 'hover:shadow-amber-500/40',
        gradient: 'from-amber-400 to-amber-600',
    },
    MYTHIC: {
        bg: 'bg-pink-50 dark:bg-pink-950',
        text: 'text-pink-600 dark:text-pink-400',
        border: 'border-pink-300 dark:border-pink-700',
        ring: 'ring-pink-400',
        glow: 'hover:shadow-pink-500/50',
        gradient: 'from-pink-400 via-purple-400 to-cyan-400',
    },
}

export const BADGE_CATEGORIES: Record<BadgeCategory, { label: string; icon: string }> = {
    PROJECTS: { label: 'Projects', icon: '🎯' },
    ASSESSMENTS: { label: 'Assessments', icon: '📝' },
    CHALLENGES: { label: 'Challenges', icon: '🔥' },
    MOCK_INTERVIEWS: { label: 'Mock Interviews', icon: '🎙️' },
    COMMUNITY: { label: 'Community', icon: '👥' },
    CONCEPTS: { label: 'Concepts', icon: '💡' },
    SPACES: { label: 'Spaces', icon: '🚀' },
    STUDIO: { label: 'Studio', icon: '🎬' },
    OPENSOURCE: { label: 'Open Source', icon: '🌐' },
    PATHFINDER: { label: 'Pathfinder', icon: '🗺️' },
    LAUNCHPADS: { label: 'Launchpads', icon: '🚀' },
    COLLECTIVE: { label: 'Collective', icon: '🏛️' },
    PORTFOLIO: { label: 'Portfolio', icon: '💼' },
    CONSISTENCY: { label: 'Streaks', icon: '⚡' },
    SOCIAL: { label: 'Social', icon: '❤️' },
    MILESTONE: { label: 'Milestones', icon: '👑' },
    SPECIAL: { label: 'Special', icon: '✨' },
}

// =========================================
// API Response Types
// =========================================

export interface ClaimBadgeResult {
    success: boolean
    badge?: Badge
    xpReward?: number
    creditsReward?: number
    error?: string
}

export interface UpdateProgressResult {
    success: boolean
    updated?: number
    error?: string
}
