'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Twitter, Linkedin, Sparkles, Copy, Check, ExternalLink,
    Share2, Wand2, AlertCircle
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import {
    generateShareContent, improveContentWithAI, recordSocialShare
} from '@/actions/(main)/achievements/social-share.action'
import type { BadgeWithProgress } from '@/actions/(main)/achievements/achievements.action'
import Link from 'next/link'
import type { SocialConnectionSummary } from '@/types/achievements'

interface ShareSheetProps {
    badge: BadgeWithProgress | null
    open: boolean
    onOpenChange: (open: boolean) => void
    socialConnections: SocialConnectionSummary[]
}

export function ShareSheet({ badge, open, onOpenChange, socialConnections }: ShareSheetProps) {
    const [platform, setPlatform] = useState<'twitter' | 'linkedin'>('twitter')
    const [content, setContent] = useState({ twitter: '', linkedin: '' })
    const [loading, setLoading] = useState(false)
    const [improving, setImproving] = useState(false)
    const [copied, setCopied] = useState(false)
    const [selectedText, setSelectedText] = useState('')

    const hasTwitter = socialConnections.some(c => c.provider === 'TWITTER')
    const hasLinkedIn = socialConnections.some(c => c.provider === 'LINKEDIN')

    const loadContent = useCallback(async () => {
        if (!badge) return
        setLoading(true)

        try {
            const result = await generateShareContent(badge.id)
            if (result.success && result.content) {
                setContent({
                    twitter: result.content.twitter,
                    linkedin: result.content.linkedin,
                })
            }
        } catch {
            toast.error('Failed to generate share content')
        } finally {
            setLoading(false)
        }
    }, [badge])

    // Generate content when badge changes
    useEffect(() => {
        if (badge && open) {
            loadContent()
        }
    }, [badge, open, loadContent])

    const handleImprove = async (textToImprove?: string) => {
        setImproving(true)

        try {
            const textToSend = textToImprove || content[platform]
            const result = await improveContentWithAI(textToSend, platform)

            if (result.success && result.content) {
                if (textToImprove && selectedText) {
                    // Replace only selected text
                    const newContent = content[platform].replace(selectedText, result.content)
                    setContent(prev => ({ ...prev, [platform]: newContent }))
                } else {
                    setContent(prev => ({ ...prev, [platform]: result.content }))
                }
                toast.success('Content improved!')
            }
        } catch {
            toast.error('Failed to improve content')
        } finally {
            setImproving(false)
            setSelectedText('')
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content[platform])
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        if (!badge) return

        const shareUrl = platform === 'twitter'
            ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.twitter)}`
            : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://coderz.io')}&summary=${encodeURIComponent(content.linkedin)}`

        // Record the share
        await recordSocialShare({
            provider: platform === 'twitter' ? 'TWITTER' : 'LINKEDIN',
            shareType: 'badge',
            referenceId: badge.id,
            content: content[platform],
            wasSuccessful: true,
        })

        window.open(shareUrl, '_blank', 'width=600,height=400')
    }

    const handleTextSelect = () => {
        const selection = window.getSelection()?.toString()
        if (selection && selection.length > 5) {
            setSelectedText(selection)
        } else {
            setSelectedText('')
        }
    }

    if (!badge) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-500" />
                        Share Achievement
                    </SheetTitle>
                    <SheetDescription>
                        Share your &quot;{badge.name}&quot; badge with the world
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                            style={{ background: badge.bgGradient || badge.color }}
                        >
                            {badge.icon}
                        </div>
                        <div>
                            <h4 className="font-semibold text-neutral-900 dark:text-white">{badge.name}</h4>
                            <p className="text-sm text-neutral-500">{badge.rarity.toLowerCase()} badge</p>
                        </div>
                    </div>

                    {
                        !hasTwitter && !hasLinkedIn && (
                            <div className="bg-amber-50 dark:bg-amber-950/50 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                                            No social accounts connected
                                        </p>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            Connect your accounts for a better sharing experience.
                                        </p>
                                        <Link href="/settings/social-integrations">
                                            <Button variant="link" className="text-amber-600 p-0 h-auto text-xs mt-2">
                                                Connect accounts →
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    <Tabs value={platform} onValueChange={(v) => setPlatform(v as 'twitter' | 'linkedin')}>
                        <TabsList className="w-full">
                            <TabsTrigger value="twitter" className="flex-1 gap-2">
                                <Twitter className="w-4 h-4" />
                                Twitter
                            </TabsTrigger>
                            <TabsTrigger value="linkedin" className="flex-1 gap-2">
                                <Linkedin className="w-4 h-4" />
                                LinkedIn
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value={platform} className="mt-4 space-y-4">
                            <div className="relative">
                                <Textarea
                                    value={content[platform]}
                                    onChange={(e) => setContent(prev => ({ ...prev, [platform]: e.target.value }))}
                                    onMouseUp={handleTextSelect}
                                    placeholder={loading ? 'Generating content...' : 'Write your post...'}
                                    className="min-h-[150px] resize-none pr-10"
                                    disabled={loading}
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={cn(
                                        "text-xs",
                                        platform === 'twitter' && content.twitter.length > 280
                                            ? "text-red-500"
                                            : "text-neutral-400"
                                    )}>
                                        {content[platform].length}
                                        {platform === 'twitter' && '/280'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleImprove()}
                                    disabled={improving || !content[platform]}
                                    className="gap-2"
                                >
                                    <Wand2 className={cn(
                                        "w-4 h-4",
                                        improving && "animate-pulse"
                                    )} />
                                    {improving ? 'Improving...' : 'Improve with AI'}
                                </Button>

                                {
                                    selectedText && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleImprove(selectedText)}
                                            disabled={improving}
                                            className="gap-2 text-purple-600 dark:text-purple-400"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Improve Selection
                                        </Button>
                                    )
                                }
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleCopy}
                                    className="flex-1"
                                >
                                    {
                                        copied ? (
                                            <Check className="w-4 h-4 mr-2 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 mr-2" />
                                        )
                                    }
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>

                                <Button
                                    onClick={handleShare}
                                    disabled={!content[platform]}
                                    className={cn(
                                        "flex-1",
                                        platform === 'twitter'
                                            ? "bg-[#1DA1F2] hover:bg-[#1a94da] text-white"
                                            : "bg-[#0A66C2] hover:bg-[#094d92] text-white"
                                    )}
                                >
                                    {
                                        platform === 'twitter' ? (
                                            <Twitter className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Linkedin className="w-4 h-4 mr-2" />
                                        )
                                    }
                                    Share
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="bg-blue-50 dark:bg-blue-950/50 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Tips for better engagement</h4>
                        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                            <li>• Use relevant hashtags to reach more people</li>
                            <li>• Add a personal touch about your learning journey</li>
                            <li>• Tag friends who might be interested</li>
                            {
                                platform === 'twitter' && (
                                    <li>• Keep it under 280 characters for best visibility</li>
                                )
                            }
                        </ul>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}