'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Brain, ArrowLeft, Clock, CheckCircle, XCircle, Trophy, Sparkles, AlertCircle, 
    Coins, Loader2
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@repo/ui/components/ui/card'
import { Progress } from '@repo/ui/components/ui/progress'
import { Badge } from '@repo/ui/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group'
import { Label } from '@repo/ui/components/ui/label'
import toast from '@repo/ui/components/ui/sonner'
import { 
    generateProjectQuiz, submitQuizAttempt, getQuizAttempts 
} from '@/actions/(main)/projects/projectv2-quiz.action'
import { 
    QuizClientProps, Quiz, QuizResult, QuizAttempt, QuizQuestion, QuizAnswer 
} from '@/types/project'

export default function QuizClient({ project, existingQuiz, userCredits, previousAttempts: initialAttempts }: QuizClientProps) {
    const [stage, setStage] = useState<'payment' | 'quiz' | 'results'>('payment')
    const [quiz, setQuiz] = useState<Quiz | null>(existingQuiz)
    const [generating, setGenerating] = useState(false)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes
    const [startTime] = useState(Date.now())
    const [submitting, setSubmitting] = useState(false)
    const [result, setResult] = useState<QuizResult | null>(null)
    const [attempts, setAttempts] = useState(initialAttempts)

    // Start quiz if already exists
    useEffect(() => {
        if (existingQuiz) {
            setQuiz(existingQuiz)
            setStage('quiz')
        }
    }, [existingQuiz])

    const handleSubmit = useCallback(async() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000)
        
        setSubmitting(true)
        const result = await submitQuizAttempt(project.slug, answers, timeSpent)
        
        if (result.success && result.attempt) {
            setResult(result.attempt)
            setStage('results')
            toast.success(`Quiz completed! Your score: ${result.attempt.score}%`)
            
            // Refresh attempts
            const attemptsResult = await getQuizAttempts(project.slug)
            if (attemptsResult.success) {
                setAttempts(attemptsResult.attempts || [])
            }
        } else {
            toast.error(result.error || 'Failed to submit quiz')
        }
        setSubmitting(false)
    }, [project?.slug, answers, startTime]);

    // Timer countdown
    useEffect(() => {
        if (stage !== 'quiz') return

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [stage, handleSubmit])

    const handleGenerateQuiz = async () => {
        if (userCredits < 25) {
            toast.error('Insufficient credits! You need 25 credits to generate a quiz.')
            return
        }

        setGenerating(true)
        const result = await generateProjectQuiz(project.slug)
        
        if (result.success && result.quiz) {
            setQuiz(result.quiz)
            setStage('quiz')
            toast.success('Quiz generated successfully!')
        } else {
            toast.error(result.error || 'Failed to generate quiz')
        }
        setGenerating(false)
    }

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const difficultyColors = {
        EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        HARD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    }

    // Payment Stage
    if (stage === 'payment') {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-full backdrop-blur-sm mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Project
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-neutral-50 dark:to-neutral-400 mb-2">
                                Quiz Assessment
                            </h1>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                Test your knowledge of {project.title}
                            </p>
                        </div>

                        {/* Payment Card */}
                        <Card className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Generate AI Quiz
                                </CardTitle>
                                <CardDescription>
                                    Generate 20 personalized quiz questions based on this project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Quiz Features */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">20</div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Questions</div>
                                    </div>
                                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">3</div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Difficulty Levels</div>
                                    </div>
                                    <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">60</div>
                                        <div className="text-sm text-neutral-600 dark:text-neutral-400">Minutes</div>
                                    </div>
                                </div>

                                {/* What you'll get */}
                                <div className="space-y-3">
                                    <p className="font-semibold text-neutral-900 dark:text-white">What you&apos;ll get:</p>
                                    <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>20 AI-generated questions tailored to this project</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>Questions spanning beginner, intermediate, and advanced levels</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>Detailed explanations for each answer</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                            <span>Unlimited retakes to improve your score</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Credits & CTA */}
                                <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Your Credits</p>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                                <Coins className="w-5 h-5 text-yellow-500" />
                                                {userCredits}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Cost</p>
                                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">25 Credits</p>
                                        </div>
                                    </div>

                                    {userCredits < 25 && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                                                    Insufficient Credits
                                                </p>
                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    You need {25 - userCredits} more credits to generate this quiz
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleGenerateQuiz}
                                        disabled={generating || userCredits < 25}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 rounded-xl"
                                        size="lg"
                                    >
                                        {generating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating Quiz...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Quiz for 25 Credits
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Previous Attempts */}
                        {attempts.length > 0 && (
                            <Card className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <CardHeader>
                                    <CardTitle className="text-base">Previous Attempts</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {attempts.map((attempt: QuizAttempt) => (
                                            <div
                                                key={attempt.id}
                                                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            Score: {attempt.score}%
                                                        </p>
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                            {attempt.correctAnswers}/{attempt.totalQuestions} correct
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        )
    }

    // Quiz Stage
    if (stage === 'quiz' && quiz) {
        const question = quiz.questions[currentQuestion]
        const progress = ((currentQuestion + 1) / quiz.totalQuestions) * 100

        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Quiz Assessment
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-full">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Question {currentQuestion + 1} of {quiz.totalQuestions}
                            </span>
                            <span className="text-neutral-600 dark:text-neutral-400">
                                {Math.round(progress)}% Complete
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <Card className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className={`${difficultyColors[question.difficulty as keyof typeof difficultyColors]} px-3 py-1`}>
                                            {question.difficulty}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl leading-relaxed">
                                        {question.prompt}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={answers[question.id]?.toString()}
                                        onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                                    >
                                        <div className="space-y-3">
                                            {question.options.map((option: string, index: number) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                                                        answers[question.id] === index
                                                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                                    }`}
                                                >
                                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                                    <Label
                                                        htmlFor={`option-${index}`}
                                                        className="flex-1 cursor-pointer text-neutral-900 dark:text-white"
                                                    >
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestion === 0}
                            className="rounded-xl"
                        >
                            Previous
                        </Button>
                        
                        {currentQuestion === quiz.totalQuestions - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting || Object.keys(answers).length !== quiz.totalQuestions}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90 rounded-xl"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-4 h-4 mr-2" />
                                        Submit Quiz
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestion(prev => Math.min(quiz.totalQuestions - 1, prev + 1))}
                                className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl"
                            >
                                Next
                            </Button>
                        )}
                    </div>

                    {/* Answered Progress */}
                    <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            Questions Answered: {Object.keys(answers).length}/{quiz.totalQuestions}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {quiz.questions.map((q: QuizQuestion, index: number) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(index)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                        currentQuestion === index
                                            ? 'bg-purple-600 text-white'
                                            : answers[q.id] !== undefined
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Results Stage
    if (stage === 'results' && result) {
        const scoreColor = result.score >= 80 ? 'text-green-600 dark:text-green-400' : 
                          result.score >= 60 ? 'text-blue-600 dark:text-blue-400' : 
                          'text-orange-600 dark:text-orange-400'

        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Results Header */}
                        <Card className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
                            <CardHeader>
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4 mx-auto">
                                    <Trophy className="w-10 h-10 text-white" />
                                </div>
                                <CardTitle className="text-3xl mb-2">Quiz Completed!</CardTitle>
                                <CardDescription>Here are your results</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-6xl font-bold ${scoreColor} mb-4`}>
                                    {result.score}%
                                </div>
                                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                    You got {result.correctAnswers} out of {result.totalQuestions} questions correct
                                </p>
                            </CardContent>
                        </Card>

                        {/* Detailed Answers */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                Answer Review
                            </h2>
                            {result.answers.map((answer: QuizAnswer, index: number) => {
                                const question = quiz && quiz?.questions.find((q: QuizQuestion) => q.id === answer.questionId)
                                return (
                                    <Card key={answer.questionId} className="bg-white dark:bg-neutral-900 shadow-xl rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    Question {index + 1}
                                                </span>
                                                {answer.isCorrect ? (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Correct
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Incorrect
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardTitle className="text-lg">{question?.prompt}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                {question?.options.map((option: string, optIndex: number) => (
                                                    <div
                                                        key={optIndex}
                                                        className={`p-3 rounded-lg border-2 ${
                                                            optIndex === answer.correctAnswer
                                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                                : optIndex === answer.selectedAnswer && !answer.isCorrect
                                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                                : 'border-neutral-200 dark:border-neutral-800'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {optIndex === answer.correctAnswer && (
                                                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            )}
                                                            {optIndex === answer.selectedAnswer && !answer.isCorrect && (
                                                                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                            )}
                                                            <span className={
                                                                optIndex === answer.correctAnswer 
                                                                    ? 'text-green-900 dark:text-green-100 font-medium'
                                                                    : optIndex === answer.selectedAnswer && !answer.isCorrect
                                                                    ? 'text-red-900 dark:text-red-100'
                                                                    : 'text-neutral-600 dark:text-neutral-400'
                                                            }>
                                                                {option}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {answer.explanation && (
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm text-blue-900 dark:text-blue-100">
                                                        <strong>Explanation:</strong> {answer.explanation}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Link href={`/projects/${project.slug}`} className="flex-1">
                                <Button variant="outline" className="w-full rounded-xl">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Project
                                </Button>
                            </Link>
                            <Button
                                onClick={() => {
                                    setStage('quiz')
                                    setCurrentQuestion(0)
                                    setAnswers({})
                                    setTimeLeft(3600)
                                    setResult(null)
                                }}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 rounded-xl"
                            >
                                Retake Quiz
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return null
}
