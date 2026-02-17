'use client'

import { useState } from 'react'
import {
    Tabs, TabsList, TabsTrigger, TabsContent
} from '@repo/ui/components/ui/tabs'
import {
    Brain, Code2, CheckCircle2, Mic, Loader2, StickyNote
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { useRouter } from 'next/navigation'
import {
    usePathfinderStore, type SubGoalResources
} from '@/app/store/pathfinderStore'
import {
    createPathfinderPracticeMockAndSession
} from '@/actions/(main)/pathfinder/practice-mock.action'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'
import { Play } from 'lucide-react'
import { PathfinderNotesTab } from './pathfinder-notes-tab'

/** SubGoal shape expected by Quiz and Coding components */
interface SubGoalForTabs {
    id: string
    title: string
    aiQuizQuestions: unknown
    aiCodingProblem: unknown
    quizCompleted: boolean
    quizScore: number | null
    codingCompleted: boolean
    codingPassed: boolean
}

interface SubGoalContentTabsProps {
    subGoalId: string
    subGoalTitle: string
    goalId: string
    aiResources: SubGoalResources | null | undefined
    aiQuizQuestions: unknown
    hasCoding: boolean
    aiCodingProblem: unknown
    quizCompleted: boolean
    quizScore: number | null
    codingCompleted: boolean
    codingPassed: boolean
    onQuizComplete: () => void
    onCodingComplete: () => void
    SubGoalQuizComponent: React.ComponentType<{ subGoal: SubGoalForTabs; onComplete: () => void }>
    SubGoalCodingComponent: React.ComponentType<{ subGoal: SubGoalForTabs; onComplete: () => void }>
    subGoal: SubGoalForTabs
}

export function SubGoalContentTabs({
    subGoalId,
    subGoalTitle,
    goalId,
    aiResources,
    aiQuizQuestions: _aiQuizQuestions,
    hasCoding,
    aiCodingProblem: _aiCodingProblem,
    quizCompleted,
    quizScore: _quizScore,
    codingCompleted,
    codingPassed,
    onQuizComplete,
    onCodingComplete,
    SubGoalQuizComponent,
    SubGoalCodingComponent,
    subGoal,
}: SubGoalContentTabsProps) {
    const router = useRouter()
    const [mockLoading, setMockLoading] = useState(false)

    const handleStartMock = async () => {
        setMockLoading(true)
        try {
            const result = await createPathfinderPracticeMockAndSession(subGoalId)
            if (result.success && result.sessionId) {
                router.push(`/mock/voice/interview/${result.sessionId}`)
            } else {
                toast.error(result.error ?? 'Failed to start mock')
            }
        } catch {
            toast.error('Failed to start mock')
        } finally {
            setMockLoading(false)
        }
    }

    return (
        <Tabs defaultValue="notes" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="flex-shrink-0 mx-4 mt-4 h-auto flex-wrap gap-1">
                <TabsTrigger value="notes" className="text-xs gap-1">
                    <StickyNote className="w-3 h-3" />
                    Notes
                </TabsTrigger>
                <TabsTrigger value="quiz" className="text-xs gap-1">
                    <Brain className="w-3 h-3" />
                    Quiz
                    {quizCompleted && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                </TabsTrigger>
                {
                    hasCoding && (
                        <TabsTrigger value="coding" className="text-xs gap-1">
                            <Code2 className="w-3 h-3" />
                            Coding
                            {
                                codingCompleted && (
                                    <CheckCircle2
                                        className={cn(
                                            'w-3 h-3',
                                            codingPassed ? 'text-green-500' : 'text-red-500'
                                        )}
                                    />
                                )
                            }
                        </TabsTrigger>
                    )
                }
                <TabsTrigger value="mock" className="text-xs gap-1">
                    <Mic className="w-3 h-3" />
                    Mock
                </TabsTrigger>
            </TabsList>

            {/* NOTES TAB - Unified view merging Resources, Videos, Docs, Flashcards */}
            <TabsContent value="notes" className="flex-1 overflow-hidden m-0">
                <PathfinderNotesTab
                    subGoalId={subGoalId}
                    subGoalTitle={subGoalTitle}
                    goalId={goalId}
                    aiResources={aiResources}
                />
            </TabsContent>

            {/* QUIZ TAB */}
            <TabsContent value="quiz" className="flex-1 overflow-hidden m-0 p-4">
                <SubGoalQuizComponent subGoal={subGoal} onComplete={onQuizComplete} />
            </TabsContent>

            {/* CODING TAB */}
            {
                hasCoding && (
                    <TabsContent value="coding" className="flex-1 overflow-hidden m-0 p-4">
                        <SubGoalCodingComponent subGoal={subGoal} onComplete={onCodingComplete} />
                    </TabsContent>
                )
            }

            {/* MOCK PRACTICE TAB */}
            <TabsContent value="mock" className="flex-1 overflow-hidden m-0 p-4">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
                        <Mic className="w-12 h-12 text-violet-500" />
                    </div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                        Mock Interview Practice
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-sm mb-6">
                        Practice your knowledge on &quot;{subGoalTitle}&quot; with an AI voice interview.
                        You&apos;ll be redirected to the interview page.
                    </p>
                    <Button
                        onClick={handleStartMock}
                        disabled={mockLoading}
                        className="bg-violet-600 hover:bg-violet-700 gap-2"
                    >
                        {
                            mockLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )
                        }
                        Start Mock Interview
                    </Button>
                </div>
            </TabsContent>
        </Tabs>
    )
}