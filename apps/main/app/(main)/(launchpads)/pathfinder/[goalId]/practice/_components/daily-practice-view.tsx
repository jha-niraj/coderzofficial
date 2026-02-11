'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Badge } from '@repo/ui/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/components/ui/tabs'
import {
    Target, Plus, CheckCircle2, Circle, Mic, Loader2,
    ArrowLeft, Code2, Brain, Trophy, Trash2,
    ChevronRight, Calendar, Notebook, Sparkles, Square
} from 'lucide-react'
import Link from 'next/link'
import { PathfinderCategory, PathfinderLevel } from '@repo/prisma/client'
import { cn } from '@repo/ui/lib/utils'
import { 
    createSubGoal, 
    updateSubGoalStatus, 
    deleteSubGoal,
    getSubGoalWithContent,
} from '@/actions/(main)/pathfinder/subgoals.action'
import { useRouter } from 'next/navigation'
import { SubGoalQuiz } from './subgoal-quiz'
import { SubGoalCoding } from './subgoal-coding'

interface SubGoal {
    id: string
    title: string
    description: string | null
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
    source: string
    aiQuizQuestions: unknown
    aiCodingProblem: unknown
    hasCoding: boolean
    quizCompleted: boolean
    quizScore: number | null
    codingCompleted: boolean
    codingPassed: boolean
    order: number
}

interface DailySession {
    id: string
    date: Date
    totalSubGoals: number
    completedSubGoals: number
    totalQuizQuestions: number
    correctQuizAnswers: number
    totalCodingProblems: number
    solvedCodingProblems: number
    subGoals: SubGoal[]
}

interface Goal {
    id: string
    title: string
    category: PathfinderCategory
    level: PathfinderLevel
    studioId: string | null
}

interface DailyPracticeViewProps {
    goal: Goal
    initialSession: DailySession | null
}

// ================================================================================
// HEADER COMPONENT
// ================================================================================

