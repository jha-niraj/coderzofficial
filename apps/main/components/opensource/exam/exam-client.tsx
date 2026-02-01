'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Brain, Terminal, Mic, CheckCircle2, XCircle, Trophy,
    Loader2, ArrowLeft, Send, Award, Home
} from 'lucide-react'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import {
    validateQuizPhase, validateCodingPhase, completeThreePhaseExam,
    type ThreePhaseExam
} from '@/actions/(main)/opensource'

import QuizPhase from './quiz-phase'
import CodingPhase from './coding-phase'
import VoicePhase from './voice-phase'

interface ExamClientProps {
    exam: ThreePhaseExam
}

interface PhaseResults {
    quiz: {
        score: number
        maxScore: number
        percentage: number
        results: { questionId: string; correct: boolean; points: number }[]
    } | null
    coding: {
        score: number
        maxScore: number
        percentage: number
        results: { questionId: string; correct: boolean; points: number; feedback: string }[]
    } | null
    voice: number | null
}

export default function ExamClient({ exam }: ExamClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('quiz')

    // Answers state
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
    const [codingAnswers, setCodingAnswers] = useState<Record<string, string>>({})

    // Phase completion state
    const [phaseResults, setPhaseResults] = useState<PhaseResults>({
        quiz: null,
        coding: null,
        voice: null
    })

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [finalResult, setFinalResult] = useState<{
        totalScore: number
        passed: boolean
        certificateId?: string
        breakdown: {
            quiz: { score: number; weighted: number }
            coding: { score: number; weighted: number }
            voice: { score: number; weighted: number }
        }
    } | null>(null)

    // Calculate progress for each phase
    const quizProgress = (Object.keys(quizAnswers).length / exam.quizPhase.questions.length) * 100
    const codingProgress = (Object.values(codingAnswers).filter(a => a.trim()).length / exam.codingPhase.questions.length) * 100
    // Voice progress is tracked via phaseResults.voice

    // Check if all phases are complete
    const allPhasesComplete = phaseResults.quiz !== null && phaseResults.coding !== null && phaseResults.voice !== null

    // Handle quiz answer change
    const handleQuizAnswer = useCallback((questionId: string, answer: number) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: answer }))
    }, [])

    // Handle coding answer change
    const handleCodingAnswer = useCallback((questionId: string, answer: string) => {
        setCodingAnswers(prev => ({ ...prev, [questionId]: answer }))
    }, [])

    // Handle voice completion
    const handleVoiceComplete = useCallback((score: number) => {
        setPhaseResults(prev => ({ ...prev, voice: score }))
    }, [])

    // Submit quiz phase
    const submitQuizPhase = async () => {
        if (Object.keys(quizAnswers).length < exam.quizPhase.questions.length) {
            toast.error('Please answer all quiz questions before submitting')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await validateQuizPhase(exam.quizPhase.questions, quizAnswers)
            if (result.success) {
                setPhaseResults(prev => ({
                    ...prev,
                    quiz: {
                        score: result.score,
                        maxScore: result.maxScore,
                        percentage: result.percentage,
                        results: result.results
                    }
                }))
                toast.success(`Quiz submitted! Score: ${result.percentage}%`)
            }
        } catch (error) {
            console.error('Error submitting quiz:', error)
            toast.error('Failed to submit quiz')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Submit coding phase
    const submitCodingPhase = async () => {
        const answeredCount = Object.values(codingAnswers).filter(a => a.trim()).length
        if (answeredCount < exam.codingPhase.questions.length) {
            toast.error('Please answer all coding questions before submitting')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await validateCodingPhase(exam.codingPhase.questions, codingAnswers)
            if (result.success) {
                setPhaseResults(prev => ({
                    ...prev,
                    coding: {
                        score: result.score,
                        maxScore: result.maxScore,
                        percentage: result.percentage,
                        results: result.results
                    }
                }))
                toast.success(`Coding submitted! Score: ${result.percentage}%`)
            }
        } catch (error) {
            console.error('Error submitting coding:', error)
            toast.error('Failed to submit coding answers')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Complete the entire exam
    const completeExam = async () => {
        if (!allPhasesComplete) {
            toast.error('Please complete all phases before finishing the exam')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await completeThreePhaseExam({
                quizScore: phaseResults.quiz!.score,
                quizMaxScore: phaseResults.quiz!.maxScore,
                codingScore: phaseResults.coding!.score,
                codingMaxScore: phaseResults.coding!.maxScore,
                voiceScore: phaseResults.voice!
            })

            if (result.success) {
                setFinalResult({
                    totalScore: result.totalScore,
                    passed: result.passed,
                    certificateId: result.certificateId,
                    breakdown: result.breakdown
                })
                setIsCompleted(true)

                if (result.passed) {
                    toast.success('🎉 Congratulations! You passed the certification exam!')
                } else {
                    toast.error('You did not pass. Keep learning and try again!')
                }
            }
        } catch (error) {
            console.error('Error completing exam:', error)
            toast.error('Failed to complete exam')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Completed state
    if (isCompleted && finalResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 py-8">
                <div className="container max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card className={cn(
                            "border-2 bg-neutral-900/80 backdrop-blur",
                            finalResult.passed ? "border-green-500/50" : "border-red-500/50"
                        )}>
                            <CardHeader className="text-center pb-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.2 }}
                                    className={cn(
                                        "mx-auto mb-4 p-6 rounded-full w-fit",
                                        finalResult.passed
                                            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20"
                                            : "bg-gradient-to-br from-red-500/20 to-orange-500/20"
                                    )}
                                >
                                    {
                                        finalResult.passed ? (
                                            <Trophy className="h-16 w-16 text-green-400" />
                                        ) : (
                                            <XCircle className="h-16 w-16 text-red-400" />
                                        )
                                    }
                                </motion.div>
                                <CardTitle className="text-3xl text-white">
                                    {finalResult.passed ? '🎉 Congratulations!' : 'Keep Learning!'}
                                </CardTitle>
                                <CardDescription className="text-lg mt-2 text-white/70">
                                    {
                                        finalResult.passed
                                            ? "You've earned your Git Certification!"
                                            : "You need 80% to pass. Try again after reviewing the material."
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="text-center">
                                    <div className={cn(
                                        "text-7xl font-bold mb-2",
                                        finalResult.passed ? "text-green-400" : "text-red-400"
                                    )}>
                                        {finalResult.totalScore}%
                                    </div>
                                    <p className="text-white/60">Total Score (80% required to pass)</p>
                                    <Progress
                                        value={finalResult.totalScore}
                                        className={cn(
                                            "h-3 mt-4 max-w-md mx-auto bg-white/10",
                                            finalResult.passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"
                                        )}
                                    />
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <Card className="bg-blue-500/10 border-blue-500/30">
                                        <CardContent className="pt-6 text-center">
                                            <Brain className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                                            <p className="text-sm text-blue-300 mb-1">Quiz (30%)</p>
                                            <p className="text-2xl font-bold text-white">
                                                {finalResult.breakdown.quiz.score}%
                                            </p>
                                            <p className="text-xs text-blue-400">
                                                +{finalResult.breakdown.quiz.weighted} pts weighted
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-green-500/10 border-green-500/30">
                                        <CardContent className="pt-6 text-center">
                                            <Terminal className="w-8 h-8 mx-auto mb-2 text-green-400" />
                                            <p className="text-sm text-green-300 mb-1">Coding (35%)</p>
                                            <p className="text-2xl font-bold text-white">
                                                {finalResult.breakdown.coding.score}%
                                            </p>
                                            <p className="text-xs text-green-400">
                                                +{finalResult.breakdown.coding.weighted} pts weighted
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-purple-500/10 border-purple-500/30">
                                        <CardContent className="pt-6 text-center">
                                            <Mic className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                                            <p className="text-sm text-purple-300 mb-1">Voice (35%)</p>
                                            <p className="text-2xl font-bold text-white">
                                                {finalResult.breakdown.voice.score}%
                                            </p>
                                            <p className="text-xs text-purple-400">
                                                +{finalResult.breakdown.voice.weighted} pts weighted
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {
                                    finalResult.passed ? (
                                        <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent border border-green-500/30 text-center">
                                            <Award className="h-12 w-12 mx-auto mb-4 text-green-400" />
                                            <h3 className="text-xl font-semibold text-green-300 mb-2">
                                                Certificate Earned!
                                            </h3>
                                            {
                                                finalResult.certificateId && (
                                                    <p className="text-sm text-white/40 mb-4">
                                                        Certificate ID: {finalResult.certificateId}
                                                    </p>
                                                )
                                            }
                                            <Button
                                                onClick={() => router.push('/opensource')}
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 cursor-pointer"
                                            >
                                                Start Contributing
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 justify-center">
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push('/opensource/learn')}
                                                className="cursor-pointer"
                                            >
                                                Review Lessons
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push('/opensource')}
                                                className="cursor-pointer"
                                            >
                                                <Home className="w-4 h-4 mr-2" />
                                                Back to Hub
                                            </Button>
                                        </div>
                                    )
                                }
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black">
            <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
                <div className="container max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/opensource/exam')}
                                className="text-white/70 hover:text-white cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Git Certification Exam</h1>
                                <p className="text-sm text-white/60">Complete all 3 phases to finish</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    phaseResults.quiz ? "bg-green-500" : quizProgress > 0 ? "bg-yellow-500" : "bg-neutral-600"
                                )} />
                                <span className="text-sm text-white/70">Quiz</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    phaseResults.coding ? "bg-green-500" : codingProgress > 0 ? "bg-yellow-500" : "bg-neutral-600"
                                )} />
                                <span className="text-sm text-white/70">Coding</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    phaseResults.voice !== null ? "bg-green-500" : "bg-neutral-600"
                                )} />
                                <span className="text-sm text-white/70">Voice</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container max-w-5xl mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-neutral-900/50 p-1 h-auto">
                        <TabsTrigger
                            value="quiz"
                            className={cn(
                                "flex items-center gap-2 py-3 cursor-pointer data-[state=active]:bg-blue-500/20",
                                phaseResults.quiz && "text-green-400"
                            )}
                        >
                            <Brain className="w-4 h-4" />
                            <span className="hidden sm:inline">Quiz</span>
                            <Badge variant="outline" className="text-xs">
                                {
                                    phaseResults.quiz ? (
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    ) : (
                                        `${Object.keys(quizAnswers).length}/${exam.quizPhase.questions.length}`
                                    )
                                }
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="coding"
                            className={cn(
                                "flex items-center gap-2 py-3 cursor-pointer data-[state=active]:bg-green-500/20",
                                phaseResults.coding && "text-green-400"
                            )}
                        >
                            <Terminal className="w-4 h-4" />
                            <span className="hidden sm:inline">Coding</span>
                            <Badge variant="outline" className="text-xs">
                                {
                                    phaseResults.coding ? (
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    ) : (
                                        `${Object.values(codingAnswers).filter(a => a.trim()).length}/${exam.codingPhase.questions.length}`
                                    )
                                }
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="voice"
                            className={cn(
                                "flex items-center gap-2 py-3 cursor-pointer data-[state=active]:bg-purple-500/20",
                                phaseResults.voice !== null && "text-green-400"
                            )}
                        >
                            <Mic className="w-4 h-4" />
                            <span className="hidden sm:inline">Voice</span>
                            <Badge variant="outline" className="text-xs">
                                {
                                    phaseResults.voice !== null ? (
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    ) : (
                                        '0/1'
                                    )
                                }
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="quiz" className="space-y-6">
                        <QuizPhase
                            questions={exam.quizPhase.questions}
                            answers={quizAnswers}
                            onAnswerChange={handleQuizAnswer}
                            isSubmitted={phaseResults.quiz !== null}
                            results={phaseResults.quiz?.results}
                        />

                        {
                            phaseResults.quiz === null && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={submitQuizPhase}
                                        disabled={isSubmitting || Object.keys(quizAnswers).length < exam.quizPhase.questions.length}
                                        className="bg-blue-600 hover:bg-blue-700 gap-2 cursor-pointer"
                                    >
                                        {
                                            isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )
                                        }
                                        Submit Quiz
                                    </Button>
                                </div>
                            )
                        }
                        {
                            phaseResults.quiz && (
                                <Card className="border-blue-500/30 bg-blue-500/10">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                                <span className="font-medium text-blue-300">Quiz Phase Completed</span>
                                            </div>
                                            <Badge className="bg-blue-500/20 text-blue-300">
                                                Score: {phaseResults.quiz.percentage}%
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        }
                    </TabsContent>
                    <TabsContent value="coding" className="space-y-6">
                        <CodingPhase
                            questions={exam.codingPhase.questions}
                            answers={codingAnswers}
                            onAnswerChange={handleCodingAnswer}
                            isSubmitted={phaseResults.coding !== null}
                            results={phaseResults.coding?.results}
                        />

                        {
                            phaseResults.coding === null && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={submitCodingPhase}
                                        disabled={isSubmitting || Object.values(codingAnswers).filter(a => a.trim()).length < exam.codingPhase.questions.length}
                                        className="bg-green-600 hover:bg-green-700 gap-2 cursor-pointer"
                                    >
                                        {
                                            isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )
                                        }
                                        Submit Coding
                                    </Button>
                                </div>
                            )
                        }
                        {
                            phaseResults.coding && (
                                <Card className="border-green-500/30 bg-green-500/10">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <span className="font-medium text-green-300">Coding Phase Completed</span>
                                            </div>
                                            <Badge className="bg-green-500/20 text-green-300">
                                                Score: {phaseResults.coding.percentage}%
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        }
                    </TabsContent>
                    <TabsContent value="voice" className="space-y-6">
                        <VoicePhase
                            voicePrompt={exam.voicePhase.prompt}
                            topics={exam.voicePhase.topics}
                            isCompleted={phaseResults.voice !== null}
                            score={phaseResults.voice}
                            onComplete={handleVoiceComplete}
                        />
                    </TabsContent>
                </Tabs>

                {
                    allPhasesComplete && !isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8"
                        >
                            <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                                <CardContent className="py-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">All Phases Completed!</h3>
                                            <p className="text-sm text-white/60">Click to submit your exam and see your final score</p>
                                        </div>
                                        <Button
                                            onClick={completeExam}
                                            disabled={isSubmitting}
                                            size="lg"
                                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2 cursor-pointer"
                                        >
                                            {
                                                isSubmitting ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Trophy className="w-5 h-5" />
                                                )
                                            }
                                            Complete Exam
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                }
            </div>
        </div>
    )
}