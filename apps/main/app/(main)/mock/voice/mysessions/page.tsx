'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Calendar, Clock, Eye, Play, Loader2, CheckCircle2,
    FolderOpen
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { useUserStore } from '@/app/store/useUserStore'
import { getUserMockSessions } from '@/actions/(main)/mockvoice/voice.action'
import { createMockVoiceSession } from '@/actions/(main)/mockvoice/session.action'
import { useRouter } from 'next/navigation'
import toast from '@repo/ui/components/ui/sonner'

interface SessionData {
    id: string
    status: string
    createdAt: Date
    completedAt: Date | null
    duration: number | null
    creditsUsed: number
    mock: {
        id: string
        title: string
        description: string
        level: string
        category: string
        duration: number | null
        creditsRequired: number
    }
}

export default function MySessionsPage() {
    const router = useRouter()
    const { user } = useUserStore()
    const [sessions, setSessions] = useState<SessionData[]>([])
    const [loading, setLoading] = useState(true)
    const [retakingId, setRetakingId] = useState<string | null>(null)

    const fetchSessions = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getUserMockSessions()
            if (result.success && result.sessions) {
                setSessions(result.sessions as unknown as SessionData[])
            }
        } catch (error) {
            console.error('Error fetching sessions:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    const handleRetake = async (session: SessionData) => {
        const retakeCredits = Math.ceil((session.creditsUsed || session.mock.creditsRequired) / 2)
        if ((user?.credits ?? 0) < retakeCredits) {
            toast.error(`Insufficient credits. Retake costs ${retakeCredits} credits (half of original).`)
            return
        }

        setRetakingId(session.id)
        try {
            const result = await createMockVoiceSession({
                mockId: session.mock.id,
                mockType: 'custom',
                retakeCredits,
            })
            if (result.success && result.sessionId) {
                toast.success('Starting your retake...')
                router.push(`/mock/voice/interview/${result.sessionId}`)
            } else {
                toast.error(result.error || 'Failed to start retake')
            }
        } catch {
            toast.error('Failed to start retake')
        } finally {
            setRetakingId(null)
        }
    }

    const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const formatDuration = (secs: number | null) => {
        if (!secs) return '--'
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/mock/voice">
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    My Interview Sessions
                                </h1>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {sessions.length} interview{sessions.length !== 1 ? 's' : ''} taken
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                            {user?.credits ?? 0} Credits
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : sessions.length === 0 ? (
                    <Card className="border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                                <FolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                No interview sessions yet
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-6 max-w-sm">
                                Start a mock interview from All Mocks or create your own to see your history here.
                            </p>
                            <Link href="/mock/voice">
                                <Button>Browse Mock Interviews</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {sessions.map((session, index) => {
                                const isCompleted = session.status === 'COMPLETED'
                                const retakeCredits = Math.ceil((session.creditsUsed || session.mock.creditsRequired) / 2)
                                return (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Card className="border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-shadow">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <CardTitle className="text-lg line-clamp-1">
                                                        {session.mock.title}
                                                    </CardTitle>
                                                    <Badge
                                                        variant={isCompleted ? 'default' : 'secondary'}
                                                        className={isCompleted ? 'bg-green-600' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}
                                                    >
                                                        {isCompleted ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                                        {isCompleted ? 'Completed' : session.status}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="line-clamp-2">
                                                    {session.mock.description}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="pb-3">
                                                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(session.createdAt)}
                                                    </span>
                                                    {isCompleted && session.duration != null && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {formatDuration(session.duration)}
                                                        </span>
                                                    )}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex gap-2 pt-0">
                                                {isCompleted ? (
                                                    <>
                                                        <Button
                                                            asChild
                                                            className="flex-1"
                                                        >
                                                            <Link href={`/mock/voice/results/${session.id}`}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Result
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleRetake(session)}
                                                            disabled={retakingId === session.id || (user?.credits ?? 0) < retakeCredits}
                                                        >
                                                            {retakingId === session.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Play className="w-4 h-4 mr-2" />
                                                                    Retake ({retakeCredits} cr)
                                                                </>
                                                            )}
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button asChild className="w-full">
                                                        <Link href={`/mock/voice/interview/${session.id}`}>
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Continue Interview
                                                        </Link>
                                                    </Button>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}