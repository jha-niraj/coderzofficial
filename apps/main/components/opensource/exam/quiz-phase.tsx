'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
    AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group'
import { Label } from '@repo/ui/components/ui/label'
import { cn } from '@repo/ui/lib/utils'
import type { ThreePhaseQuizQuestion } from '@/actions/(main)/opensource'

interface QuizPhaseProps {
    questions: ThreePhaseQuizQuestion[]
    answers: Record<string, number>
    onAnswerChange: (questionId: string, answer: number) => void
    isSubmitted: boolean
    results?: { questionId: string; correct: boolean; points: number }[]
}

export default function QuizPhase({
    questions,
    answers,
    onAnswerChange,
    isSubmitted,
    results
}: QuizPhaseProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentQuestion = questions[currentIndex]

    const answeredCount = Object.keys(answers).length
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

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-neutral-500">No quiz questions available</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                        Quiz Phase
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
                    const isAnswered = answers[q.id] !== undefined
                    const isCurrent = idx === currentIndex

                    return (
                        <button
                            key={q.id}
                            onClick={() => setCurrentIndex(idx)}
                            className={cn(
                                "w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer",
                                isCurrent && "ring-2 ring-purple-500 ring-offset-2 ring-offset-neutral-900",
                                isSubmitted && result?.correct && "bg-green-500/20 text-green-400 border border-green-500/30",
                                isSubmitted && result && !result.correct && "bg-red-500/20 text-red-400 border border-red-500/30",
                                !isSubmitted && isAnswered && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
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
                                <Badge variant="outline" className="text-xs capitalize">
                                    {currentQuestion.category}
                                </Badge>
                                <span className="text-sm text-neutral-500">
                                    Question {currentIndex + 1} of {questions.length}
                                </span>
                            </div>
                            <CardTitle className="text-lg text-neutral-100">
                                {currentQuestion.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={answers[currentQuestion.id]?.toString() ?? ''}
                                onValueChange={(v) => !isSubmitted && onAnswerChange(currentQuestion.id, parseInt(v))}
                                className="space-y-3"
                                disabled={isSubmitted}
                            >
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = answers[currentQuestion.id] === idx
                                    const result = getQuestionResult(currentQuestion.id)
                                    const isCorrect = isSubmitted && idx === currentQuestion.correctAnswer
                                    const isWrong = isSubmitted && isSelected && !result?.correct

                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex items-center space-x-3 p-4 rounded-lg border transition-all",
                                                !isSubmitted && isSelected && "border-purple-500 bg-purple-500/10",
                                                !isSubmitted && !isSelected && "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50",
                                                isCorrect && "border-green-500 bg-green-500/10",
                                                isWrong && "border-red-500 bg-red-500/10",
                                                !isSubmitted && "cursor-pointer"
                                            )}
                                            onClick={() => !isSubmitted && onAnswerChange(currentQuestion.id, idx)}
                                        >
                                            <RadioGroupItem 
                                                value={idx.toString()} 
                                                id={`q-${currentQuestion.id}-${idx}`}
                                                disabled={isSubmitted}
                                            />
                                            <Label
                                                htmlFor={`q-${currentQuestion.id}-${idx}`}
                                                className={cn(
                                                    "flex-1 text-base",
                                                    !isSubmitted && "cursor-pointer",
                                                    isCorrect && "text-green-400",
                                                    isWrong && "text-red-400"
                                                )}
                                            >
                                                {option}
                                            </Label>
                                            {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            {isWrong && <XCircle className="w-5 h-5 text-red-500" />}
                                        </div>
                                    )
                                })}
                            </RadioGroup>

                            {/* Explanation after submission */}
                            {isSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-400 mb-1">Explanation</p>
                                            <p className="text-sm text-blue-300/80">{currentQuestion.explanation}</p>
                                        </div>
                                    </div>
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
