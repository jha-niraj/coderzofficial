'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, BookOpen, CheckCircle, Code, FileQuestion, Globe,
    Heart, Loader2, Lock, Mic, Play, Share2, Sparkles
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import { Separator } from '@repo/ui/components/ui/separator'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import { useUserStore } from '@/app/store/useUserStore'
import {
    getPracticeSetDetails, togglePracticeSetLike, startPracticeSetAttempt
} from '@/actions/(main)/assessments/user-sets.action'
import { AssessmentMode, QuestionDifficulty } from '@repo/prisma/client'
import { formatDistanceToNow } from 'date-fns'
import type { PracticeSetDetails } from '@/types/assessment'

// Language configs
const LANGUAGES: Record<string, { label: string; icon: string }> = {
    JAVASCRIPT: { label: 'JavaScript', icon: '🟨' },
    PYTHON: { label: 'Python', icon: '🐍' },
    C: { label: 'C', icon: '🔷' },
    CPP: { label: 'C++', icon: '🔶' },
    REACTJS: { label: 'React.js', icon: '⚛️' },
    TYPESCRIPT: { label: 'TypeScript', icon: '🔵' },
    JAVA: { label: 'Java', icon: '☕' },
    GO: { label: 'Go', icon: '🐹' },
    RUST: { label: 'Rust', icon: '🦀' },
    NODEJS: { label: 'Node.js', icon: '🟩' },
    PHP: { label: 'PHP', icon: '🐘' },
    SWIFT: { label: 'Swift', icon: '🍎' },
    KOTLIN: { label: 'Kotlin', icon: '🎯' },
    RUBY: { label: 'Ruby', icon: '💎' },
    SCALA: { label: 'Scala', icon: '🔴' },
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
    EASY: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    INTERMEDIATE: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    HARD: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
}

const modeIcons: Record<AssessmentMode, React.ReactNode> = {
    QUIZ: <FileQuestion className="w-4 h-4" />,
    CODE: <Code className="w-4 h-4" />,
    MOCK: <Mic className="w-4 h-4" />,
    MIXED: <Sparkles className="w-4 h-4" />,
}

