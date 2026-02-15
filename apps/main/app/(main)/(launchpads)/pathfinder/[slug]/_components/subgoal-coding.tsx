'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@repo/ui/components/ui/button'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Code2, Play, CheckCircle2, XCircle, Lightbulb, ChevronDown,
    ChevronUp, Loader2, RefreshCcw
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import CodeEditor from '@/components/main/code-editor'
import { submitSubGoalCoding } from '@/actions/(main)/pathfinder/subgoals.action'
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@repo/ui/components/ui/collapsible'

interface CodingProblem {
    title: string
    description: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    starterCode: string
    hints: string[]
    sampleInput?: string
    sampleOutput?: string
}

interface SubGoal {
    id: string
    title: string
    aiCodingProblem: unknown
    codingCompleted: boolean
    codingPassed: boolean
}

interface SubGoalCodingProps {
    subGoal: SubGoal
    onComplete: () => void
}

interface Feedback {
    passed: boolean
    feedback: string
    suggestions: string[]
    score: number
}

export function SubGoalCoding({ subGoal, onComplete }: SubGoalCodingProps) {
    const problem = subGoal.aiCodingProblem as CodingProblem | null

    const [code, setCode] = useState(problem?.starterCode || '')
    const [language] = useState('javascript')
    const [hintsOpen, setHintsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<Feedback | null>(null)
    const [showResult, setShowResult] = useState(false)

    if (!problem) {
        return (
            <div className="h-full flex items-center justify-center text-neutral-500">
                No coding problem available for this task.
            </div>
        )
    }

    // If already completed, show result
    if (subGoal.codingCompleted && !showResult) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                    subGoal.codingPassed
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-orange-100 dark:bg-orange-900/30"
                )}>
                    {
                        subGoal.codingPassed ? (
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        ) : (
                            <XCircle className="w-10 h-10 text-orange-500" />
                        )
                    }
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    {subGoal.codingPassed ? 'Challenge Completed!' : 'Not Quite Right'}
                </h3>
                <p className="text-neutral-500 mb-4">
                    {
                        subGoal.codingPassed
                            ? 'Great work on solving this coding challenge!'
                            : 'You can try again to improve your solution.'
                    }
                </p>
                <Button
                    variant="outline"
                    onClick={() => {
                        setCode(problem.starterCode || '')
                        setFeedback(null)
                        setShowResult(false)
                    }}
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            </div>
        )
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const response = await submitSubGoalCoding(subGoal.id, code, language)
            if (response.success) {
                setFeedback({
                    passed: response.passed!,
                    feedback: response.feedback!,
                    suggestions: response.suggestions || [],
                    score: response.score!,
                })
                setShowResult(true)
                onComplete()
            }
        } catch (error) {
            console.error('Error submitting code:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const difficultyColors = {
        EASY: 'bg-green-100 text-green-700',
        MEDIUM: 'bg-orange-100 text-orange-700',
        HARD: 'bg-red-100 text-red-700',
    }

    if (showResult && feedback) {
        return (
            <div className="h-full flex flex-col">
                <ScrollArea className="flex-1">
                    <div className="space-y-4 p-1">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-6 rounded-xl text-center",
                                feedback.passed
                                    ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                                    : "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800"
                            )}
                        >
                            <div className={cn(
                                "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3",
                                feedback.passed ? "bg-green-100" : "bg-orange-100"
                            )}>
                                {
                                    feedback.passed ? (
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    ) : (
                                        <XCircle className="w-8 h-8 text-orange-500" />
                                    )
                                }
                            </div>
                            <h3 className={cn(
                                "text-lg font-bold mb-1",
                                feedback.passed ? "text-green-700" : "text-orange-700"
                            )}>
                                {feedback.passed ? 'Solution Accepted!' : 'Needs Improvement'}
                            </h3>
                            <Badge variant="secondary" className={cn(
                                "text-sm px-3 py-0.5",
                                feedback.passed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                            )}>
                                Score: {feedback.score}%
                            </Badge>
                        </motion.div>
                        <div className="p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <h4 className="font-medium text-neutral-900 dark:text-white mb-2">
                                Feedback
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {feedback.feedback}
                            </p>
                        </div>

                        {
                            feedback.suggestions.length > 0 && (
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                        <Lightbulb className="w-4 h-4" />
                                        Suggestions
                                    </h4>
                                    <ul className="space-y-1">
                                        {
                                            feedback.suggestions.map((suggestion, i) => (
                                                <li key={i} className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
                                                    <span className="text-blue-400">•</span>
                                                    {suggestion}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )
                        }
                    </div>
                </ScrollArea>

                <div className="flex-shrink-0 pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFeedback(null)
                            setShowResult(false)
                        }}
                        className="w-full"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-violet-500" />
                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                {problem.title}
                            </h3>
                        </div>
                        <Badge className={difficultyColors[problem.difficulty]}>
                            {problem.difficulty}
                        </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {problem.description}
                    </p>

                    {
                        (problem.sampleInput || problem.sampleOutput) && (
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {
                                    problem.sampleInput && (
                                        <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-900">
                                            <div className="text-[10px] text-neutral-500 mb-1">Sample Input</div>
                                            <code className="text-xs text-neutral-700 dark:text-neutral-300">{problem.sampleInput}</code>
                                        </div>
                                    )
                                }
                                {
                                    problem.sampleOutput && (
                                        <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-900">
                                            <div className="text-[10px] text-neutral-500 mb-1">Expected Output</div>
                                            <code className="text-xs text-neutral-700 dark:text-neutral-300">{problem.sampleOutput}</code>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {
                        problem.hints.length > 0 && (
                            <Collapsible open={hintsOpen} onOpenChange={setHintsOpen}>
                                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 transition-colors">
                                    <Lightbulb className="w-4 h-4" />
                                    <span>Hints ({problem.hints.length})</span>
                                    {hintsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2">
                                    <div className="p-3 rounded bg-violet-50 dark:bg-violet-950/30 space-y-1">
                                        {
                                            problem.hints.map((hint, i) => (
                                                <p key={i} className="text-xs text-violet-700 dark:text-violet-400 flex items-start gap-2">
                                                    <span className="text-violet-400">{i + 1}.</span>
                                                    {hint}
                                                </p>
                                            ))
                                        }
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        )
                    }
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <CodeEditor
                    code={code}
                    onChange={(newCode: string) => setCode(newCode)}
                    language={language}
                    height="100%"
                    showLanguageSelector={false}
                    className="h-full"
                />
            </div>
            <div className="flex-shrink-0 flex items-center justify-end gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                    variant="outline"
                    onClick={() => setCode(problem.starterCode || '')}
                >
                    Reset Code
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !code.trim()}
                    className="bg-violet-600 hover:bg-violet-700"
                >
                    {
                        isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Evaluating...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Submit Solution
                            </>
                        )
                    }
                </Button>
            </div>
        </div>
    )
}