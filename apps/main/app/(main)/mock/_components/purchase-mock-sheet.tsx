'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Separator } from '@repo/ui/components/ui/separator'
import {
    Sparkles, Clock, Brain, CheckCircle, Play, AlertCircle,
    Trophy, Target, Loader2, RotateCcw
} from 'lucide-react'
import toast from '@repo/ui/components/ui/sonner'
import { createMockVoiceSession, getMockSessionInfo } from '@/actions/(main)/mockvoice/session.action'
import Link from 'next/link'

interface MockData {
    id: string
    title: string
    description: string
    category?: string
    level: string
    duration: number
    creditsRequired: number
    questionsCount?: number
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

interface SessionInfo {
    sessionCount: number
    isCreator: boolean
    freeSessionsRemaining: number
    needsPayment: boolean
    creditsToCharge: number
    fullPrice: number
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
    const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
    const [isLoadingInfo, setIsLoadingInfo] = useState(false)

    // Fetch session info when sheet opens
    useEffect(() => {
        if (isOpen && mock) {
            setIsLoadingInfo(true)
            getMockSessionInfo(mock.id)
                .then(result => {
                    if (result.success && result.data) {
                        setSessionInfo(result.data)
                    }
                })
                .catch(() => { /* silently fail, use full price */ })
                .finally(() => setIsLoadingInfo(false))
        } else {
            setSessionInfo(null)
        }
    }, [isOpen, mock])

    if (!mock) return null

    const creditsNeeded = sessionInfo?.creditsToCharge ?? mock.creditsRequired
    const isFreeSession = sessionInfo ? !sessionInfo.needsPayment : false
    const hasEnoughCredits = isFreeSession || userCredits >= creditsNeeded

    const handleStart = async () => {
        if (!hasEnoughCredits) {
            toast.error('Insufficient credits', {
                description: `You need ${creditsNeeded} credits but have ${userCredits}`
            })
            return
        }

        setIsStarting(true)

        try {
            const result = await createMockVoiceSession({
                mockId: mock.id,
                mockType: 'predefined',
                includesResume: false,
                retakeCredits: isFreeSession ? 0 : (sessionInfo?.isCreator && sessionInfo.needsPayment ? creditsNeeded : undefined)
            })

            if (!result.success) {
                throw new Error(result.error || 'Failed to create session')
            }

            toast.success('Session created! Starting interview...')
            onClose()
            router.push(`/mock/voice/interview/${result.sessionId}`)
        } catch (error) {
            console.error('Error starting interview:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to start interview')
            setIsStarting(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">{mock.category ? categoryIcons[mock.category] : '📋'}</span>
                            <Badge className={levelColors[mock.level]}>
                                {mock.level}
                            </Badge>
                        </div>
                        <SheetTitle className="text-2xl mb-2">{mock.title}</SheetTitle>
                        <SheetDescription className="text-sm">
                            {mock.description}
                        </SheetDescription>
                    </div>
                </SheetHeader>

                <div className="space-y-5">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
                            <p className="text-xl font-bold">{mock.duration}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">minutes</p>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
                            <p className="text-xl font-bold">{mock.questionsCount ?? '-'}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">questions</p>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1" />
                            <p className="text-xl font-bold">{mock.popularity ?? 0}</p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">sessions</p>
                        </div>
                    </div>

                    {/* Session Info */}
                    {isLoadingInfo ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                        </div>
                    ) : sessionInfo && (
                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                            <div className="flex items-center gap-2 mb-3">
                                <RotateCcw className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-sm">Your Sessions</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-neutral-600 dark:text-neutral-400">Completed attempts</span>
                                <span className="font-semibold">{sessionInfo.sessionCount} / 3</span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (sessionInfo.sessionCount / 3) * 100)}%` }}
                                />
                            </div>
                            {sessionInfo.isCreator && sessionInfo.freeSessionsRemaining > 0 && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg text-xs">
                                    <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                    <span className="text-blue-700 dark:text-blue-300">
                                        {sessionInfo.freeSessionsRemaining} free session{sessionInfo.freeSessionsRemaining > 1 ? 's' : ''} remaining (you created this mock)
                                    </span>
                                </div>
                            )}
                            {sessionInfo.isCreator && sessionInfo.needsPayment && (
                                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg text-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                    <span className="text-amber-700 dark:text-amber-300">
                                        Creator discount: <span className="line-through">{sessionInfo.fullPrice}</span> → {creditsNeeded} credits (50% off)
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <Separator />

                    {/* Pricing & Action */}
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-900/30">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-base">Cost</h3>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" />
                                {isFreeSession ? (
                                    <span className="text-2xl font-bold text-green-600">Free</span>
                                ) : (
                                    <>
                                        {sessionInfo?.isCreator && sessionInfo.needsPayment && (
                                            <span className="text-lg text-neutral-400 line-through">
                                                {sessionInfo.fullPrice}
                                            </span>
                                        )}
                                        <span className="text-2xl font-bold text-purple-600">
                                            {creditsNeeded}
                                        </span>
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">credits</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {!isFreeSession && (
                            <div className="flex items-center justify-between text-sm mb-3">
                                <span className="text-neutral-600 dark:text-neutral-400">Your Balance:</span>
                                <span className="font-semibold">{userCredits} credits</span>
                            </div>
                        )}

                        {!hasEnoughCredits && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg text-sm mb-4"
                            >
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                <span className="text-red-700 dark:text-red-300">
                                    You need {creditsNeeded - userCredits} more credits
                                </span>
                            </motion.div>
                        )}

                        {hasEnoughCredits && !isFreeSession && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg text-sm mb-4">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-green-700 dark:text-green-300">
                                    After purchase: {userCredits - creditsNeeded} credits remaining
                                </span>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button
                                size="lg"
                                className="w-full bg-black text-white dark:bg-white dark:text-black text-lg py-6"
                                onClick={handleStart}
                                disabled={!hasEnoughCredits || isStarting || isLoadingInfo}
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Starting...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5 mr-2" />
                                        {isFreeSession ? 'Start Free Session' : 'Start Interview Now'}
                                    </>
                                )}
                            </Button>

                            {!hasEnoughCredits && (
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
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {mock.tags && mock.tags.length > 0 && (
                        <div>
                            <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Focus Areas
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {mock.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
