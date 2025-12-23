'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { revalidatePath } from "next/cache"

// Official channel slugs
const OFFICIAL_CHANNELS = ['general', 'showcase', 'help', 'career', 'wins']

// Get posts for a specific channel
export async function getChannelPosts(channelSlug: string, options?: {
    limit?: number
    cursor?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        const { limit = 20, cursor } = options || {}

        // Validate channel
        if (!OFFICIAL_CHANNELS.includes(channelSlug)) {
            return { success: false, error: "Invalid channel" }
        }

        const posts = await prisma.communityPost.findMany({
            where: {
                officialChannel: channelSlug
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        })

        const hasMore = posts.length > limit
        const items = hasMore ? posts.slice(0, -1) : posts

        // Check if user liked posts
        let userLikes: string[] = []
        if (session?.user?.id) {
            const likes = await prisma.communityPostLike.findMany({
                where: {
                    postId: { in: items.map(p => p.id) },
                    userId: session.user.id
                },
                select: { postId: true }
            })
            userLikes = likes.map(l => l.postId)
        }

        const postsWithUserData = items.map(post => ({
            ...post,
            isLiked: userLikes.includes(post.id)
        }))

        return { 
            success: true, 
            data: postsWithUserData,
            nextCursor: hasMore ? items[items.length - 1].id : undefined
        }
    } catch (error) {
        console.error('Error fetching channel posts:', error)
        return { success: false, error: "Failed to fetch posts" }
    }
}

// Create a post in an official channel
export async function createChannelPost(input: {
    channel: string
    title?: string
    content: string
    tags?: string[]
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Validate channel
        if (!OFFICIAL_CHANNELS.includes(input.channel)) {
            return { success: false, error: "Invalid channel" }
        }

        const post = await prisma.communityPost.create({
            data: {
                authorId: session.user.id,
                title: input.title,
                content: input.content,
                tags: input.tags || [],
                type: 'DISCUSSION',
                officialChannel: input.channel
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        })

        revalidatePath(`/community/channel/${input.channel}`)
        return { success: true, data: post }
    } catch (error) {
        console.error('Error creating channel post:', error)
        return { success: false, error: "Failed to create post" }
    }
}


