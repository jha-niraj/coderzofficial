'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    Search, Filter, Users, TrendingUp, Sparkles, Plus, ChevronDown, Loader2,
    Grid, List, CheckCircle2
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import { CommunityCard } from '@/components/community/community-card'
import {
    getPublicCommunities, joinCommunity, leaveCommunity, getUserCommunities,
    getCommunityCategories
} from '@/actions/(main)/community/community.action'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'

const CATEGORIES = [
    'All',
    'General',
    'Tech',
    'Study',
    'Career',
    'DSA & Algorithms',
    'Web Development',
    'Mobile Development',
    'AI & Machine Learning',
    'DevOps & Cloud',
    'Open Source',
    'Gaming',
    'Design',
    'College',
    'Company',
    'Other'
]

export default function DiscoverPage() {
    const [communities, setCommunities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [sortBy, setSortBy] = useState<'memberCount' | 'postCount' | 'createdAt'>('memberCount')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set())
    const [loadingCommunities, setLoadingCommunities] = useState<Set<string>>(new Set())
    const [total, setTotal] = useState(0)

    const loadCommunities = useCallback(async () => {
        setIsLoading(true)
        try {
            const [communitiesResult, userCommunitiesResult] = await Promise.all([
                getPublicCommunities({
                    category: category === 'All' ? undefined : category,
                    search: search || undefined,
                    sortBy,
                    limit: 50
                }),
                getUserCommunities()
            ])

            if (communitiesResult.success) {
                setCommunities(communitiesResult.data || [])
                setTotal(communitiesResult.total || 0)
            }

            if (userCommunitiesResult.success && userCommunitiesResult.data) {
                setJoinedCommunities(new Set(userCommunitiesResult.data.map(c => c.id)))
            }
        } catch {
            toast.error('Failed to load communities')
        } finally {
            setIsLoading(false)
        }
    }, [category, search, sortBy])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            loadCommunities()
        }, 300)

        return () => clearTimeout(debounceTimer)
    }, [loadCommunities])

    const handleJoinCommunity = async (communityId: string) => {
        setLoadingCommunities(prev => new Set(prev).add(communityId))
        try {
            const result = await joinCommunity(communityId)
            if (result.success) {
                setJoinedCommunities(prev => new Set(prev).add(communityId))
                toast.success(result.message || 'Joined community!')
            } else {
                toast.error(result.error || 'Failed to join')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setLoadingCommunities(prev => {
                const next = new Set(prev)
                next.delete(communityId)
                return next
            })
        }
    }

    const handleLeaveCommunity = async (communityId: string) => {
        setLoadingCommunities(prev => new Set(prev).add(communityId))
        try {
            const result = await leaveCommunity(communityId)
            if (result.success) {
                setJoinedCommunities(prev => {
                    const next = new Set(prev)
                    next.delete(communityId)
                    return next
                })
                toast.success('Left community')
            } else {
                toast.error(result.error || 'Failed to leave')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setLoadingCommunities(prev => {
                const next = new Set(prev)
                next.delete(communityId)
                return next
            })
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-neutral-300 dark:border-neutral-700">
                            <Users className="w-4 h-4 mr-2" />
                            {total.toLocaleString()} Communities
                        </Badge>

                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
                            Discover Communities
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                            Find your tribe. Join communities that match your interests and start connecting with like-minded developers.
                        </p>
                        <div className="max-w-xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                    placeholder="Search communities..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-12 h-14 text-lg rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                            {
                                CATEGORIES.slice(0, 8).map((cat) => (
                                    <Button
                                        key={cat}
                                        variant={category === cat ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCategory(cat)}
                                        className={cn(
                                            "rounded-full whitespace-nowrap",
                                            category === cat
                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                : "border-neutral-200 dark:border-neutral-700"
                                        )}
                                    >
                                        {cat}
                                    </Button>
                                ))
                            }
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-auto h-8 rounded-full border-neutral-200 dark:border-neutral-700">
                                    <SelectValue placeholder="More" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                <SelectTrigger className="w-40 h-9 rounded-lg border-neutral-200 dark:border-neutral-700">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="memberCount">Most Members</SelectItem>
                                    <SelectItem value="postCount">Most Active</SelectItem>
                                    <SelectItem value="createdAt">Newest</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="hidden md:flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "h-9 w-9 rounded-l-lg rounded-r-none",
                                        viewMode === 'grid' && "bg-neutral-100 dark:bg-neutral-800"
                                    )}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "h-9 w-9 rounded-r-lg rounded-l-none",
                                        viewMode === 'list' && "bg-neutral-100 dark:bg-neutral-800"
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {
                    isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                        </div>
                    ) : communities.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Users className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No communities found
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                                {search ? `No results for "${search}"` : 'Be the first to create one!'}
                            </p>
                            <Link href="/community/create">
                                <Button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Community
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Showing {communities.length} of {total} communities
                                </p>
                            </div>

                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'grid'
                                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                    : "grid-cols-1"
                            )}>
                                <AnimatePresence>
                                    {
                                        communities.map((community, index) => (
                                            <motion.div
                                                key={community.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <CommunityCard
                                                    community={community}
                                                    isMember={joinedCommunities.has(community.id)}
                                                    onJoin={() => handleJoinCommunity(community.id)}
                                                    onLeave={() => handleLeaveCommunity(community.id)}
                                                    loading={loadingCommunities.has(community.id)}
                                                />
                                            </motion.div>
                                        ))
                                    }
                                </AnimatePresence>
                            </div>
                        </>
                    )
                }
            </div>
            <section className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                            Can't find what you're looking for?
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Create your own community and bring together people who share your passion.
                        </p>
                        <Link href="/community/create">
                            <Button size="lg" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 h-12 px-8 rounded-xl">
                                <Plus className="w-5 h-5 mr-2" />
                                Create Your Community
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}