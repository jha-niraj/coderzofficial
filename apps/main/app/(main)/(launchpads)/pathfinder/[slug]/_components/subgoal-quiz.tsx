'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@repo/ui/components/ui/button'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Brain, CheckCircle2, XCircle, ArrowRight, ArrowLeft,
    Trophy, RefreshCcw, Loader2
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import { submitSubGoalQuiz } from '@/actions/(main)/pathfinder/subgoals.action'

interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
}

interface SubGoal {
    id: string
    title: string
    aiQuizQuestions: unknown
    quizCompleted: boolean
    quizScore: number | null
}

interface SubGoalQuizProps {
    subGoal: SubGoal
    onComplete: () => void
}

export function SubGoalQuiz({ subGoal, onComplete }: SubGoalQuizProps) {
    const questions = (subGoal.aiQuizQuestions as QuizQuestion[]) || []
    
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [showResult, setShowResult] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ score: number; correctCount: number } | null>(null)
    const [showExplanation, setShowExplanation] = useState(false)

    const currentQuestion = questions[currentIndex] as QuizQuestion | undefined
    const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
    const isAnswered = selectedAnswer !== undefined
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

    // If already completed, show result
    if (subGoal.quizCompleted && subGoal.quizScore !== null && !showResult) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                    <Trophy className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    Quiz Completed!
                </h3>
                <p className="text-neutral-500 mb-4">
                    You scored <span className="font-bold text-green-600">{subGoal.quizScore}%</span> on this quiz.
                </p>
                <Button
                    variant="outline"
                    onClick={() => {
                        setAnswers({})
                        setCurrentIndex(0)
                        setShowResult(false)
                    }}
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                </Button>
            </div>
        )
    }

    if (questions.length === 0 || !currentQuestion) {
        return (
            <div className="h-full flex items-center justify-center text-neutral-500">
                No quiz questions available.
            </div>
        )
    }

    const handleSelect = (optionIndex: number) => {
        if (showExplanation || !currentQuestion) return
        setAnswers({ ...answers, [currentQuestion.id]: optionIndex })
        setShowExplanation(true)
    }

    const handleNext = () => {
        setShowExplanation(false)
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1)
        } else {
            handleSubmit()
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setShowExplanation(false)
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const answerArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer,
            }))
            
            const response = await submitSubGoalQuiz(subGoal.id, answerArray)
            if (response.success) {
                setResult({ score: response.score!, correctCount: response.correctCount! })
                setShowResult(true)
                onComplete()
            }
        } catch (error) {
            console.error('Error submitting quiz:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (showResult && result) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center mb-4",
                        result.score >= 70 ? "bg-green-100 dark:bg-green-900/30" : "bg-orange-100 dark:bg-orange-900/30"
                    )}
                >
                    {result.score >= 70 ? (
                        <Trophy className="w-12 h-12 text-green-500" />
                    ) : (
                        <Brain className="w-12 h-12 text-orange-500" />
                    )}
                </motion.div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    {result.score >= 70 ? 'Great Job!' : 'Keep Practicing!'}
                </h3>
                <p className="text-neutral-500 mb-2">
                    You got <span className="font-bold">{result.correctCount}</span> out of <span className="font-bold">{questions.length}</span> questions correct.
                </p>
                <Badge 
                    variant="secondary" 
                    className={cn(
                        "text-lg px-4 py-1 mb-6",
                        result.score >= 70 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    )}
                >
                    {result.score}%
                </Badge>
                <Button
                    variant="outline"
                    onClick={() => {
                        setAnswers({})
                        setCurrentIndex(0)
                        setShowResult(false)
                        setResult(null)
                    }}
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Retake Quiz
                </Button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Progress */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-1.5" />
            </div>

            {/* Question */}
            <ScrollArea className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                    <Brain className="w-5 h-5 text-violet-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                        {currentQuestion.question}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === index
                                const isCorrect = currentQuestion.correctAnswer === index
                                const showCorrectness = showExplanation

                                return (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleSelect(index)}
                                        disabled={showExplanation}
                                        whileHover={!showExplanation ? { scale: 1.01 } : {}}
                                        whileTap={!showExplanation ? { scale: 0.99 } : {}}
                                        className={cn(
                                            "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                                            showCorrectness && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                                            showCorrectness && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950/30",
                                            !showCorrectness && isSelected && "border-violet-500 bg-violet-50 dark:bg-violet-950/30",
                                            !showCorrectness && !isSelected && "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600",
                                            showExplanation && "cursor-default"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
                                            showCorrectness && isCorrect && "bg-green-500 text-white",
                                            showCorrectness && isSelected && !isCorrect && "bg-red-500 text-white",
                                            !showCorrectness && isSelected && "bg-violet-500 text-white",
                                            !showCorrectness && !isSelected && "bg-neutral-100 dark:bg-neutral-800"
                                        )}>
                                            {showCorrectness && isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : showCorrectness && isSelected && !isCorrect ? (
                                                <XCircle className="w-5 h-5" />
                                            ) : (
                                                String.fromCharCode(65 + index)
                                            )}
                                        </div>
                                        <span className="text-neutral-900 dark:text-white">{option}</span>
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Explanation */}
                        {showExplanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-4 rounded-xl border-2",
                                    selectedAnswer === currentQuestion.correctAnswer
                                        ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                                        : "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                                )}
                            >
                                <div className="flex items-start gap-2">
                                    {selectedAnswer === currentQuestion.correctAnswer ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                        <p className={cn(
                                            "font-medium mb-1",
                                            selectedAnswer === currentQuestion.correctAnswer
                                                ? "text-green-700 dark:text-green-400"
                                                : "text-orange-700 dark:text-orange-400"
                                        )}>
                                            {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                                        </p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            {currentQuestion.explanation}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </ScrollArea>

            {/* Navigation */}
            <div className="flex-shrink-0 flex items-center justify-between mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={!isAnswered || isSubmitting}
                    className="bg-violet-600 hover:bg-violet-700"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentIndex === questions.length - 1 ? (
                        <>
                            Finish
                            <Trophy className="w-4 h-4 ml-2" />
                        </>
                    ) : (
                        <>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
