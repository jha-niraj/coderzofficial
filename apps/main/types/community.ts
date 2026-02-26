// Community Module Types - Centralized type definitions
export interface PostAuthor {
    id: string
    name: string | null
    username: string | null
    image: string | null
}

export interface ShareableItem {
    id: string
    type: 'interview' | 'project' | 'space' | 'studio' | 'Learn' | 'challenge'
    title: string
    description?: string
    thumbnail?: string
    url?: string
    metadata?: Record<string, unknown>
}

export interface CommunityPost {
    id: string
    title?: string | null
    content: string
    createdAt: Date
    updatedAt: Date
    author: PostAuthor
    _count?: {
        likes: number
        comments: number
    }
    likesCount?: number
    commentsCount?: number
    type: string
    tags: string[]
    isPinned: boolean
    isLocked: boolean
    isAnswered?: boolean
    isResolved?: boolean
    likeCount: number
    commentCount: number
    viewCount: number
    isLiked?: boolean
    officialChannel?: string | null
    community: {
        id: string
        name: string
        slug: string
        logo?: string | null
    } | null
    poll?: unknown
    attachments?: unknown
    codeBlocks?: unknown
    embeds?: unknown
}

export interface CommunityResource {
    id: string
    title: string
    description?: string | null
    url?: string | null
    type: string
    uploader?: { name: string | null } | null
    downloadCount?: number
}

export interface CommunityMember {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
    role: string
    joinedAt: Date
    user: {
        id: string
        name: string | null
        username: string | null
        image: string | null
        bio?: string | null
    }
}

export interface CommunityInvite {
    id: string
    code: string
    inviteeEmail: string | null
    isUsed: boolean
    usedAt: Date | null
    expiresAt: Date | null
    createdAt: Date
    status?: string
    inviter: {
        id: string
        name: string | null
        image: string | null
    }
}

export interface CommunityPageData {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    coverImage?: string | null
    logo?: string | null
    themeColor: string
    category: string
    visibility: string
    isVerified: boolean
    memberCount: number
    postCount: number
    enabledSections: string[]
    rules: string[]
    tags: string[]
    createdAt: Date
    creator: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
    isMember?: boolean
    userRole?: string
}

export interface TopContributor {
    id: string
    name: string | null
    username: string | null
    image: string | null
    helpfulCount: number
}

export interface SectionConfig {
    label: string
    icon: React.ComponentType<{ className?: string }>
    description: string
    postType?: string
}