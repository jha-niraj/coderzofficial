'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Home, Users, TrendingUp, Plus, ChevronDown, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@/components/ui/collapsible'
import { cn } from '../../lib/utils'
import { CommunityCardMini } from './community-card'
import Image from 'next/image'

interface CommunitySidebarProps {
    userCommunities?: Array<{
        id: string
        name: string
        slug: string
        logo?: string | null
        themeColor: string
        userRole?: string
    }>
    officialChannels?: Array<{
        id: string
        name: string
        slug: string
        icon: string
    }>
    currentCommunitySlug?: string
}

const OFFICIAL_CHANNELS = [
    { id: 'general', name: 'General', slug: 'general', icon: '📢' },
    { id: 'showcase', name: 'Showcase', slug: 'showcase', icon: '🎨' },
    { id: 'help', name: 'Help & Support', slug: 'help', icon: '🆘' },
    { id: 'career', name: 'Career', slug: 'career', icon: '💼' },
    { id: 'wins', name: 'Wins & Milestones', slug: 'wins', icon: '🏆' },
]

const NAV_ITEMS = [
    { icon: Home, label: 'Feed', href: '/community' },
    { icon: TrendingUp, label: 'Trending', href: '/community/trending' },
    { icon: Users, label: 'Discover', href: '/community/discover' },
]

export function CommunitySidebar({
    userCommunities = [],
    officialChannels = OFFICIAL_CHANNELS,
    currentCommunitySlug
}: CommunitySidebarProps) {
    const pathname = usePathname()
    const [myCommunitiesOpen, setMyCommunitiesOpen] = useState(true)
    const [channelsOpen, setChannelsOpen] = useState(true)

    return (
        <aside className="w-64 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 h-[calc(100vh-64px)] sticky top-16">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-6">
                    <nav className="space-y-1">
                        {
                            NAV_ITEMS.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                            )}
                                            whileHover={{ x: 2 }}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </motion.div>
                                    </Link>
                                )
                            })
                        }
                    </nav>
                    <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
                    <Collapsible open={channelsOpen} onOpenChange={setChannelsOpen}>
                        <CollapsibleTrigger asChild>
                            <button className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                                <span>Official Channels</span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform",
                                    channelsOpen && "rotate-180"
                                )} />
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-1">
                            {
                                officialChannels.map((channel) => (
                                    <Link key={channel.id} href={`/community/channel/${channel.slug}`}>
                                        <motion.div
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                            )}
                                            whileHover={{ x: 2 }}
                                        >
                                            <span className="text-base">{channel.icon}</span>
                                            <span className="text-sm">{channel.name}</span>
                                        </motion.div>
                                    </Link>
                                ))
                            }
                        </CollapsibleContent>
                    </Collapsible>
                    <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
                    <Collapsible open={myCommunitiesOpen} onOpenChange={setMyCommunitiesOpen}>
                        <CollapsibleTrigger asChild>
                            <button className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                                <span>My Communities</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {userCommunities.length}
                                    </Badge>
                                    <ChevronDown className={cn(
                                        "w-4 h-4 transition-transform",
                                        myCommunitiesOpen && "rotate-180"
                                    )} />
                                </div>
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-1">
                            {
                                userCommunities.length > 0 ? (
                                    userCommunities.map((community) => (
                                        <CommunityCardMini
                                            key={community.id}
                                            community={community}
                                            isActive={currentCommunitySlug === community.slug}
                                        />
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-center">
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                            You haven't joined any communities yet
                                        </p>
                                        <Link href="/communities/discover">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Eye className="w-4 h-4" />
                                                Explore
                                            </Button>
                                        </Link>
                                    </div>
                                )
                            }
                            <Link href="/communities/create">
                                <motion.div
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mt-2"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm">Create Community</span>
                                </motion.div>
                            </Link>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </ScrollArea>
        </aside>
    )
}

// Right sidebar for community details
interface CommunityInfoSidebarProps {
    community: {
        id: string
        name: string
        description: string
        memberCount: number
        postCount: number
        createdAt: Date
        rules: string[]
        creator: {
            id: string
            name: string | null
            username: string | null
            image: string | null
        }
    }
    topContributors?: Array<{
        id: string
        name: string | null
        username: string | null
        image: string | null
        helpfulCount: number
    }>
}

export function CommunityInfoSidebar({ community, topContributors = [] }: CommunityInfoSidebarProps) {
    return (
        <aside className="w-80 flex-shrink-0 hidden xl:block">
            <div className="sticky top-20 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">About</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        {community.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {community.memberCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-neutral-500">Members</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {community.postCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-neutral-500">Posts</div>
                        </div>
                    </div>
                </div>
                {
                    community.rules.length > 0 && (
                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Community Rules</h3>
                            <ol className="space-y-2">
                                {
                                    community.rules.map((rule, index) => (
                                        <li key={index} className="flex gap-2 text-sm">
                                            <span className="font-medium text-neutral-500">{index + 1}.</span>
                                            <span className="text-neutral-600 dark:text-neutral-400">{rule}</span>
                                        </li>
                                    ))
                                }
                            </ol>
                        </div>
                    )
                }
                {
                    topContributors.length > 0 && (
                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Top Contributors</h3>
                            <div className="space-y-3">
                                {
                                    topContributors.map((user, index) => (
                                        <Link
                                            key={user.id}
                                            href={`/profile/${user.username || user.id}`}
                                            className="flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 p-2 -mx-2 rounded-lg transition-colors"
                                        >
                                            <div className="relative">
                                                <Image
                                                    src={user.image || '/default-avatar.png'}
                                                    alt={user.name || 'User'}
                                                    className="w-8 h-8 rounded-full"
                                                    height={12}
                                                    width={12}
                                                />
                                                {
                                                    index < 3 && (
                                                        <div className={cn(
                                                            "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                                                            index === 0 && "bg-yellow-500",
                                                            index === 1 && "bg-neutral-400",
                                                            index === 2 && "bg-amber-600"
                                                        )}>
                                                            {index + 1}
                                                        </div>
                                                    )
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                                    {user.name || user.username}
                                                </div>
                                                <div className="text-xs text-neutral-500">
                                                    {user.helpfulCount} helpful answers
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </aside>
    )
}