function PracticeHeader({ goal }: { goal: Goal }) {
    return (
        <div className="flex-shrink-0 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/pathfinder/${goal.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-violet-500" />
                            Daily Practice
                        </h1>
                        <p className="text-xs text-neutral-500 truncate max-w-[200px]">{goal.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {goal.studioId && (
                        <Link href={`/studio/${goal.studioId}`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Notebook className="w-3 h-3 mr-1" />
                                Studio
                            </Button>
                        </Link>
                    )}
                    <Link href={`/pathfinder/${goal.id}/verify`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                            <Trophy className="w-3 h-3 mr-1" />
                            Verification
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

// ================================================================================
// SUB-GOAL INPUT COMPONENT
// ================================================================================

function SubGoalInput({ 
    goalId, 
    onSubGoalAdded,
}: { 
    goalId: string
    onSubGoalAdded: () => void
}) {
    const [title, setTitle] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || isLoading) return

        setIsLoading(true)
        try {
            const result = await createSubGoal({
                goalId,
                title: title.trim(),
                source: 'text',
            })
            if (result.success) {
                setTitle('')
                onSubGoalAdded()
            }
        } catch (error) {
            console.error('Error creating sub-goal:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                
                // For now, we'll just show a message since voice transcription
                // would require the ElevenLabs API or similar
                // You can implement transcribeVoiceRecording action later
                console.log('Voice recording saved, size:', audioBlob.size)
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error('Error starting recording:', error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to learn today?"
                className="h-9 flex-1 text-sm"
                disabled={isLoading}
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn("h-9 w-9", isRecording && "bg-red-100 text-red-600")}
                onClick={isRecording ? stopRecording : startRecording}
            >
                {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
                type="submit" 
                size="sm" 
                className="h-9 bg-violet-600 hover:bg-violet-700"
                disabled={!title.trim() || isLoading}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
        </form>
    )
}

// ================================================================================
// SUB-GOAL ITEM COMPONENT
// ================================================================================

function SubGoalItem({ 
    subGoal, 
    isSelected,
    onSelect,
    onStatusChange,
    onDelete,
}: { 
    subGoal: SubGoal
    isSelected: boolean
    onSelect: () => void
    onStatusChange: (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED') => void
    onDelete: () => void
}) {
    const [isDeleting, setIsDeleting] = useState(false)
    const hasAiContent = subGoal.aiQuizQuestions !== null

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (subGoal.status === 'COMPLETED') {
            onStatusChange('PENDING')
        } else {
            onStatusChange('COMPLETED')
        }
    }

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsDeleting(true)
        await onDelete()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={onSelect}
            className={cn(
                "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all",
                isSelected 
                    ? "bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-transparent"
            )}
        >
            <button
                onClick={handleToggle}
                className="flex-shrink-0 mt-0.5"
            >
                {subGoal.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                    <Circle className={cn(
                        "w-5 h-5 transition-colors",
                        isSelected ? "text-violet-400" : "text-neutral-300"
                    )} />
                )}
            </button>
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm font-medium",
                    subGoal.status === 'COMPLETED' && "line-through text-neutral-400"
                )}>
                    {subGoal.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    {!hasAiContent && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                            <Loader2 className="w-2 h-2 mr-1 animate-spin" />
                            Generating...
                        </Badge>
                    )}
                    {hasAiContent && subGoal.quizCompleted && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-green-100 text-green-700">
                            <Brain className="w-2 h-2 mr-1" />
                            Quiz: {subGoal.quizScore}%
                        </Badge>
                    )}
                    {hasAiContent && subGoal.hasCoding && subGoal.codingCompleted && (
                        <Badge variant="secondary" className={cn(
                            "text-[10px] h-4 px-1",
                            subGoal.codingPassed 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                        )}>
                            <Code2 className="w-2 h-2 mr-1" />
                            {subGoal.codingPassed ? 'Passed' : 'Failed'}
                        </Badge>
                    )}
                </div>
            </div>
            <button
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all"
                disabled={isDeleting}
            >
                {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
            <ChevronRight className={cn(
                "w-4 h-4 transition-colors",
                isSelected ? "text-violet-500" : "text-neutral-300"
            )} />
        </motion.div>
    )
}

// ================================================================================
// SESSION STATS COMPONENT
// ================================================================================

function SessionStats({ session }: { session: DailySession | null }) {
    if (!session) return null

    const quizPercent = session.totalQuizQuestions > 0
        ? Math.round((session.correctQuizAnswers / session.totalQuizQuestions) * 100)
        : 0

    return (
        <div className="grid grid-cols-3 gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
                <div className="text-lg font-bold text-green-600">{session.completedSubGoals}/{session.totalSubGoals}</div>
                <div className="text-[10px] text-green-600/70">Tasks</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <div className="text-lg font-bold text-purple-600">{quizPercent}%</div>
                <div className="text-[10px] text-purple-600/70">Quiz Score</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <div className="text-lg font-bold text-orange-600">{session.solvedCodingProblems}/{session.totalCodingProblems}</div>
                <div className="text-[10px] text-orange-600/70">Code</div>
            </div>
        </div>
    )
}

// ================================================================================
// MAIN COMPONENT
// ================================================================================

export function DailyPracticeView({ goal, initialSession }: DailyPracticeViewProps) {
    const router = useRouter()
    const [session, setSession] = useState(initialSession)
    const [selectedSubGoal, setSelectedSubGoal] = useState<SubGoal | null>(null)
    const [activeTab, setActiveTab] = useState<'quiz' | 'coding'>('quiz')
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Auto-refresh to check for AI content generation
    useEffect(() => {
        const checkForContent = async () => {
            if (!selectedSubGoal) return
            if (selectedSubGoal.aiQuizQuestions !== null) return

            setIsRefreshing(true)
            const result = await getSubGoalWithContent(selectedSubGoal.id)
            if (result.success && result.subGoal) {
                setSelectedSubGoal(result.subGoal as SubGoal)
                // Update in session list too
                if (session) {
                    setSession({
                        ...session,
                        subGoals: session.subGoals.map(sg =>
                            sg.id === result.subGoal!.id ? result.subGoal as SubGoal : sg
                        )
                    })
                }
            }
            setIsRefreshing(false)
        }

        const interval = setInterval(checkForContent, 3000)
        return () => clearInterval(interval)
    }, [selectedSubGoal, session])

    const handleSubGoalAdded = () => {
        router.refresh()
    }

    const handleStatusChange = async (subGoalId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED') => {
        await updateSubGoalStatus(subGoalId, status)
        router.refresh()
    }

    const handleDelete = async (subGoalId: string) => {
        await deleteSubGoal(subGoalId)
        if (selectedSubGoal?.id === subGoalId) {
            setSelectedSubGoal(null)
        }
        router.refresh()
    }

    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
    })

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <PracticeHeader goal={goal} />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Side - Sub-goals List */}
                <div className="w-[350px] border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-950">
                    {/* Date Header */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100 dark:border-neutral-900">
                        <Calendar className="w-4 h-4 text-violet-500" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{today}</span>
                    </div>

                    {/* Stats */}
                    <SessionStats session={session} />

                    {/* Input */}
                    <SubGoalInput goalId={goal.id} onSubGoalAdded={handleSubGoalAdded} />

                    {/* Sub-goals List */}
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            <AnimatePresence>
                                {session?.subGoals.map((subGoal) => (
                                    <SubGoalItem
                                        key={subGoal.id}
                                        subGoal={subGoal}
                                        isSelected={selectedSubGoal?.id === subGoal.id}
                                        onSelect={() => setSelectedSubGoal(subGoal)}
                                        onStatusChange={(status) => handleStatusChange(subGoal.id, status)}
                                        onDelete={() => handleDelete(subGoal.id)}
                                    />
                                ))}
                            </AnimatePresence>

                            {(!session || session.subGoals.length === 0) && (
                                <div className="text-center py-12 text-neutral-400">
                                    <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No tasks for today</p>
                                    <p className="text-xs mt-1">Add your first learning task above</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Side - Quiz/Coding */}
                <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-900/50">
                    {selectedSubGoal ? (
                        <>
                            {/* Selected Sub-goal Header */}
                            <div className="flex-shrink-0 p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold text-neutral-900 dark:text-white">
                                            {selectedSubGoal.title}
                                        </h2>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            {selectedSubGoal.aiQuizQuestions 
                                                ? 'AI-generated quiz and coding ready'
                                                : 'Generating AI content...'}
                                        </p>
                                    </div>
                                    {isRefreshing && (
                                        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            {selectedSubGoal.aiQuizQuestions ? (
                                <Tabs 
                                    value={activeTab} 
                                    onValueChange={(v) => setActiveTab(v as 'quiz' | 'coding')}
                                    className="flex-1 flex flex-col overflow-hidden"
                                >
                                    <TabsList className="flex-shrink-0 mx-4 mt-4 h-9">
                                        <TabsTrigger value="quiz" className="flex-1 text-xs">
                                            <Brain className="w-3 h-3 mr-1" />
                                            Quiz
                                            {selectedSubGoal.quizCompleted && (
                                                <CheckCircle2 className="w-3 h-3 ml-1 text-green-500" />
                                            )}
                                        </TabsTrigger>
                                        {selectedSubGoal.hasCoding && (
                                            <TabsTrigger value="coding" className="flex-1 text-xs">
                                                <Code2 className="w-3 h-3 mr-1" />
                                                Coding
                                                {selectedSubGoal.codingCompleted && (
                                                    <CheckCircle2 className={cn(
                                                        "w-3 h-3 ml-1",
                                                        selectedSubGoal.codingPassed ? "text-green-500" : "text-red-500"
                                                    )} />
                                                )}
                                            </TabsTrigger>
                                        )}
                                    </TabsList>

                                    <TabsContent value="quiz" className="flex-1 overflow-hidden m-0 p-4">
                                        <SubGoalQuiz 
                                            subGoal={selectedSubGoal}
                                            onComplete={() => router.refresh()}
                                        />
                                    </TabsContent>

                                    {selectedSubGoal.hasCoding && (
                                        <TabsContent value="coding" className="flex-1 overflow-hidden m-0 p-4">
                                            <SubGoalCoding
                                                subGoal={selectedSubGoal}
                                                onComplete={() => router.refresh()}
                                            />
                                        </TabsContent>
                                    )}
                                </Tabs>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-violet-500 animate-pulse" />
                                        </div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                            Generating Content
                                        </h3>
                                        <p className="text-sm text-neutral-500">
                                            AI is creating quiz questions and coding problems...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <Target className="w-8 h-8 text-neutral-400" />
                                </div>
                                <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                                    Select a Task
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Click on a task to view its quiz and coding challenge
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
