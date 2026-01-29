'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Terminal, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
    Lightbulb, Code
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { cn } from '@repo/ui/lib/utils'
import type { ThreePhaseCodingQuestion } from '@/actions/(main)/opensource'

interface CodingPhaseProps {
    questions: ThreePhaseCodingQuestion[]
    answers: Record<string, string>
    onAnswerChange: (questionId: string, answer: string) => void
    isSubmitted: boolean
    results?: { questionId: string; correct: boolean; points: number; feedback: string }[]
}

export default function CodingPhase({
    questions,
    answers,
    onAnswerChange,
    isSubmitted,
    results
}: CodingPhaseProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showHints, setShowHints] = useState<Record<string, boolean>>({})

    const currentQuestion = questions[currentIndex]

    const answeredCount = Object.values(answers).filter(a => a.trim()).length
    const progress = (answeredCount / questions.length) * 100

    const getQuestionResult = useCallback((questionId: string) => {
        return results?.find(r => r.questionId === questionId)
    }, [results])

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30'
            default: return 'bg-neutral-500/20 text-neutral-400'
        }
    }

    const toggleHints = (questionId: string) => {
        setShowHints(prev => ({ ...prev, [questionId]: !prev[questionId] }))
    }

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-neutral-500">No coding questions available</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                        Coding Phase
                    </span>
                    <Badge variant="outline" className="text-xs">
                        {answeredCount}/{questions.length} answered
                    </Badge>
                </div>
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty} • {currentQuestion.points} pts
                </Badge>
            </div>

            <Progress value={progress} className="h-2" />

            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2">
                {questions.map((q, idx) => {
                    const result = getQuestionResult(q.id)
                    const isAnswered = answers[q.id]?.trim()
                    const isCurrent = idx === currentIndex

                    return (
                        <button
                            key={q.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer",
                                isCurrent && "ring-2 ring-green-500 ring-offset-2 ring-offset-neutral-900",
                                isSubmitted && result?.correct && "bg-green-500/20 text-green-400 border border-green-500/30",
                                isSubmitted && result && !result.correct && "bg-red-500/20 text-red-400 border border-red-500/30",
                                !isSubmitted && isAnswered && "bg-green-500/20 text-green-400 border border-green-500/30",
                                !isSubmitted && !isAnswered && "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-600"
                            )}
                        >
                            {idx + 1}
                        </button>
                    )
                })}
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card className="border-neutral-800 bg-neutral-900/50">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs">
                                    <Code className="w-3 h-3 mr-1" />
                                    Git Command
                                </Badge>
                                <span className="text-sm text-neutral-500">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                            </div>
                            <CardTitle className="text-lg text-neutral-100">
                                {currentQuestion.title}
                            </CardTitle>
                            <CardDescription className="text-neutral-400">
                                {currentQuestion.task}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Scenario */}
                            <div className="p-4 rounded-lg bg-neutral-800 border border-neutral-700">
                                <p className="text-sm font-medium text-neutral-300 mb-2">Scenario:</p>
                                <p className="text-sm text-neutral-400">{currentQuestion.scenario}</p>
                            </div>

                            {/* Code Input */}
                            <div>
                                <label className="text-sm font-medium text-neutral-300 mb-2 block">
                                    Your Git Command(s):
                                </label>
                                <Textarea
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => !isSubmitted && onAnswerChange(currentQuestion.id, e.target.value)}
                                    placeholder="git ..."
                                    className="font-mono bg-black border-neutral-700 text-green-400 placeholder:text-neutral-600 min-h-[100px]"
                                    disabled={isSubmitted}
                                />
                            </div>

                            {/* Hints Toggle */}
                            {!isSubmitted && (
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleHints(currentQuestion.id)}
                                        className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 cursor-pointer"
                                    >
                                        <Lightbulb className="w-4 h-4 mr-2" />
                                        {showHints[currentQuestion.id] ? 'Hide Hints' : 'Show Hints'}
                                    </Button>
                                    <AnimatePresence>
                                        {showHints[currentQuestion.id] && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                                            >
                                                <ul className="space-y-2">
                                                    {currentQuestion.hints.map((hint, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-yellow-300">
                                                            <span>💡</span>
                                                            {hint}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Result after submission */}
                            {isSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {(() => {
                                        const result = getQuestionResult(currentQuestion.id)
                                        return (
                                            <div className={cn(
                                                "p-4 rounded-lg border",
                                                result?.correct
                                                    ? "bg-green-500/10 border-green-500/30"
                                                    : "bg-red-500/10 border-red-500/30"
                                            )}>
                                                <div className="flex items-start gap-2">
                                                    {result?.correct ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className={cn(
                                                            "text-sm font-medium mb-1",
                                                            result?.correct ? "text-green-400" : "text-red-400"
                                                        )}>
                                                            {result?.correct ? 'Correct!' : 'Not quite right'}
                                                            <span className="ml-2 text-neutral-400">
                                                                ({result?.points || 0}/{currentQuestion.points} pts)
                                                            </span>
                                                        </p>
                                                        <p className="text-sm text-neutral-400">
                                                            {result?.feedback}
                                                        </p>
                                                        {!result?.correct && (
                                                            <p className="text-sm text-neutral-500 mt-2">
                                                                Expected: <code className="text-green-400">{currentQuestion.expectedCommands[0]}</code>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="gap-2 cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Button>
                <Button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="gap-2 cursor-pointer"
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