export default function PracticeSetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { user } = useUserStore()
    const [practiceSet, setPracticeSet] = useState<PracticeSetDetails | null>(null)
    const [loading, setLoading] = useState(true)
    // const [starting, setStarting] = useState(false)
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)

    useEffect(() => {
        async function fetchDetails() {
            try {
                const result = await getPracticeSetDetails(id)
                if (result.success && result.data) {
                    setPracticeSet(result.data as PracticeSetDetails)
                    setLiked(result.data.isLiked || false)
                    setLikesCount(result.data._count?.likedBy || 0)
                }
            } catch (error) {
                console.error('Error fetching practice set:', error)
                toast.error('Failed to load practice set')
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [id])

    // const handleStartPractice = async () => {
    //     if (!user) {
    //         toast.error('Please sign in to start')
    //         router.push('/login')
    //         return
    //     }

    //     setStarting(true)
    //     try {
    //         const result = await startPracticeSetAttempt(id)
    //         if (result.success && result.attemptId) {
    //             toast.success('Practice started!')
    //             router.push(`/assessments/practice/attempt/${result.attemptId}`)
    //         } else {
    //             toast.error(result.error || 'Failed to start practice')
    //         }
    //     } catch (error) {
    //         console.log("Error occurred while starting practice: " + error);
    //         toast.error('Something went wrong')
    //     } finally {
    //         setStarting(false)
    //     }
    // }

    const handleLike = async () => {
        if (!user) {
            toast.error('Please sign in to like')
            return
        }

        try {
            const result = await togglePracticeSetLike(id)
            if (result.success) {
                setLiked(result.liked || false)
                setLikesCount(prev => result.liked ? prev + 1 : prev - 1)
            }
        } catch (error) {
            console.log("Error occurred while liking set " + error);
            toast.error('Failed to toggle like')
        }
    }

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            toast.success('Link copied to clipboard!')
        } catch {
            toast.error('Failed to copy link')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!practiceSet) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="p-8 text-center">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Practice set not found</h2>
                        <p className="text-muted-foreground mb-4">
                            This practice set may have been deleted or doesn&apos;t exist
                        </p>
                        <Link href="/assessments">
                            <Button>Back to Assessments</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const lang = LANGUAGES[practiceSet.language]
    const difficulty = difficultyColors[practiceSet.difficulty]
    // User can start if they own it or it's public (access is already checked in the action)
    const canStart = practiceSet.isOwner || practiceSet.isPublic

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/assessments">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold line-clamp-1">{practiceSet.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                Practice Set • {practiceSet.questionCount} questions
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleShare}>
                                <Share2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleLike}
                                className={cn(liked && "text-red-500")}
                            >
                                <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container py-8 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start gap-4">
                                <span className="text-4xl">{lang?.icon}</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">{practiceSet.title}</h2>
                                    <p className="text-muted-foreground mt-1">
                                        {practiceSet.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={cn(difficulty?.bg, difficulty?.text)}>
                                    {practiceSet.difficulty}
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    {modeIcons[practiceSet.mode as AssessmentMode]}
                                    {practiceSet.mode}
                                </Badge>
                                {
                                    practiceSet.isPublic ? (
                                        <Badge variant="outline" className="gap-1 text-blue-600">
                                            <Globe className="w-3 h-3" />
                                            Public
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="gap-1">
                                            <Lock className="w-3 h-3" />
                                            Private
                                        </Badge>
                                    )
                                }
                            </div>

                            <Separator />

                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold">{practiceSet.questionCount}</p>
                                    <p className="text-xs text-muted-foreground">Questions</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{practiceSet.views}</p>
                                    <p className="text-xs text-muted-foreground">Views</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{likesCount}</p>
                                    <p className="text-xs text-muted-foreground">Likes</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{practiceSet.totalAttempts}</p>
                                    <p className="text-xs text-muted-foreground">Attempts</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {
                        canStart && practiceSet.questions && practiceSet.questions.length > 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Questions Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {
                                        practiceSet.questions?.slice(0, 3).map((q: { id: string; type: string; difficulty: QuestionDifficulty; question: string; codeSnippet?: string | null }, idx: number) => (
                                            <div key={q.id} className="p-4 rounded-lg bg-muted/50">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline" className="text-xs">
                                                                {q.type}
                                                            </Badge>
                                                            <Badge variant="outline" className={cn("text-xs", difficultyColors[q.difficulty]?.text)}>
                                                                {q.difficulty}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm">{q.question}</p>
                                                        {
                                                            q.codeSnippet && (
                                                                <pre className="mt-2 p-2 rounded bg-neutral-100 dark:bg-neutral-900 text-xs overflow-x-auto">
                                                                    <code>{q.codeSnippet}</code>
                                                                </pre>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                    {
                                        practiceSet.questions?.length > 3 && (
                                            <p className="text-sm text-muted-foreground text-center">
                                                + {practiceSet.questions.length - 3} more questions
                                            </p>
                                        )
                                    }
                                </CardContent>
                            </Card>
                        ) : !canStart ? (
                            <Card className="border-dashed">
                                <CardContent className="p-8 text-center">
                                    <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">Questions Hidden</h3>
                                    <p className="text-muted-foreground text-sm">
                                        Sign in to view and attempt the questions
                                    </p>
                                </CardContent>
                            </Card>
                        ) : null}
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Created by</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={practiceSet.creator.image || undefined} />
                                    <AvatarFallback>
                                        {practiceSet.creator.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {practiceSet.creator.name || practiceSet.creator.username}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(practiceSet.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            {
                                practiceSet.isOwner ? (
                                    <>
                                        <div className="text-center">
                                            <Badge className="mb-2">Your Practice Set</Badge>
                                            <p className="text-sm text-muted-foreground">
                                                You created this practice set
                                            </p>
                                        </div>
                                        <Link href={`/assessments/practice/start/${id}`}>
                                            <Button className="w-full gap-2">
                                                <Play className="w-4 h-4" />
                                                Start Practice
                                            </Button>
                                        </Link>
                                    </>
                                ) : canStart ? (
                                    <>
                                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-center">
                                            <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                                            <p className="text-sm font-medium">Access Granted</p>
                                        </div>
                                        <Link href={`/assessments/practice/start/${id}`}>
                                            <Button className="w-full gap-2">
                                                <Play className="w-4 h-4" />
                                                Start Practice
                                            </Button>
                                        </Link>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Earn credits on completion
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <p className="text-lg text-muted-foreground">Sign in to start</p>
                                        </div>
                                        <Button
                                            className="w-full gap-2"
                                            onClick={() => router.push('/login')}
                                        >
                                            <Play className="w-4 h-4" />
                                            Sign In to Start
                                        </Button>
                                        <p className="text-xs text-muted-foreground text-center">
                                            Earn credits on completion
                                        </p>
                                    </>
                                )
                            }
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">What&apos;s Included</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{practiceSet.questionCount} AI-generated questions</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Detailed explanations</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Hints for each question</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Progress tracking</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>Credit rewards on completion</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}