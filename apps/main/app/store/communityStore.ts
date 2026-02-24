import { create } from 'zustand'
import {
    getUserCommunities, joinCommunity as joinCommunityAction,
    leaveCommunity as leaveCommunityAction
} from '@/actions/(main)/community/community.action'
import {
    getCommunityPosts, togglePostLike as togglePostLikeAction,
    createPost as createPostAction, createComment as createCommentAction,
    type CreatePostInput
} from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'

// ==================== TYPES ====================

export interface CommunityBasic {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    logo?: string | null
    coverImage?: string | null
    themeColor: string
    category: string
    visibility: string
    isVerified: boolean
    memberCount: number
    postCount: number
    tags: string[]
    enabledSections: string[]
    rules: string[]
    joinQuestions: string[]
    userRole?: string
    creator?: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
    _count?: {
        members: number
        posts: number
    }
}

export interface PostAuthor {
    id: string
    name: string | null
    username: string | null
    image: string | null
}

export interface CommunityPostData {
    id: string
    title?: string | null
    content: string
    type: string
    tags: string[]
    isPinned: boolean
    isLocked: boolean
    isAnswered?: boolean
    likeCount: number
    commentCount: number
    viewCount: number
    createdAt: Date
    author: PostAuthor
    community?: {
        id: string
        name: string
        slug: string
        logo?: string | null
    } | null
    _count?: {
        likes: number
        comments: number
    }
    isLiked?: boolean
}

// ==================== STORE ====================

interface CommunityState {
    // State
    userCommunities: CommunityBasic[]
    selectedCommunityId: string | null
    posts: CommunityPostData[]
    isLoading: boolean
    isLoadingPosts: boolean
    postsCursor: string | undefined

    // Community actions
    fetchUserCommunities: () => Promise<void>
    selectCommunity: (communityId: string | null) => void
    joinCommunity: (communityId: string, answers?: Record<string, string>) => Promise<boolean>
    leaveCommunity: (communityId: string) => Promise<boolean>

    // Post actions
    fetchPosts: (communityId?: string) => Promise<void>
    loadMorePosts: (communityId?: string) => Promise<void>
    addPost: (input: CreatePostInput) => Promise<boolean>
    toggleLike: (postId: string) => void
    addComment: (postId: string, content: string, parentId?: string) => Promise<boolean>
    removePost: (postId: string) => void
    updatePostInStore: (postId: string, data: Partial<CommunityPostData>) => void

    // Helpers
    getSelectedCommunity: () => CommunityBasic | null
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
    userCommunities: [],
    selectedCommunityId: null,
    posts: [],
    isLoading: false,
    isLoadingPosts: false,
    postsCursor: undefined,

    fetchUserCommunities: async () => {
        set({ isLoading: true })
        try {
            const result = await getUserCommunities()
            if (result.success && result.data) {
                set({ userCommunities: result.data as CommunityBasic[] })
            }
        } catch {
            console.error('Failed to fetch user communities')
        } finally {
            set({ isLoading: false })
        }
    },

    selectCommunity: (communityId: string | null) => {
        set({ selectedCommunityId: communityId, posts: [], postsCursor: undefined })
        if (communityId) {
            get().fetchPosts(communityId)
        }
    },

    joinCommunity: async (communityId: string, answers?: Record<string, string>) => {
        try {
            const result = await joinCommunityAction(communityId, answers)
            if (result.success) {
                // Optimistic: refetch user communities to get updated list
                await get().fetchUserCommunities()
                toast.success(result.message || 'Joined community!')
                return true
            } else {
                toast.error(result.error || 'Failed to join')
                return false
            }
        } catch {
            toast.error('Something went wrong')
            return false
        }
    },

    leaveCommunity: async (communityId: string) => {
        try {
            const result = await leaveCommunityAction(communityId)
            if (result.success) {
                set(state => ({
                    userCommunities: state.userCommunities.filter(c => c.id !== communityId),
                    selectedCommunityId: state.selectedCommunityId === communityId ? null : state.selectedCommunityId
                }))
                toast.success('Left community')
                return true
            } else {
                toast.error(result.error || 'Failed to leave')
                return false
            }
        } catch {
            toast.error('Something went wrong')
            return false
        }
    },

    fetchPosts: async (communityId?: string) => {
        set({ isLoadingPosts: true })
        try {
            const result = await getCommunityPosts(communityId || '', { limit: 20 })
            if (result.success && result.data) {
                set({
                    posts: result.data as CommunityPostData[],
                    postsCursor: result.nextCursor
                })
            }
        } catch {
            console.error('Failed to fetch posts')
        } finally {
            set({ isLoadingPosts: false })
        }
    },

    loadMorePosts: async (communityId?: string) => {
        const { postsCursor, isLoadingPosts } = get()
        if (!postsCursor || isLoadingPosts) return

        set({ isLoadingPosts: true })
        try {
            const result = await getCommunityPosts(communityId || '', {
                limit: 20,
                cursor: postsCursor
            })
            if (result.success && result.data) {
                set(state => ({
                    posts: [...state.posts, ...(result.data as CommunityPostData[])],
                    postsCursor: result.nextCursor
                }))
            }
        } catch {
            console.error('Failed to load more posts')
        } finally {
            set({ isLoadingPosts: false })
        }
    },

    addPost: async (input: CreatePostInput) => {
        try {
            const result = await createPostAction(input)
            if (result.success && result.data) {
                // Prepend the new post to the list
                set(state => ({
                    posts: [result.data as CommunityPostData, ...state.posts]
                }))
                return true
            } else {
                toast.error(result.error || 'Failed to create post')
                return false
            }
        } catch {
            toast.error('Failed to create post')
            return false
        }
    },

    toggleLike: (postId: string) => {
        // Optimistic update
        set(state => ({
            posts: state.posts.map(post => {
                if (post.id === postId) {
                    const newLiked = !post.isLiked
                    return {
                        ...post,
                        isLiked: newLiked,
                        likeCount: post.likeCount + (newLiked ? 1 : -1)
                    }
                }
                return post
            })
        }))

        // Fire and forget server action
        togglePostLikeAction(postId).catch(() => {
            // Revert on failure
            set(state => ({
                posts: state.posts.map(post => {
                    if (post.id === postId) {
                        const revertLiked = !post.isLiked
                        return {
                            ...post,
                            isLiked: revertLiked,
                            likeCount: post.likeCount + (revertLiked ? 1 : -1)
                        }
                    }
                    return post
                })
            }))
            toast.error('Failed to update like')
        })
    },

    addComment: async (postId: string, content: string, parentId?: string) => {
        try {
            const result = await createCommentAction(postId, content, parentId)
            if (result.success) {
                // Update comment count optimistically
                set(state => ({
                    posts: state.posts.map(post => {
                        if (post.id === postId) {
                            return { ...post, commentCount: post.commentCount + 1 }
                        }
                        return post
                    })
                }))
                return true
            } else {
                toast.error(result.error || 'Failed to comment')
                return false
            }
        } catch {
            toast.error('Failed to create comment')
            return false
        }
    },

    removePost: (postId: string) => {
        set(state => ({
            posts: state.posts.filter(p => p.id !== postId)
        }))
    },

    updatePostInStore: (postId: string, data: Partial<CommunityPostData>) => {
        set(state => ({
            posts: state.posts.map(post => {
                if (post.id === postId) {
                    return { ...post, ...data }
                }
                return post
            })
        }))
    },

    getSelectedCommunity: () => {
        const { userCommunities, selectedCommunityId } = get()
        if (!selectedCommunityId) return null
        return userCommunities.find(c => c.id === selectedCommunityId) || null
    }
}))
