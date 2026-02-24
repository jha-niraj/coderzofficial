'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Users, CheckCircle2, Lock, Loader2, ShieldCheck
} from 'lucide-react'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import { Badge } from '@repo/ui/components/ui/badge'
import { cn } from '@repo/ui/lib/utils'
import { useCommunityStore, type CommunityBasic } from '@/app/store/communityStore'
import Image from 'next/image'

interface JoinCommunitySheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    community: CommunityBasic | {
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
        rules: string[]
        joinQuestions: string[]
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
}

export function JoinCommunitySheet({ open, onOpenChange, community }: JoinCommunitySheetProps) {
    const { joinCommunity } = useCommunityStore()
    const [isJoining, setIsJoining] = useState(false)
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const hasQuestions = community.joinQuestions && community.joinQuestions.length > 0
    const isRestricted = community.visibility === 'RESTRICTED'
    const memberCount = community._count?.members ?? community.memberCount

    const allAnswered = hasQuestions
        ? community.joinQuestions.every((_, i) => answers[`q${i}`]?.trim())
        : true

    const handleJoin = async () => {
        setIsJoining(true)
        try {
            const success = await joinCommunity(
                community.id,
                hasQuestions ? answers : undefined
            )
            if (success) {
                onOpenChange(false)
                setAnswers({})
            }
        } finally {
            setIsJoining(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="text-left">
                    <SheetTitle>Join Community</SheetTitle>
                    <SheetDescription>
                        {isRestricted
                            ? 'This community requires approval to join'
                            : `Join ${community.name} to participate`
                        }
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Community preview */}
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div
                            className="h-24 relative"
                            style={{
                                background: community.coverImage
                                    ? `url(${community.coverImage}) center/cover`
                                    : `linear-gradient(135deg, ${community.themeColor}60, ${community.themeColor}30)`
                            }}
                        >
                            <div className="absolute -bottom-6 left-4">
                                <div
                                    className="w-14 h-14 rounded-xl border-4 border-white dark:border-neutral-900 flex items-center justify-center text-xl shadow-md overflow-hidden"
                                    style={{ backgroundColor: community.themeColor }}
                                >
                                    {community.logo ? (
                                        <Image
                                            src={community.logo}
                                            alt={community.name}
                                            width={56}
                                            height={56}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-white font-bold">{community.name.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 pb-4 px-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                    {community.name}
                                </h3>
                                {community.isVerified && (
                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                )}
                                {isRestricted && (
                                    <Lock className="w-4 h-4 text-neutral-400" />
                                )}
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                {community.shortDescription || community.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {memberCount.toLocaleString()} members
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                    {community.category}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    {community.rules && community.rules.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-neutral-500" />
                                <h4 className="font-medium text-sm text-neutral-900 dark:text-white">
                                    Community Rules
                                </h4>
                            </div>
                            <div className="space-y-2 pl-6">
                                {community.rules.map((rule, index) => (
                                    <div key={index} className="flex gap-2 text-sm">
                                        <span className="font-medium text-neutral-400 flex-shrink-0">
                                            {index + 1}.
                                        </span>
                                        <span className="text-neutral-600 dark:text-neutral-400">
                                            {rule}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Join questions */}
                    {hasQuestions && (
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    The admins require you to answer the following questions to join.
                                </p>
                            </div>
                            {community.joinQuestions.map((question, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="space-y-2"
                                >
                                    <Label className="text-sm font-medium">
                                        {question}
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Textarea
                                        placeholder="Your answer..."
                                        value={answers[`q${index}`] || ''}
                                        onChange={(e) => setAnswers(prev => ({
                                            ...prev,
                                            [`q${index}`]: e.target.value
                                        }))}
                                        rows={2}
                                        className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 resize-none"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Join button */}
                    <Button
                        onClick={handleJoin}
                        disabled={isJoining || !allAnswered}
                        className={cn(
                            "w-full gap-2",
                            "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
                            "hover:bg-neutral-800 dark:hover:bg-neutral-100"
                        )}
                    >
                        {isJoining ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Users className="w-4 h-4" />
                        )}
                        {isJoining
                            ? 'Joining...'
                            : isRestricted
                                ? 'Submit Join Request'
                                : 'Join Community'
                        }
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
