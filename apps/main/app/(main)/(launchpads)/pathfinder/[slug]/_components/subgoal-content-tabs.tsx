'use client'

import {
    Tabs, TabsList, TabsTrigger, TabsContent
} from '@repo/ui/components/ui/tabs'
import {
    Brain, Code2, CheckCircle2, StickyNote, ListVideo, Layers
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import type { SubGoalResources } from '@/app/store/pathfinderStore'
import { PathfinderNotesTab } from './pathfinder-notes-tab'
import { PathfinderVideosTab } from './pathfinder-videos-tab'
import { PathfinderFlashcardsTab } from './pathfinder-flashcards-tab'

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
    return (
        <Tabs defaultValue="notes" className="flex-1 flex flex-col overflow-hidden h-full">
            <TabsList className="flex-shrink-0 mx-4 mt-4 h-auto flex-wrap gap-1">
                <TabsTrigger value="notes" className="text-xs gap-1">
                    <StickyNote className="w-3 h-3" />
                    Notes
                </TabsTrigger>
                <TabsTrigger value="videos" className="text-xs gap-1">
                    <ListVideo className="w-3 h-3" />
                    Videos
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="text-xs gap-1">
                    <Layers className="w-3 h-3" />
                    Flashcards
                </TabsTrigger>
                <TabsTrigger value="quiz" className="text-xs gap-1">
                    <Brain className="w-3 h-3" />
                    Quiz
                    {quizCompleted && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                </TabsTrigger>
                {hasCoding && (
                    <TabsTrigger value="coding" className="text-xs gap-1">
                        <Code2 className="w-3 h-3" />
                        Coding
                        {codingCompleted && (
                            <CheckCircle2
                                className={cn(
                                    'w-3 h-3',
                                    codingPassed ? 'text-green-500' : 'text-red-500'
                                )}
                            />
                        )}
                    </TabsTrigger>
                )}
            </TabsList>

            <TabsContent value="notes" className="flex-1 overflow-hidden m-0">
                <PathfinderNotesTab
                    subGoalId={subGoalId}
                    subGoalTitle={subGoalTitle}
                    goalId={goalId}
                    aiResources={aiResources}
                />
            </TabsContent>

            <TabsContent value="videos" className="flex-1 overflow-hidden m-0">
                <PathfinderVideosTab aiResources={aiResources} />
            </TabsContent>

            <TabsContent value="flashcards" className="flex-1 overflow-hidden m-0">
                <PathfinderFlashcardsTab
                    subGoalId={subGoalId}
                    subGoalTitle={subGoalTitle}
                    aiResources={aiResources}
                />
            </TabsContent>

            <TabsContent value="quiz" className="flex-1 overflow-hidden m-0 p-4">
                <SubGoalQuizComponent subGoal={subGoal} onComplete={onQuizComplete} />
            </TabsContent>

            {hasCoding && (
                <TabsContent value="coding" className="flex-1 overflow-hidden m-0 p-4">
                    <SubGoalCodingComponent subGoal={subGoal} onComplete={onCodingComplete} />
                </TabsContent>
            )}
        </Tabs>
    )
}
