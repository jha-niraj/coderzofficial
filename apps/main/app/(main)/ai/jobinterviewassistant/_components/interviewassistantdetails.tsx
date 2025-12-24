"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
    Card, CardContent, CardHeader, CardTitle 
} from "@repo/ui/components/ui/card"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { 
    Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@repo/ui/components/ui/accordion"
import { 
    Tabs, TabsContent, TabsList, TabsTrigger 
} from "@repo/ui/components/ui/tabs"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Code, MessageSquare, ArrowLeft, Calendar, Globe, Briefcase, Copy, Check, 
    ChevronRight, Target, Clock, Lightbulb, FileText, Users, Brain, Sparkles, 
    Award, TrendingUp, BarChart3, Send, Loader2, CheckCircle, Mic, Type, Square, 
    Lock, ArrowRight, X, Workflow
} from "lucide-react"
import Link from "next/link"
import { 
    getGenerationBySlug, evaluateCode, generateQuestionAnswer, getQuestionAnswer, 
    transcribeVoiceToText, evaluateUserQuestionResponse, getUserQuestionResponse, 
    getAllUserQuestionResponses 
} from "@/actions/(main)/ai/jobinterview.action"
import { format } from "date-fns"
import toast from '@repo/ui/components/ui/sonner'
import SmoothScroll from "@/components/smoothscroll"

interface Generation {
    id: string
    position: string
    createdAt: string
    jobDescription: string
    companyUrl: string
    companyInfo: any
    generatedContent: {
        technicalQuestions: Array<{
            question: string
            answer?: string
            difficulty: "Easy" | "Medium" | "Hard"
            category: string
        }>
        behavioralQuestions: Array<{
            question: string
            answer?: string
            tips?: string
        }>
        codingQuestions: Array<{
            question: string
            hints?: string[]
            testCases?: Array<{
                input: string
                output: string
                explanation: string
            }>
            difficulty: "Easy" | "Medium" | "Hard"
            questionType?: "DSA" | "Development"
        }>
    }
    includeAnswers: boolean
    includePractice: boolean
    searchHash: string | null
    updatedAt: string
    userId: string
}

interface GenerationResponse {
    success: boolean
    data?: Generation
    error?: string
}

interface CopyButtonProps {
    text: string
    className?: string
}

function CopyButton({ text, className = "" }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success("Copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error("Failed to copy")
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`gap-2 ${className} text-white bg-gray-800 hover:bg-gray-700 hover:text-white`}
        >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
        </Button>
    )
}

// Voice Recorder Component
interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void
    isRecording: boolean
    onStartRecording: () => void
    onStopRecording: () => void
}

