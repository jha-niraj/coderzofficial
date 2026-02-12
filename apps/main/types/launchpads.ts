// Launchpads Types - Centralized type definitions for the Launchpads feature

// =========================================
// Enums
// =========================================

export type LaunchpadCategory =
    | 'LEARNING'
    | 'PRODUCTIVITY'
    | 'CAREER'
    | 'COMMUNITY'
    | 'DEVELOPER_TOOLS'
    | 'AI_POWERED'
    | 'OTHER'

export type LaunchpadPricing =
    | 'Free'
    | 'Freemium'
    | 'Paid'
    | 'Open Source'

export type LaunchpadType =
    | 'COMMUNITY'
    | 'CODERZ'

// =========================================
// Core Types
// =========================================

export interface LaunchpadProduct {
    id: string
    slug: string
    name: string
    tagline: string
    description: string
    logo: string | null
    coverImage: string | null
    category: LaunchpadCategory | string
    tags: string[]
    techStack: string[]
    features: string[]
    websiteUrl: string | null
    demoUrl: string | null
    githubUrl: string | null
    twitterUrl: string | null
    viewCount: number
    likeCount: number
    commentCount: number
    isFeatured: boolean
    type: LaunchpadType | string
    pricing?: LaunchpadPricing | string
    createdAt?: Date
    updatedAt?: Date
    createdBy?: LaunchpadUser | null
}

export interface LaunchpadUser {
    id: string
    name: string | null
    username: string | null
    image: string | null
}

export interface LaunchpadComment {
    id: string
    content: string
    createdAt: Date
    user: LaunchpadUser
    likes: number
    isLiked?: boolean
}

export interface LaunchpadFeedback {
    id: string
    rating: number
    feedback: string
    createdAt: Date
    user: LaunchpadUser
}

// =========================================
// Props Types
// =========================================

export interface LaunchpadsContentProps {
    coderzProducts: LaunchpadProduct[]
    communityProducts: LaunchpadProduct[]
    featuredProducts: LaunchpadProduct[]
}

export interface ProductDetailProps {
    product: LaunchpadProduct & {
        comments?: LaunchpadComment[]
        feedbacks?: LaunchpadFeedback[]
        isLiked?: boolean
        isBookmarked?: boolean
    }
}

export interface ProductSidebarProps {
    product: LaunchpadProduct
    relatedProducts?: LaunchpadProduct[]
}

export interface ProductCardProps {
    product: LaunchpadProduct
    isSelected?: boolean
    showStats?: boolean
    compact?: boolean
}

// =========================================
// Form Input Types
// =========================================

export interface CreateProductInput {
    name: string
    tagline: string
    description: string
    logo?: string
    coverImage?: string
    category: LaunchpadCategory | string
    tags: string[]
    features: string[]
    techStack: string[]
    websiteUrl?: string
    demoUrl?: string
    githubUrl?: string
    twitterUrl?: string
    pricing?: LaunchpadPricing | string
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
    id: string
}

export interface ProductCommentInput {
    productId: string
    content: string
    parentId?: string
}

export interface ProductFeedbackInput {
    productId: string
    rating: number
    feedback: string
}

// =========================================
// Filter & Search Types
// =========================================

export interface ProductFilters {
    category?: LaunchpadCategory | string
    type?: LaunchpadType | string
    pricing?: LaunchpadPricing | string
    search?: string
    sortBy?: 'newest' | 'popular' | 'trending'
}

export interface ProductSearchResult {
    products: LaunchpadProduct[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

// =========================================
// Analytics Types
// =========================================

export interface ProductAnalytics {
    views: number
    likes: number
    comments: number
    shares: number
    clickThrough: number
    viewHistory: { date: string; count: number }[]
}

// =========================================
// Store Types
// =========================================

export interface LaunchpadsStoreState {
    coderzProducts: LaunchpadProduct[]
    communityProducts: LaunchpadProduct[]
    featuredProducts: LaunchpadProduct[]
    activeTab: 'community' | 'coderz'
    isLoading: boolean
    initialize: (coderz: LaunchpadProduct[], community: LaunchpadProduct[], featured: LaunchpadProduct[]) => void
    addCommunityProduct: (product: LaunchpadProduct) => void
    addCoderzProduct: (product: LaunchpadProduct) => void
    updateProduct: (productId: string, data: Partial<LaunchpadProduct>) => void
    removeProduct: (productId: string) => void
    setActiveTab: (tab: 'community' | 'coderz') => void
    setIsLoading: (loading: boolean) => void
}

// =========================================
// Configuration Types
// =========================================

export interface CategoryIconConfig {
    icon: React.ReactNode
    color: string
    bg: string
}

export const LAUNCHPAD_CATEGORIES: Record<string, { label: string; icon: string }> = {
    LEARNING: { label: 'Learning', icon: '📚' },
    PRODUCTIVITY: { label: 'Productivity', icon: '⚡' },
    CAREER: { label: 'Career', icon: '📈' },
    COMMUNITY: { label: 'Community', icon: '👥' },
    DEVELOPER_TOOLS: { label: 'Developer Tools', icon: '🛠️' },
    AI_POWERED: { label: 'AI Powered', icon: '🤖' },
    OTHER: { label: 'Other', icon: '📦' },
}

export const LAUNCHPAD_PRICING: Record<string, { label: string; color: string }> = {
    Free: { label: 'Free', color: 'text-emerald-500' },
    Freemium: { label: 'Freemium', color: 'text-blue-500' },
    Paid: { label: 'Paid', color: 'text-amber-500' },
    'Open Source': { label: 'Open Source', color: 'text-purple-500' },
}
