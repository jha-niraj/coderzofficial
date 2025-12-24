'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Separator } from '@repo/ui/components/ui/separator'
import {
    Sparkles, Clock, Brain, CheckCircle, Calendar, Play, X,
    AlertCircle, Trophy, Target, Zap
} from 'lucide-react'
import toast from '@repo/ui/components/ui/sonner'
import { createMockVoiceSession } from '@/actions/(main)/mockvoice/session.action'
import Link from 'next/link'

// Generic mock type for any mock data
interface MockData {
    id: string
    title: string
    description: string
    category: string
    level: string
    duration: number
    creditsRequired: number
    questionsCount?: number
    knowledgeBase?: string
    tags?: string[]
    byAdmin?: boolean
    popularity?: number
}

interface PurchaseMockSheetProps {
    isOpen: boolean
    onClose: () => void
    mock: MockData | null
    userCredits: number
}

const levelColors: Record<string, string> = {
    'BEGINNER': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'INTERMEDIATE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'ADVANCED': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'EXPERT': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const categoryIcons: Record<string, string> = {
    'TECHNICAL': '💻',
    'BEHAVIORAL': '🤝',
    'HR': '👔',
    'SYSTEM_DESIGN': '🏗️',
    'LEADERSHIP': '👑',
    'NEGOTIATION': '💰',
    'CODING': '⌨️',
    'CASE_STUDY': '📊',
    'GENERAL': '📋',
}

export function PurchaseMockSheet({ isOpen, onClose, mock, userCredits }: PurchaseMockSheetProps) {
    const router = useRouter()
    const [isStarting, setIsStarting] = useState(false)

    if (!mock) return null

    const hasEnoughCredits = userCredits >= mock.creditsRequired

    const handleStart = async () => {
        if (!hasEnoughCredits) {
            toast.error('Insufficient credits', {
                description: `You need ${mock.creditsRequired} credits but have ${userCredits}`
            })
            return
        }

        setIsStarting(true)

        try {
            // Create session (this deducts credits)
            const result = await createMockVoiceSession({
                mockId: mock.id,
                mockType: 'predefined',
                includesResume: false
            })

            if (!result.success) {
                throw new Error(result.error || 'Failed to create session')
            }

            toast.success('Session created! Starting interview...')
            onClose()

            // Redirect to interview page
            router.push(`/mockinterview/voice/interview/${result.sessionId}`)
        } catch (error) {
            console.error('Error starting interview:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to start interview')
            setIsStarting(false)
        }
    }

    const handleSchedule = () => {
        toast.info('Schedule feature coming soon!')
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl">{categoryIcons[mock.category]}</span>
                                <Badge className={levelColors[mock.level]}>
                                    {mock.level}
                                </Badge>
                            </div>
                            <SheetTitle className="text-3xl mb-2">{mock.title}</SheetTitle>
                            <SheetDescription className="text-base">
                                {mock.description}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>
                <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-900/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">Total Cost</h3>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                                <span className="text-3xl font-bold text-purple-600">
                                    {mock.creditsRequired}
                                </span>
                                <span className="text-neutral-600 dark:text-neutral-400">credits</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-4">
                            <span className="text-neutral-600 dark:text-neutral-400">Your Balance:</span>
                            <span className="font-semibold">{userCredits} credits</span>
                        </div>

                        {
                            !hasEnoughCredits && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg text-sm mb-4"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                    <span className="text-red-700 dark:text-red-300">
                                        You need {mock.creditsRequired - userCredits} more credits
                                    </span>
                                </motion.div>
                            )
                        }

                        {
                            hasEnoughCredits && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg text-sm mb-4">
                                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-green-700 dark:text-green-300">
                                        After purchase: {userCredits - mock.creditsRequired} credits remaining
                                    </span>
                                </div>
                            )
                        }

                        <div className="space-y-3">
                            <Button
                                size="lg"
                                className="w-full bg-black text-white dark:bg-white dark:text-black text-lg py-6"
                                onClick={handleStart}
                                disabled={!hasEnoughCredits || isStarting}
                            >
                                {
                                    isStarting ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Sparkles className="w-5 h-5 mr-2" />
                                            </motion.div>
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 mr-2" />
                                            Start Interview Now
                                        </>
                                    )
                                }
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full text-lg py-6"
                                onClick={handleSchedule}
                                disabled={!hasEnoughCredits}
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                Schedule for Later
                            </Button>

                            {
                                !hasEnoughCredits && (
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="w-full text-lg py-6"
                                        asChild
                                    >
                                        <Link href="/purchase">
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Get More Credits
                                        </Link>
                                    </Button>
                                )
                            }
                        </div>
                    </div>

                    <Separator />

                    {/* INFO SECTIONS - Moved below actions */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                            <p className="text-2xl font-bold">{mock.duration}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">minutes</p>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                            <p className="text-2xl font-bold">{mock.questionsCount}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">questions</p>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                            <p className="text-2xl font-bold">{mock.popularity ?? 0}%</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">popularity</p>
                        </div>
                    </div>

                    {
                        mock.tags && mock.tags.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Focus Areas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {
                                        mock.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="outline" className="text-sm">
                                                {tag}
                                            </Badge>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }

                    <Separator />

                    <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            What You'll Practice
                        </h3>
                        <div className="space-y-3">
                            {
                                mock?.knowledgeBase?.split('\n').slice(1, 6).map((line, idx) => {
                                    const trimmedLine = line.trim()
                                    if (!trimmedLine || trimmedLine.startsWith('You are') || trimmedLine.startsWith('Ask')) return null
                                    return (
                                        <div key={idx} className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                                {trimmedLine.replace(/^-\s*/, '')}
                                            </p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            What to Expect
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/30">
                                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
                                        AI-Powered Interview
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Conversational AI adapted to your experience level
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-900/30">
                                <Trophy className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm text-purple-900 dark:text-purple-100 mb-1">
                                        Instant Feedback
                                    </p>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">
                                        Get detailed analysis and improvement suggestions
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm text-green-900 dark:text-green-100 mb-1">
                                        Progress Tracking
                                    </p>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Track your performance and see improvements over time
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}