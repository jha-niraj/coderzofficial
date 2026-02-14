'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    CheckCircle2, XCircle, Clock, ArrowRight, ArrowLeft, Flag, Brain,
    RotateCcw
} from 'lucide-react'
import { VerificationSectionStatus } from '@repo/prisma/client'
import {
    submitVerificationQuiz, retryVerificationSection
} from '@/actions/(main)/pathfinder'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'

interface Question {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    difficulty: string
    category: string
    codeSnippet?: string | null
}

interface QuizVerificationProps {
    goalId: string
    questions: Question[]
    status: VerificationSectionStatus
    score: number | null
    attempts: number
}

export function QuizVerification({ goalId, questions, status, score, attempts }: QuizVerificationProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [flagged, setFlagged] = useState<Set<number>>(new Set())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [quizStarted, setQuizStarted] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(questions.length * 60) // 1 min per question
    const [startTime, setStartTime] = useState<number | null>(null)
    const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({})
    const [lastQuestionTime, setLastQuestionTime] = useState<number | null>(null)

    // Track time per question
    useEffect(() => {
        if (!quizStarted) return

        const now = Date.now()
        if (lastQuestionTime !== null) {
            const timeSpent = Math.round((now - lastQuestionTime) / 1000)
            setQuestionTimes(prev => ({
                ...prev,
                [currentQuestion - 1 >= 0 ? currentQuestion - 1 : currentQuestion]: (prev[currentQuestion - 1 >= 0 ? currentQuestion - 1 : currentQuestion] || 0) + timeSpent
            }))
        }
        setLastQuestionTime(now)
    }, [currentQuestion, quizStarted, lastQuestionTime])

    const startQuiz = () => {
        setQuizStarted(true)
        setStartTime(Date.now())
        setLastQuestionTime(Date.now())
    }

    const selectAnswer = (optionIndex: number) => {
        if (quizCompleted) return
        setAnswers(prev => ({
            ...prev,
            [currentQuestion]: optionIndex
        }))
    }

    const toggleFlag = () => {
        setFlagged(prev => {
            const next = new Set(prev)
            if (next.has(currentQuestion)) {
                next.delete(currentQuestion)
            } else {
                next.add(currentQuestion)
            }
            return next
        })
    }

    const goToQuestion = (index: number) => {
        setCurrentQuestion(index)
    }

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return
        setIsSubmitting(true)
        setQuizCompleted(true)

        const totalTime = startTime ? Math.round((Date.now() - startTime) / 1000) : timeLeft

        const answerData = questions.map((q, i) => ({
            questionId: q.id,
            selectedAnswer: answers[i] ?? -1,
            isCorrect: answers[i] === q.correctAnswer,
            timeTaken: questionTimes[i] || 0
        }))

        try {
            const result = await submitVerificationQuiz({
                goalId,
                answers: answerData,
                totalTime
            })

            if (result.success) {
                toast.success(`Quiz completed! Score: ${result.score}%`)
            } else {
                toast.error(result.error || 'Failed to submit quiz')
            }
        } catch {
            toast.error('Failed to submit quiz')
        }

        setIsSubmitting(false)
    }, [answers, goalId, questions, questionTimes, startTime, timeLeft, isSubmitting])

    // Timer
    useEffect(() => {
        if (!quizStarted || quizCompleted) return

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [quizStarted, quizCompleted, handleSubmit])

    const handleRetry = async () => {
        const result = await retryVerificationSection(goalId, 'quiz')
        if (result.success) {
            // Reset state
            setCurrentQuestion(0)
            setAnswers({})
            setFlagged(new Set())
            setQuizStarted(false)
            setQuizCompleted(false)
            setTimeLeft(questions.length * 60)
            setStartTime(null)
            setQuestionTimes({})
            setLastQuestionTime(null)
            toast.success('Quiz reset. You can try again!')
        } else {
            toast.error(result.error || 'Failed to retry')
        }
    }

    // Show completed state if already completed
    if (status === 'COMPLETED') {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Quiz Passed!</h3>
                    <p className="text-neutral-500 mb-4">You scored {score}%</p>
                    <Badge variant="secondary">Attempts: {attempts}</Badge>
                </div>
            </div>
        )
    }

    // Show failed state
    if (status === 'FAILED') {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Quiz Not Passed</h3>
                    <p className="text-neutral-500 mb-4">You scored {score}%. You need 70% to pass.</p>
                    <div className="flex items-center justify-center gap-4">
                        <Badge variant="secondary">Attempts: {attempts}</Badge>
                        <Button onClick={handleRetry}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Show start screen
    if (!quizStarted) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                        <Brain className="w-10 h-10 text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Quiz Verification</h3>
                    <p className="text-neutral-500 mb-6">
                        Answer {questions.length} questions to prove your knowledge. You need 70% to pass.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 mb-6">
                        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{questions.length}</div>
                            <div className="text-xs text-neutral-500">Questions</div>
                        </div>
                        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{Math.round(questions.length * 60 / 60)}m</div>
                            <div className="text-xs text-neutral-500">Time Limit</div>
                        </div>
                        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">70%</div>
                            <div className="text-xs text-neutral-500">To Pass</div>
                        </div>
                    </div>
                    <Button onClick={startQuiz} size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600">
                        Start Quiz
                    </Button>
                </div>
            </div>
        )
    }

    const question = questions[currentQuestion]
    const answeredCount = Object.keys(answers).length
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    if (!question) {
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-500">
                No questions available.
            </div>
        )
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Badge variant="outline">{currentQuestion + 1} of {questions.length}</Badge>
                        <Badge variant="secondary" className="capitalize">{question.difficulty.toLowerCase()}</Badge>
                        <Badge variant="secondary">{question.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                            timeLeft < 60 ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-neutral-100 dark:bg-neutral-800"
                        )}>
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-medium">
                                {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                            </span>
                        </div>
                        <Button
                            variant={flagged.has(currentQuestion) ? "default" : "outline"}
                            size="sm"
                            onClick={toggleFlag}
                        >
                            <Flag className="w-4 h-4 mr-1" />
                            {flagged.has(currentQuestion) ? 'Flagged' : 'Flag'}
                        </Button>
                    </div>
                </div>
                <ScrollArea className="flex-1 p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-6">
                                {question.question}
                            </h3>

                            {
                                question.codeSnippet && (
                                    <pre className="p-4 rounded-lg bg-neutral-900 text-neutral-100 text-sm overflow-x-auto mb-6">
                                        <code>{question.codeSnippet}</code>
                                    </pre>
                                )
                            }

                            <div className="space-y-3">
                                {
                                    question.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => selectAnswer(index)}
                                            className={cn(
                                                "w-full p-4 rounded-xl border-2 text-left transition-all",
                                                answers[currentQuestion] === index
                                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                                    answers[currentQuestion] === index
                                                        ? "bg-violet-500 text-white"
                                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                                )}>
                                                    {String.fromCharCode(65 + index)}
                                                </div>
                                                <span className="text-neutral-900 dark:text-white">{option}</span>
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </ScrollArea>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => goToQuestion(currentQuestion - 1)}
                        disabled={currentQuestion === 0}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </Button>
                    <Progress value={(answeredCount / questions.length) * 100} className="w-32 h-2" />
                    {
                        currentQuestion === questions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-violet-600 to-purple-600"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => goToQuestion(currentQuestion + 1)}
                            >
                                Next
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )
                    }
                </div>
            </div>
            <div className="w-64 border-l border-neutral-200 dark:border-neutral-800 p-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-4">Questions</h4>
                <div className="grid grid-cols-5 gap-2">
                    {
                        questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToQuestion(index)}
                                className={cn(
                                    "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                                    currentQuestion === index
                                        ? "bg-violet-500 text-white"
                                        : answers[index] !== undefined
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
                                    flagged.has(index) && "ring-2 ring-yellow-500"
                                )}
                            >
                                {index + 1}
                            </button>
                        ))
                    }
                </div>
                <div className="mt-6 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30" />
                        <span className="text-neutral-500">Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800" />
                        <span className="text-neutral-500">Unanswered</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800 ring-2 ring-yellow-500" />
                        <span className="text-neutral-500">Flagged</span>
                    </div>
                </div>
            </div>
        </div>
    )
}