function VoiceRecorder({ onRecordingComplete, isRecording, onStartRecording, onStopRecording }: VoiceRecorderProps) {
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } else {
            setRecordingTime(0)
        }
        return () => clearInterval(interval)
    }, [isRecording])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks: BlobPart[] = []

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data)
                }
            }

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' })
                onRecordingComplete(audioBlob)
                stream.getTracks().forEach(track => track.stop())
            }

            recorder.start()
            setMediaRecorder(recorder)
            onStartRecording()
        } catch (error) {
            toast.error("Failed to access microphone")
            console.error('Error accessing microphone:', error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
            onStopRecording()
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-300 text-sm">
                    💡 Keep your answer under 1 minute for optimal processing
                </span>
            </div>
            <div className="flex items-center justify-center gap-3">
                {
                    !isRecording ? (
                        <Button
                            onClick={startRecording}
                            className="gap-2 bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Mic className="h-4 w-4" />
                            Start Recording
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${recordingTime > 60
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className={`text-sm font-medium ${recordingTime > 60
                                    ? 'text-amber-700 dark:text-amber-300'
                                    : 'text-red-700 dark:text-red-300'
                                    }`}>
                                    Recording: {formatTime(recordingTime)}
                                    {recordingTime > 60 && ' ⚠️'}
                                </span>
                            </div>
                            <Button
                                onClick={stopRecording}
                                className="gap-2 bg-gray-600 hover:bg-gray-700 text-white"
                            >
                                <Square className="h-4 w-4" />
                                Stop Recording
                            </Button>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

interface QuestionAnsweringProps {
    question: string
    questionType: 'technical' | 'behavioral'
    questionIndex: number
    interviewId: string
    expertAnswer?: string
    existingResponse?: any
    onResponseSaved?: (response: any) => void
    includePractice: boolean
    includeAnswers: boolean
}

function QuestionAnswering({
    question,
    questionType,
    questionIndex,
    interviewId,
    expertAnswer,
    existingResponse,
    onResponseSaved,
    includePractice,
    includeAnswers
}: QuestionAnsweringProps) {
    const [answerMethod, setAnswerMethod] = useState<'text' | 'voice'>('text')
    const [textAnswer, setTextAnswer] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedback, setFeedback] = useState<any>(null)

    useEffect(() => {
        if (existingResponse) {
            setFeedback(existingResponse)
            setShowFeedback(true)
        }
    }, [existingResponse])

    const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
        try {
            setIsSubmitting(true)
            toast.info("Transcribing your voice...")

            const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' })

            const transcriptionResponse = await transcribeVoiceToText(audioFile)

            if (!transcriptionResponse.success || !transcriptionResponse.data?.transcript) {
                throw new Error(transcriptionResponse.error || 'Failed to transcribe audio')
            }

            const transcript = transcriptionResponse.data.transcript
            toast.success("Voice transcribed successfully!")

            await submitAnswer(transcript, 'voice')

        } catch (error) {
            console.error('Voice transcription error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to process voice recording')
        } finally {
            setIsSubmitting(false)
        }
    }

    const submitAnswer = async (answer: string, method: 'text' | 'voice') => {
        try {
            setIsSubmitting(true)
            toast.info("Evaluating your answer...")

            const response = await evaluateUserQuestionResponse(
                question,
                answer,
                questionType,
                questionIndex,
                interviewId,
                method
            )

            if (!response.success) {
                throw new Error(response.error || 'Failed to evaluate answer')
            }

            setFeedback(response.data)
            setShowFeedback(true)
            setTextAnswer('')
            onResponseSaved?.(response.data)

            toast.success("Answer evaluated successfully!")
        } catch (error) {
            console.error('Answer evaluation error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to evaluate answer')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleTextSubmit = () => {
        if (!textAnswer.trim()) {
            toast.error("Please enter your answer")
            return
        }
        submitAnswer(textAnswer, 'text')
    }

    const hasPracticed = !!existingResponse
    const shouldShowExpertAnswer = includeAnswers && (!includePractice || hasPracticed)

    return (
        <div className="space-y-6">
            {
                includePractice && hasPracticed && (
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <h4 className="text-left font-semibold text-green-800 dark:text-green-300">
                                        Practice Completed!
                                    </h4>
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        Great job! You can now view expert answers and compare your response.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }
            {
                includePractice && (
                    <Card className="border-slate-200 dark:border-slate-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                Your Answer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {
                                !hasPracticed ? (
                                    <>
                                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                            <Button
                                                variant={answerMethod === 'text' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setAnswerMethod('text')}
                                                className="flex-1"
                                            >
                                                <Type className="h-4 w-4 mr-2" />
                                                Text
                                            </Button>
                                            <Button
                                                variant={answerMethod === 'voice' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setAnswerMethod('voice')}
                                                className="flex-1"
                                            >
                                                <Mic className="h-4 w-4 mr-2" />
                                                Voice
                                            </Button>
                                        </div>
                                        {
                                            answerMethod === 'text' && (
                                                <div className="space-y-3">
                                                    <Textarea
                                                        placeholder={`Enter your ${questionType} answer here...`}
                                                        value={textAnswer}
                                                        onChange={(e) => setTextAnswer(e.target.value)}
                                                        className="min-h-[60px] resize-none"
                                                        disabled={isSubmitting}
                                                    />
                                                    <Button
                                                        onClick={handleTextSubmit}
                                                        disabled={isSubmitting || !textAnswer.trim()}
                                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                    >
                                                        {
                                                            isSubmitting ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Evaluating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Send className="h-4 w-4 mr-2" />
                                                                    Submit Answer
                                                                </>
                                                            )
                                                        }
                                                    </Button>
                                                </div>
                                            )
                                        }
                                        {
                                            answerMethod === 'voice' && (
                                                <div className="space-y-3">
                                                    <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center">
                                                        <VoiceRecorder
                                                            onRecordingComplete={handleVoiceRecordingComplete}
                                                            isRecording={isRecording}
                                                            onStartRecording={() => setIsRecording(true)}
                                                            onStopRecording={() => setIsRecording(false)}
                                                        />
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                                                            Click to start recording your answer. We&apos;ll transcribe and evaluate it automatically.
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </>
                                ) : (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-left text-slate-900 dark:text-white mb-2">Your Answer:</h4>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    Method: {existingResponse.answerMethod}
                                                </Badge>
                                                {
                                                    existingResponse.score && (
                                                        <Badge
                                                            className={`text-xs ${existingResponse.score >= 80 ? 'bg-green-100 text-green-800' :
                                                                existingResponse.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}
                                                        >
                                                            Score: {existingResponse.score}/100
                                                        </Badge>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <p className="text-slate-700 text-left dark:text-slate-300 text-sm">
                                            {existingResponse.userAnswer}
                                        </p>
                                    </div>
                                )
                            }
                        </CardContent>
                    </Card>
                )
            }
            {
                showFeedback && feedback && (
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                AI Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {
                                feedback.score !== undefined && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-yellow-600" />
                                            <span className="font-semibold">Score:</span>
                                        </div>
                                        <Badge
                                            className={`text-lg px-3 py-1 ${feedback.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                feedback.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                        >
                                            {feedback.score}/100
                                        </Badge>
                                    </div>
                                )
                            }
                            {
                                feedback.feedback && (
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Detailed Feedback
                                        </h4>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <p className="text-slate-700 text-left dark:text-slate-300 leading-relaxed">
                                                {feedback.feedback}
                                            </p>
                                        </div>
                                    </div>
                                )
                            }
                            <div className="space-y-6">
                                {feedback.strengths?.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-700 rounded-lg p-4 shadow-sm">
                                        <h4 className="text-green-800 dark:text-green-300 font-semibold text-base flex items-center gap-2 mb-3">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                            Strengths
                                        </h4>
                                        <ul className="space-y-2">
                                            {feedback.strengths.map((strength: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle className="h-4 w-4 mt-1 text-green-600 flex-shrink-0" />
                                                    <span className="text-sm text-slate-800 dark:text-slate-300">{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {feedback.improvements?.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-sm">
                                        <h4 className="text-blue-800 dark:text-blue-300 font-semibold text-base flex items-center gap-2 mb-3">
                                            <Target className="h-5 w-5 text-blue-600" />
                                            Areas for Improvement
                                        </h4>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {feedback.improvements.map((improvement: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <ArrowRight className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm text-left text-slate-800 dark:text-slate-300">{improvement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {feedback.comparedToExpert && (
                                    <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-700 rounded-lg p-4 shadow-sm">
                                        <h4 className="text-purple-800 dark:text-purple-300 font-semibold text-base flex items-center gap-2 mb-4">
                                            <Users className="h-5 w-5 text-purple-600" />
                                            Comparison with Expert Answer
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {feedback.comparedToExpert.similarities?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm text-left font-medium text-green-800 dark:text-green-300 mb-2">
                                                        ✅ Similarities
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {feedback.comparedToExpert.similarities.map((similarity: string, index: number) => (
                                                            <li key={index} className="flex items-start gap-3">
                                                                <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                                                                <span className="text-sm text-left text-slate-700 dark:text-slate-300">{similarity}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {feedback.comparedToExpert.missingPoints?.length > 0 && (
                                                <div>
                                                    <h5 className="text-sm text-left font-medium text-red-800 dark:text-red-300 mb-2">
                                                        ❌ Missing Key Points
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {feedback.comparedToExpert.missingPoints.map((point: string, index: number) => (
                                                            <li key={index} className="flex items-start gap-3">
                                                                <X className="h-3 w-3 mt-1 text-red-600 flex-shrink-0" />
                                                                <span className="text-sm text-left text-slate-700 dark:text-slate-300">{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            }
            {
                includePractice && includeAnswers && !hasPracticed && (
                    <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Lock className="h-5 w-5 text-yellow-600" />
                                <div className="text-left">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">
                                        Practice Required
                                    </h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                        Complete your practice above to unlock the expert answer and detailed tips.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }
        </div>
    )
}

function formatAnswer(content: string | string[]) {
    if (Array.isArray(content)) {
        return (
            <ul className="space-y-2 mt-3">
                {
                    content.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{point}</span>
                        </li>
                    ))
                }
            </ul>
        )
    }

    if (content.includes('•') || content.includes('-') || /^\d+\./.test(content)) {
        const lines = content.split('\n').filter(line => line.trim())
        return (
            <ul className="space-y-2 mt-3">
                {
                    lines.map((line, index) => {
                        const cleanLine = line.replace(/^[•\-\d\.]+\s*/, '').trim()
                        if (cleanLine) {
                            return (
                                <li key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{cleanLine}</span>
                                </li>
                            )
                        }
                        return null
                    })
                }
            </ul>
        )
    }

    return <p className="text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">{content}</p>
}

interface AnswerButtonProps {
    questionText: string
    questionType: 'coding'
    interviewId: string
    onAnswerGenerated: (answer: any) => void
    existingAnswer?: any
}

function AnswerButton({ questionText, questionType, interviewId, onAnswerGenerated, existingAnswer }: AnswerButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateAnswer = async () => {
        setIsGenerating(true)
        try {
            const result = await generateQuestionAnswer(questionText, questionType, interviewId)
            if (result.success) {
                onAnswerGenerated(result.data)
                toast.success("Solution generated successfully!")
            } else {
                toast.error(result.error || "Failed to generate solution")
            }
        } catch (error) {
            toast.error("Failed to generate solution")
        } finally {
            setIsGenerating(false)
        }
    }

    if (existingAnswer) {
        return null
    }

    return (
        <Button
            onClick={handleGenerateAnswer}
            disabled={isGenerating}
            size="sm"
            className="gap-2"
        >
            {
                isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <Sparkles className="h-3 w-3" />
                )
            }
            {isGenerating ? "Generating..." : "Generate Solution"}
        </Button>
    )
}

export default function InterviewAssistantDetails({ slug }: { slug: string }) {
    const [generation, setGeneration] = useState<Generation | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("technical")
    const [codeEvaluations, setCodeEvaluations] = useState<Record<string, any>>({})
    const [codingSolutions, setCodingSolutions] = useState<Record<string, any>>({})
    const [userResponses, setUserResponses] = useState<Record<string, any>>({})

    useEffect(() => {
        const fetchGeneration = async () => {
            try {
                const response = (await getGenerationBySlug(slug)) as GenerationResponse
                if (response.success && response.data) {
                    setGeneration(response.data)
                    await loadExistingCodingSolutions(response.data)
                    await loadExistingUserResponses(response.data.id)
                } else {
                    toast.error(response.error || "Failed to fetch generation")
                }
            } catch (error) {
                toast.error("Failed to fetch generation")
            } finally {
                setLoading(false)
            }
        }

        fetchGeneration()
    }, [slug])

    const loadExistingCodingSolutions = async (generation: Generation) => {
        const codingQuestions = generation.generatedContent.codingQuestions.map(q => ({ text: q.question, type: 'coding' }))

        const solutions: Record<string, any> = {}

        const results = await Promise.allSettled(
            codingQuestions.map(async (question) => {
                try {
                    const result = await getQuestionAnswer(question.text, generation.id)
                    if (result.success && result.data) {
                        return { questionText: question.text, solution: result.data }
                    }
                    return null
                } catch (error) {
                    console.log('No existing solution for:', question.text)
                    return null
                }
            })
        )

        results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
                solutions[result.value.questionText] = result.value.solution
            }
        })

        setCodingSolutions(solutions)
    }

    const loadExistingUserResponses = async (interviewId: string) => {
        try {
            const result = await getAllUserQuestionResponses(interviewId)
            if (result.success && result.data) {
                const responsesMap: Record<string, any> = {}
                result.data.forEach((response: any) => {
                    const key = `${response.questionType}-${response.questionIndex}`
                    responsesMap[key] = response
                })
                setUserResponses(responsesMap)
            }
        } catch (error) {
            console.log('No existing user responses found')
        }
    }

    const handleSolutionGenerated = (questionText: string, solution: any) => {
        setCodingSolutions(prev => ({
            ...prev,
            [questionText]: solution
        }))
    }

    const handleResponseSaved = (questionType: string, questionIndex: number, response: any) => {
        const key = `${questionType}-${questionIndex}`
        setUserResponses(prev => ({
            ...prev,
            [key]: response
        }))
    }

    const handleCodeSubmit = async (code: string, language: string, questionText: string) => {
        if (!generation) return

        try {
            const response = await evaluateCode(questionText, code, language, generation.id)
            if (response.success && response.data) {
                setCodeEvaluations(prev => ({
                    ...prev,
                    [questionText]: response.data
                }))
                toast.success("Code evaluated successfully!")
            } else {
                toast.error(response.error || "Failed to evaluate code")
            }
        } catch (error) {
            toast.error("Failed to evaluate code")
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Easy":
                return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
            case "Medium":
                return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
            case "Hard":
                return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading interview questions...</p>
                </div>
            </div>
        )
    }

    if (!generation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Generation not found</h1>
                    <Link href="/ai/jobinterviewassistant">
                        <Button>Go back</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const { technicalQuestions, behavioralQuestions, codingQuestions } = generation.generatedContent

    const tabData = [
        {
            value: "technical",
            label: "Technical",
            icon: Brain,
            count: technicalQuestions?.length || 0,
            color: "from-blue-500 to-indigo-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50",
            activeBg: "bg-blue-500 text-white",
            hoverBg: "hover:bg-blue-50 dark:hover:bg-blue-950/50",
            questions: technicalQuestions
        },
        {
            value: "behavioral",
            label: "Behavioral",
            icon: Users,
            count: behavioralQuestions?.length || 0,
            color: "from-emerald-500 to-teal-600",
            bgColor: "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/50 dark:to-teal-950/50",
            activeBg: "bg-emerald-500 text-white",
            hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/50",
            questions: behavioralQuestions
        }
    ]

    return (
        <SmoothScroll>
            <div className="min-h-screen bg-white dark:bg-neutral-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <Link href="/ai/jobinterviewassistant">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-teal-200 dark:border-teal-700 hover:bg-teal-100/40 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-300 transition-all"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Generator
                                </Button>
                            </Link>
                        </div>
                        <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
                            <div className="bg-gradient-to-br from-teal-100/40 via-emerald-100/30 to-cyan-100/30 dark:from-teal-900/10 dark:via-emerald-900/10 dark:to-cyan-900/10 p-8 border-b border-teal-200 dark:border-teal-800/40 rounded-t-2xl">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg ring-1 ring-teal-400/30">
                                                <Briefcase className="h-6 w-6 text-white" />
                                            </div>
                                            <Badge className="bg-teal-100 hover:text-white text-teal-800 dark:bg-teal-800/30 dark:text-teal-300 border border-teal-200 dark:border-teal-700 px-3 py-1 rounded-md text-sm font-medium">
                                                Interview Preparation
                                            </Badge>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-snug">
                                            {generation.position}
                                        </h1>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                <span>{format(new Date(generation.createdAt), "MMMM d, yyyy")}</span>
                                            </div>
                                            {
                                                generation.companyUrl && (
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                        <Link
                                                            href={generation.companyUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline underline-offset-4 hover:text-teal-700 dark:hover:text-teal-300"
                                                        >
                                                            Company Website
                                                        </Link>
                                                    </div>
                                                )
                                            }
                                            <div className="flex items-center gap-2">
                                                <Target className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                <span>{generation.includeAnswers ? 'With Expert Solutions' : 'Practice Questions'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {
                                            generation.includeAnswers && (
                                                <Badge className="bg-emerald-100 hover:text-white text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-3 py-1 text-sm rounded-md font-medium inline-flex items-center gap-2">
                                                    <Lightbulb className="h-4 w-4" />
                                                    Expert Solutions Included
                                                </Badge>
                                            )
                                        }
                                        {
                                            generation.includePractice && (
                                                <Badge className="bg-emerald-100 hover:text-white text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 px-3 py-1 text-sm rounded-md font-medium inline-flex items-center gap-2">
                                                    <Workflow className="h-4 w-4" />
                                                    Practice Included
                                                </Badge>
                                            )
                                        }
                                        <Badge className="bg-teal-50 hover:text-white text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 border border-teal-200 dark:border-teal-600 px-3 py-1 text-sm rounded-md font-medium">
                                            {
                                                (technicalQuestions?.length || 0) +
                                                (behavioralQuestions?.length || 0) +
                                                (codingQuestions?.length || 0)}{' '}
                                            Total Questions
                                        </Badge>
                                    </div>
                                </div>
                                {
                                    generation.jobDescription && (
                                        <div className="mt-6 p-5 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl backdrop-blur-sm">
                                            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-teal-600" />
                                                Job Description
                                            </h3>
                                            <p className="text-slate-800 dark:text-slate-300 text-sm leading-relaxed line-clamp-3">
                                                {generation.jobDescription}
                                            </p>
                                        </div>
                                    )
                                }
                            </div>
                        </Card>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            {
                                codingQuestions && codingQuestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-6"
                                    >
                                        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-700">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                                                            <Code className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl text-left font-bold text-slate-900 dark:text-white mb-1">
                                                                Coding Challenges
                                                            </h3>
                                                            <p className="text-slate-600 dark:text-slate-400">
                                                                Practice algorithms and data structures with AI evaluation
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                                    {codingQuestions.length} Questions
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    Interactive Editor
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                                                        <Link href={`/ai/jobinterviewassistant/${slug}/codingquestions`}>
                                                            <Code className="h-4 w-4 mr-2" />
                                                            Start Coding Challenge
                                                            <ArrowRight className="h-4 w-4 ml-2" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            }
                            <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-xl rounded-2xl mb-8">
                                {
                                    tabData.map((tab) => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-300 data-[state=active]:shadow-lg ${activeTab === tab.value
                                                ? `bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg`
                                                : `hover:bg-teal-50 dark:hover:bg-teal-900/20 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400`
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${activeTab === tab.value
                                                    ? 'bg-white/20'
                                                    : 'bg-teal-100 dark:bg-teal-900/30'
                                                    }`}>
                                                    <tab.icon className={`h-5 w-5 ${activeTab === tab.value
                                                        ? 'text-white'
                                                        : 'text-teal-600 dark:text-teal-400'
                                                        }`} />
                                                </div>
                                                <div className="text-left">
                                                    <div className={`font-semibold text-sm ${activeTab === tab.value
                                                        ? 'text-white'
                                                        : 'text-slate-900 dark:text-white'
                                                        }`}>
                                                        {tab.label} Questions
                                                    </div>
                                                    <Badge
                                                        className={`text-xs hover:text-white px-2 py-1 mt-1 ${activeTab === tab.value
                                                            ? 'bg-white/20 text-white border-white/20'
                                                            : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800'
                                                            }`}
                                                    >
                                                        {tab.count} Questions
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className={`text-xs text-center max-w-40 ${activeTab === tab.value
                                                ? 'text-white/80'
                                                : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                {tab.value === 'technical' && 'Deep-dive into role-specific technical concepts'}
                                                {tab.value === 'behavioral' && 'Master soft skills and behavioral scenarios'}
                                            </div>
                                        </TabsTrigger>
                                    ))
                                }
                            </TabsList>
                            <TabsContent value="technical" className="space-y-0">
                                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-teal-50 to-emerald-100 dark:from-teal-950/30 dark:to-emerald-950/30 p-8 border-b border-teal-200 dark:border-teal-700">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl shadow-lg">
                                                <Brain className="h-7 w-7 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                                    Technical Questions
                                                </div>
                                                <div className="text-slate-600 dark:text-slate-400 font-medium">
                                                    Deep-dive into role-specific technical concepts and system design
                                                </div>
                                            </div>
                                            <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800 px-4 py-2 text-sm">
                                                {technicalQuestions?.length || 0} Questions
                                            </Badge>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                                                    <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="text-left">
                                                    <h5 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">Think Through This</h5>
                                                    <p className="text-emerald-700 dark:text-emerald-200 text-sm leading-relaxed">
                                                        Consider the technical concepts, implementation details, architecture patterns, and potential edge cases. Think about scalability, performance, and best practices.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <Accordion type="single" collapsible className="space-y-6">
                                            {
                                                technicalQuestions?.map((question, index) => (
                                                    <AccordionItem key={index} value={`technical-${index}`} className="dark:bg-black border-slate-200 dark:border-slate-700">
                                                        <AccordionTrigger className="hover:no-underline group pb-6">
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`p-2 rounded-lg ${getDifficultyColor(question.difficulty)} text-white shadow-lg`}>
                                                                        <Brain className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <h3 className="font-semibold text-slate-900 dark:text-white transition-colors">
                                                                            {index + 1}. {question.question}
                                                                        </h3>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {question.difficulty}
                                                                            </Badge>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {question.category}
                                                                            </Badge>
                                                                            {
                                                                                generation.includePractice && (
                                                                                    <Badge
                                                                                        className={`text-xs ${userResponses[`technical-${index}`]
                                                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                                            }`}
                                                                                    >
                                                                                        {userResponses[`technical-${index}`] ? 'Practiced' : 'Practice Available'}
                                                                                    </Badge>
                                                                                )
                                                                            }
                                                                            {
                                                                                generation.includeAnswers && (!generation.includePractice || userResponses[`technical-${index}`]) && (
                                                                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                                                                                        <Lightbulb className="h-2 w-2 mr-1" />
                                                                                        Expert Answer
                                                                                    </Badge>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 text-slate-400 group-data-[state=open]:rotate-90 transition-transform" />
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-6 pb-6">
                                                            {
                                                                generation?.includePractice && (
                                                                    <div className="mt-6 p-6 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/30 dark:to-emerald-950/30 rounded-xl border border-teal-200/50 dark:border-teal-700/50">
                                                                        <div className="flex items-center gap-2 mb-4">
                                                                            <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                                                Practice Your Answer
                                                                            </h4>
                                                                        </div>
                                                                        <QuestionAnswering
                                                                            question={question.question}
                                                                            questionType="technical"
                                                                            questionIndex={index}
                                                                            interviewId={generation.id}
                                                                            expertAnswer={question.answer}
                                                                            existingResponse={userResponses[`technical-${index}`]}
                                                                            onResponseSaved={(response) => handleResponseSaved('technical', index, response)}
                                                                            includePractice={generation.includePractice}
                                                                            includeAnswers={generation.includeAnswers}
                                                                        />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                question.answer && generation.includeAnswers && userResponses[`technical-${index}`] && (
                                                                    <div className="mt-6">
                                                                        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-teal-200/50 dark:border-teal-700/50 shadow-sm backdrop-blur-sm">
                                                                            <div className="flex items-center justify-between mb-4">
                                                                                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                                                    <Lightbulb className="h-4 w-4 text-emerald-500" />
                                                                                    Expert Answer
                                                                                </h4>
                                                                                <CopyButton text={question.answer} />
                                                                            </div>
                                                                            <div className="prose text-left prose-slate dark:prose-invert max-w-none">
                                                                                {formatAnswer(question.answer)}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))
                                            }
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="behavioral" className="space-y-0">
                                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-50 to-cyan-100 dark:from-emerald-950/30 dark:to-cyan-950/30 p-8 border-b border-emerald-200 dark:border-emerald-700">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-4 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-lg">
                                                <Users className="h-7 w-7 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                                    Behavioral Questions
                                                </div>
                                                <div className="text-slate-600 dark:text-slate-400 font-medium">
                                                    Master soft skills, behavioral scenarios, and cultural fit assessments
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 px-4 py-2 text-sm">
                                                {behavioralQuestions?.length || 0} Questions
                                            </Badge>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
                                                    <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2">STAR Method Framework</h5>
                                                    <p className="text-emerald-700 dark:text-emerald-200 text-sm leading-relaxed mb-3">
                                                        Structure your response using the STAR method for maximum impact:
                                                    </p>
                                                    <div className="space-y-2 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 text-xs px-2 py-1">S</Badge>
                                                            <span className="text-emerald-700 dark:text-emerald-200">Situation - Set the context</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 text-xs px-2 py-1">T</Badge>
                                                            <span className="text-emerald-700 dark:text-emerald-200">Task - Describe your responsibility</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 text-xs px-2 py-1">A</Badge>
                                                            <span className="text-emerald-700 dark:text-emerald-200">Action - Explain what you did</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200 text-xs px-2 py-1">R</Badge>
                                                            <span className="text-emerald-700 dark:text-emerald-200">Result - Share the outcome</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <Accordion type="single" collapsible className="space-y-6">
                                            {
                                                behavioralQuestions?.map((question, index) => (
                                                    <AccordionItem key={index} value={`behavioral-${index}`} className="dark:bg-black border-slate-200 dark:border-slate-700">
                                                        <AccordionTrigger className="hover:no-underline group">
                                                            <div className="flex items-center justify-between w-full pr-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg">
                                                                        <MessageSquare className="h-4 w-4" />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <h3 className="font-semibold text-slate-900 dark:text-white transition-colors">
                                                                            {index + 1}. {question.question}
                                                                        </h3>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                STAR Method
                                                                            </Badge>
                                                                            {
                                                                                generation.includePractice && (
                                                                                    <Badge
                                                                                        className={`text-xs ${userResponses[`behavioral-${index}`]
                                                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                                            }`}
                                                                                    >
                                                                                        {userResponses[`behavioral-${index}`] ? 'Practiced' : 'Practice Available'}
                                                                                    </Badge>
                                                                                )
                                                                            }
                                                                            {
                                                                                generation.includeAnswers && (!generation.includePractice || userResponses[`behavioral-${index}`]) && (
                                                                                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                                                                                        <Lightbulb className="h-2 w-2 mr-1" />
                                                                                        Expert Answer
                                                                                    </Badge>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 text-slate-400 group-data-[state=open]:rotate-90 transition-transform" />
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-6 pb-6">
                                                            {
                                                                generation?.includePractice && (
                                                                    <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                                                                        <div className="flex items-center gap-2 mb-4">
                                                                            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                                                Practice Your Answer
                                                                            </h4>
                                                                        </div>
                                                                        <QuestionAnswering
                                                                            question={question.question}
                                                                            questionType="behavioral"
                                                                            questionIndex={index}
                                                                            interviewId={generation.id}
                                                                            expertAnswer={question.answer}
                                                                            existingResponse={userResponses[`behavioral-${index}`]}
                                                                            onResponseSaved={(response) => handleResponseSaved('behavioral', index, response)}
                                                                            includePractice={generation.includePractice}
                                                                            includeAnswers={generation.includeAnswers}
                                                                        />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                generation.includeAnswers && userResponses[`behavioral-${index}`] && question.answer && (
                                                                    <div className="mt-6">
                                                                        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm backdrop-blur-sm">
                                                                            <div className="flex items-center justify-between mb-4">
                                                                                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                                                    <Lightbulb className="h-4 w-4 text-emerald-500" />
                                                                                    Sample STAR Answer
                                                                                </h4>
                                                                                <CopyButton text={question.answer} />
                                                                            </div>
                                                                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                                                                {formatAnswer(question.answer)}
                                                                            </div>
                                                                        </div>
                                                                        {
                                                                            question.tips && (
                                                                                <div className="mt-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-5 border border-cyan-200 dark:border-cyan-800">
                                                                                    <div className="flex items-start gap-3">
                                                                                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg shrink-0">
                                                                                            <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <h5 className="font-medium text-cyan-800 dark:text-cyan-300 mb-2">Pro Tips</h5>
                                                                                            {formatAnswer(question.tips)}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    </div>
                                                                )
                                                            }
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))
                                            }
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </div>
        </SmoothScroll>
    )
}