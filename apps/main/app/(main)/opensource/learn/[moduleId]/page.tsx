'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowLeft, ArrowRight, BookOpen, Copy, Terminal, Check, AlertCircle,
    Loader2, CheckCircle, Clock, Play, Video, HelpCircle, Code
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Card, CardContent
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { cn } from '@repo/ui/lib/utils'
import { useUserStore } from '@/app/store/useUserStore'
import {
    getLearnModule, completeLesson
} from '@/actions/(main)/opensource'
import toast from '@repo/ui/components/ui/sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Quiz, { QuizQuestion, QuizResult } from '@/components/main/quiz'
import LearnCodeEditor from '@/components/opensource/learn-code-editor'

interface TerminalLabStep {
    id: string
    instruction: string
    task: string
    expectedCommands: string[]
    validatePattern?: string
    expectedOutput: string
    hints: string[]
    xpReward: number
}

interface TerminalLab {
    title: string
    description: string
    scenario: {
        currentDirectory: string
        isGitRepo: boolean
        existingFiles?: string[]
    }
    steps: TerminalLabStep[]
    completionCriteria: {
        allStepsComplete: boolean
        maxAttempts: number
    }
}

interface Lesson {
    id: string
    title: string
    description: string | null
    type: string
    content: string | null
    videoUrl: string | null
    quizQuestions: QuizQuestion[] | null
    terminalLab: TerminalLab | null
    passingScore: number
    orderIndex: number
    estimatedMinutes: number
    completion: {
        isCompleted: boolean
        completedAt: Date | null
        score?: number | null
    } | null
}

interface Module {
    id: string
    slug: string
    title: string
    description: string
    icon: string | null
    estimatedMinutes: number
    lessons: Lesson[]
    userProgress: {
        lessonsCompleted: number
        isCompleted: boolean
    } | null
}

export default function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
    const { moduleId } = use(params)
    // const router = useRouter()
    const { user } = useUserStore()
    const [module, setModule] = useState<Module | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
    const [completing, setCompleting] = useState(false)
    const [copiedCode, setCopiedCode] = useState<string | null>(null)
    const [currentTerminalStep, setCurrentTerminalStep] = useState(0)
    const [terminalHistory, setTerminalHistory] = useState<string[]>([])
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [quizScore, setQuizScore] = useState<number | null>(null)

    useEffect(() => {
        async function fetchModule() {
            try {
                const result = await getLearnModule(moduleId)
                if (result.success && result.module) {
                    const moduleData = result.module as Module
                    // Ensure lessons is always an array
                    moduleData.lessons = Array.isArray(moduleData.lessons) ? moduleData.lessons : []
                    setModule(moduleData)
                    // Find first incomplete lesson
                    const firstIncomplete = moduleData.lessons.findIndex(
                        (l: Lesson) => !l.completion?.isCompleted
                    )
                    if (firstIncomplete > 0) {
                        setCurrentLessonIndex(firstIncomplete)
                    }
                }
            } catch (error) {
                console.error('Error fetching module:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchModule()
    }, [moduleId])

    const currentLesson = module?.lessons[currentLessonIndex]
    const completedCount = module?.lessons.filter(l => l.completion?.isCompleted).length || 0
    const progressPercent = module ? Math.round((completedCount / module.lessons.length) * 100) : 0

    const handleCompleteLesson = async () => {
        if (!currentLesson || !user) return

        setCompleting(true)
        try {
            const result = await completeLesson(currentLesson.id, {
                timeSpent: currentLesson.estimatedMinutes * 60
            })

            if (result.success) {
                toast.success('Lesson completed!')
                // Update local state
                setModule(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        lessons: prev.lessons.map(l =>
                            l.id === currentLesson.id
                                ? { ...l, completion: { isCompleted: true, completedAt: new Date() } }
                                : l
                        ),
                        userProgress: {
                            lessonsCompleted: (prev.userProgress?.lessonsCompleted || 0) + 1,
                            isCompleted: completedCount + 1 >= prev.lessons.length
                        }
                    }
                })
                // Move to next lesson
                if (currentLessonIndex < (module?.lessons.length || 0) - 1) {
                    setCurrentLessonIndex(prev => prev + 1)
                }
            } else {
                toast.error(result.error || 'Failed to complete lesson')
            }
        } catch (error) {
            console.log("Failed to complete lesson: " + error);
            toast.error('Failed to complete lesson')
        } finally {
            setCompleting(false)
        }
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        setTimeout(() => setCopiedCode(null), 2000)
    }

    // Reset lesson-specific state when changing lessons
    useEffect(() => {
        setCurrentTerminalStep(0)
        setTerminalHistory([])
        setQuizCompleted(false)
        setQuizScore(null)
    }, [currentLessonIndex])

    // Handle Quiz completion
    const handleQuizComplete = useCallback(async (results: QuizResult) => {
        setQuizCompleted(true)
        setQuizScore(results.scorePercentage)
        
        if (results.scorePercentage >= (currentLesson?.passingScore || 70)) {
            // Auto-complete the lesson if passed
            if (currentLesson && user && !currentLesson.completion?.isCompleted) {
                try {
                    await completeLesson(currentLesson.id, {
                        score: results.scorePercentage,
                        timeSpent: results.totalTimeTaken
                    })
                    toast.success(`Quiz passed with ${results.scorePercentage}%!`)
                    // Update local state
                    setModule(prev => {
                        if (!prev) return prev
                        return {
                            ...prev,
                            lessons: prev.lessons.map(l =>
                                l.id === currentLesson.id
                                    ? { ...l, completion: { isCompleted: true, completedAt: new Date(), score: results.scorePercentage } }
                                    : l
                            )
                        }
                    })
                } catch (error) {
                    console.error('Failed to save quiz completion:', error)
                }
            }
        } else {
            toast.error(`Score: ${results.scorePercentage}%. You need ${currentLesson?.passingScore || 70}% to pass.`)
        }
    }, [currentLesson, user])

    // Handle terminal command for interactive lessons
    const handleTerminalCommand = useCallback(async (command: string): Promise<string> => {
        if (!currentLesson?.terminalLab) return 'No terminal lab configured'
        
        const lab = currentLesson.terminalLab
        const currentStep = lab.steps[currentTerminalStep]
        
        if (!currentStep) {
            return '✅ All steps completed!'
        }

        // Check if command matches expected
        const isCorrect = currentStep.expectedCommands.some(expected => 
            command.toLowerCase().trim().startsWith(expected.toLowerCase().trim())
        ) || (currentStep.validatePattern && command.includes(currentStep.validatePattern))

        if (isCorrect) {
            setTerminalHistory(prev => [...prev, `$ ${command}`, currentStep.expectedOutput])
            
            // Move to next step
            if (currentTerminalStep < lab.steps.length - 1) {
                setCurrentTerminalStep(prev => prev + 1)
                return `${currentStep.expectedOutput}\n\n✅ Step ${currentTerminalStep + 1} completed! +${currentStep.xpReward} XP`
            } else {
                // All steps complete - auto-complete lesson
                if (currentLesson && user && !currentLesson.completion?.isCompleted) {
                    try {
                        await completeLesson(currentLesson.id, {
                            score: 100,
                            timeSpent: currentLesson.estimatedMinutes * 60,
                            commandsRun: terminalHistory
                        })
                        setModule(prev => {
                            if (!prev) return prev
                            return {
                                ...prev,
                                lessons: prev.lessons.map(l =>
                                    l.id === currentLesson.id
                                        ? { ...l, completion: { isCompleted: true, completedAt: new Date(), score: 100 } }
                                        : l
                                )
                            }
                        })
                    } catch (error) {
                        console.error('Failed to save completion:', error)
                    }
                }
                return `${currentStep.expectedOutput}\n\n🎉 Congratulations! All steps completed!`
            }
        } else {
            const hintText = currentStep.hints.length > 0 ? `\n💡 Hint: ${currentStep.hints[0]}` : ''
            return `❌ Command not recognized. Try again.${hintText}`
        }
    }, [currentLesson, currentTerminalStep, user, terminalHistory])

    // Get YouTube video ID from URL
    const getYouTubeId = (url: string): string | null => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
        return match && match[1] ? match[1] : null
    }

    // Get lesson type icon and label
    const getLessonTypeInfo = (type: string) => {
        switch (type) {
            case 'VIDEO':
                return { icon: Video, label: 'Video', color: 'text-red-500' }
            case 'QUIZ':
                return { icon: HelpCircle, label: 'Quiz', color: 'text-blue-500' }
            case 'INTERACTIVE':
                return { icon: Terminal, label: 'Hands-on', color: 'text-green-500' }
            case 'PROJECT':
                return { icon: Code, label: 'Project', color: 'text-purple-500' }
            default:
                return { icon: BookOpen, label: 'Reading', color: 'text-neutral-500' }
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                    <p className="text-neutral-600 dark:text-neutral-400">Loading module...</p>
                </div>
            </div>
        )
    }

    if (!module) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Module Not Found</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            The requested module could not be found.
                        </p>
                        <Link href="/opensource/learn">
                            <Button>Back to Learning</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/opensource/learn">
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    {module.title}
                                </h1>
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                    <span>Lesson {currentLessonIndex + 1} of {module.lessons.length}</span>
                                    <span>•</span>
                                    <span>{progressPercent}% complete</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Progress value={progressPercent} className="w-32 h-2" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto flex">
                <div className="w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-60px)]">
                    <div className="sticky top-16 p-4">
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Lessons</h3>
                        <div className="space-y-1">
                            {
                                module.lessons.map((lesson, index) => {
                                    const isCompleted = lesson.completion?.isCompleted
                                    const isCurrent = index === currentLessonIndex

                                    const typeInfo = getLessonTypeInfo(lesson.type)
                                    const TypeIcon = typeInfo.icon
                                    
                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setCurrentLessonIndex(index)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all cursor-pointer",
                                                isCurrent
                                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                                                isCompleted
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                                                    : isCurrent
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                                            )}>
                                                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={cn(
                                                    "text-sm font-medium truncate",
                                                    isCurrent ? "text-purple-700 dark:text-purple-400" : "text-neutral-700 dark:text-neutral-300"
                                                )}>
                                                    {lesson.title}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                    <TypeIcon className={cn("w-3 h-3", typeInfo.color)} />
                                                    <span>{typeInfo.label}</span>
                                                    <span>•</span>
                                                    <span>{lesson.estimatedMinutes} min</span>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentLesson?.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-3xl mx-auto"
                        >
                            {
                                currentLesson && (
                                    <>
                                        <div className="mb-8">
                                            <div className="flex items-center gap-2 mb-2">
                                                {
                                                    (() => {
                                                        const typeInfo = getLessonTypeInfo(currentLesson.type)
                                                        const TypeIcon = typeInfo.icon
                                                        return (
                                                            <Badge variant="outline" className="gap-1">
                                                                <TypeIcon className={cn("w-3 h-3", typeInfo.color)} />
                                                                {typeInfo.label}
                                                            </Badge>
                                                        )
                                                    })()
                                                }
                                                <Badge variant="outline">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {currentLesson.estimatedMinutes} min
                                                </Badge>
                                                {
                                                    currentLesson.completion?.isCompleted && (
                                                        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Completed
                                                            {currentLesson.completion.score !== undefined && currentLesson.completion.score !== null && (
                                                                <span className="ml-1">({currentLesson.completion.score}%)</span>
                                                            )}
                                                        </Badge>
                                                    )
                                                }
                                            </div>
                                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {currentLesson.title}
                                            </h2>
                                            {
                                                currentLesson.description && (
                                                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                                                        {currentLesson.description}
                                                    </p>
                                                )
                                            }
                                        </div>

                                        {/* VIDEO Lesson */}
                                        {
                                            currentLesson.type === 'VIDEO' && currentLesson.videoUrl && (
                                                <Card className="mb-8 overflow-hidden">
                                                    <div className="aspect-video bg-black">
                                                        {
                                                            getYouTubeId(currentLesson.videoUrl) ? (
                                                                <iframe
                                                                    src={`https://www.youtube.com/embed/${getYouTubeId(currentLesson.videoUrl)}`}
                                                                    title={currentLesson.title}
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                    className="w-full h-full"
                                                                />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-white">
                                                                    <a 
                                                                        href={currentLesson.videoUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 cursor-pointer"
                                                                    >
                                                                        <Play className="w-8 h-8" />
                                                                        Watch Video
                                                                    </a>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                    {
                                                        currentLesson.content && (
                                                            <CardContent className="p-6">
                                                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                        {currentLesson.content}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </CardContent>
                                                        )
                                                    }
                                                </Card>
                                            )
                                        }

                                        {/* QUIZ Lesson */}
                                        {
                                            currentLesson.type === 'QUIZ' && currentLesson.quizQuestions && (
                                                <Card className="mb-8">
                                                    <CardContent className="p-0">
                                                        {
                                                            quizCompleted ? (
                                                                <div className="p-8 text-center">
                                                                    <div className={cn(
                                                                        "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                                                                        (quizScore || 0) >= (currentLesson.passingScore || 70)
                                                                            ? "bg-green-100 dark:bg-green-900/30"
                                                                            : "bg-red-100 dark:bg-red-900/30"
                                                                    )}>
                                                                        {
                                                                            (quizScore || 0) >= (currentLesson.passingScore || 70) ? (
                                                                                <CheckCircle className="w-10 h-10 text-green-600" />
                                                                            ) : (
                                                                                <AlertCircle className="w-10 h-10 text-red-600" />
                                                                            )
                                                                        }
                                                                    </div>
                                                                    <h3 className="text-2xl font-bold mb-2">
                                                                        {(quizScore || 0) >= (currentLesson.passingScore || 70) ? 'Quiz Passed!' : 'Quiz Not Passed'}
                                                                    </h3>
                                                                    <p className="text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
                                                                        {quizScore}%
                                                                    </p>
                                                                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                                                        Passing score: {currentLesson.passingScore || 70}%
                                                                    </p>
                                                                    {
                                                                        (quizScore || 0) < (currentLesson.passingScore || 70) && (
                                                                            <Button 
                                                                                onClick={() => {
                                                                                    setQuizCompleted(false)
                                                                                    setQuizScore(null)
                                                                                }}
                                                                                className="cursor-pointer"
                                                                            >
                                                                                Try Again
                                                                            </Button>
                                                                        )
                                                                    }
                                                                </div>
                                                            ) : (
                                                                <Quiz
                                                                    quizId={currentLesson.id}
                                                                    questions={currentLesson.quizQuestions}
                                                                    title={currentLesson.title}
                                                                    mode="practice"
                                                                    immediateResults={true}
                                                                    allowSkip={true}
                                                                    allowHints={true}
                                                                    allowPrevious={true}
                                                                    showProgress={true}
                                                                    onComplete={handleQuizComplete}
                                                                />
                                                            )
                                                        }
                                                    </CardContent>
                                                </Card>
                                            )
                                        }

                                        {/* INTERACTIVE Lesson (Terminal) */}
                                        {
                                            currentLesson.type === 'INTERACTIVE' && currentLesson.terminalLab && (
                                                <div className="mb-8 space-y-4">
                                                    {/* Task Description Card */}
                                                    <Card>
                                                        <CardContent className="p-6">
                                                            <h3 className="text-lg font-semibold mb-2">
                                                                {currentLesson.terminalLab.title}
                                                            </h3>
                                                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                                                {currentLesson.terminalLab.description}
                                                            </p>
                                                            
                                                            {/* Progress Steps */}
                                                            <div className="space-y-2 mb-4">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span>Progress</span>
                                                                    <span>{currentTerminalStep} / {currentLesson.terminalLab.steps.length} steps</span>
                                                                </div>
                                                                <Progress 
                                                                    value={(currentTerminalStep / currentLesson.terminalLab.steps.length) * 100} 
                                                                    className="h-2" 
                                                                />
                                                            </div>

                                                            {/* Current Step */}
                                                            {
                                                                currentLesson.terminalLab.steps[currentTerminalStep] && (
                                                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                                                            Step {currentTerminalStep + 1}: {currentLesson.terminalLab.steps[currentTerminalStep].task}
                                                                        </p>
                                                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                                                            {currentLesson.terminalLab.steps[currentTerminalStep].instruction}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            }
                                                        </CardContent>
                                                    </Card>

                                                    {/* Terminal */}
                                                    <LearnCodeEditor
                                                        mode="terminal"
                                                        height="350px"
                                                        terminalPrompt="$ "
                                                        terminalHistory={terminalHistory}
                                                        onTerminalCommand={handleTerminalCommand}
                                                        hints={currentLesson.terminalLab.steps[currentTerminalStep]?.hints || []}
                                                        showExpandButton={true}
                                                    />

                                                    {/* Reading content if available */}
                                                    {
                                                        currentLesson.content && (
                                                            <Card>
                                                                <CardContent className="p-6">
                                                                    <div className="prose prose-neutral dark:prose-invert max-w-none prose-sm">
                                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                            {currentLesson.content}
                                                                        </ReactMarkdown>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }

                                        {/* READING Lesson (default) */}
                                        {
                                            (currentLesson.type === 'READING' || (!currentLesson.type && currentLesson.content)) && (
                                                <Card className="mb-8">
                                                    <CardContent className="p-8">
                                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                                            <ReactMarkdown
                                                                remarkPlugins={[remarkGfm]}
                                                                components={{
                                                                    code({ className, children, ...props }) {
                                                                        const match = /language-(\w+)/.exec(className || '')
                                                                        const codeString = String(children).replace(/\n$/, '')

                                                                        if (match) {
                                                                            return (
                                                                                <div className="relative group">
                                                                                    <pre className="bg-neutral-900 dark:bg-neutral-950 rounded-lg p-4 overflow-x-auto">
                                                                                        <code className={className} {...props}>
                                                                                            {children}
                                                                                        </code>
                                                                                    </pre>
                                                                                    <button
                                                                                        onClick={() => copyToClipboard(codeString)}
                                                                                        className="absolute top-2 right-2 p-2 rounded-md bg-neutral-800 hover:bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                                    >
                                                                                        {
                                                                                            copiedCode === codeString ? (
                                                                                                <Check className="w-4 h-4 text-green-400" />
                                                                                            ) : (
                                                                                                <Copy className="w-4 h-4 text-neutral-400" />
                                                                                            )
                                                                                        }
                                                                                    </button>
                                                                                </div>
                                                                            )
                                                                        }
                                                                        return (
                                                                            <code className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-sm" {...props}>
                                                                                {children}
                                                                            </code>
                                                                        )
                                                                    },
                                                                    blockquote({ children }) {
                                                                        return (
                                                                            <blockquote className="border-l-4 border-purple-500 pl-4 italic text-neutral-600 dark:text-neutral-400">
                                                                                {children}
                                                                            </blockquote>
                                                                        )
                                                                    }
                                                                }}
                                                            >
                                                                {currentLesson.content || 'No content available for this lesson.'}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        }
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentLessonIndex(prev => prev - 1)}
                                                disabled={currentLessonIndex === 0}
                                                className="gap-2 cursor-pointer"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-3">
                                                {
                                                    /* Show Mark as Complete only for READING and VIDEO lessons */
                                                    !currentLesson.completion?.isCompleted && 
                                                    user && 
                                                    (currentLesson.type === 'READING' || currentLesson.type === 'VIDEO') && (
                                                        <Button
                                                            onClick={handleCompleteLesson}
                                                            disabled={completing}
                                                            className="bg-green-600 hover:bg-green-700 text-white gap-2 cursor-pointer"
                                                        >
                                                            {
                                                                completing ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <Check className="w-4 h-4" />
                                                                )
                                                            }
                                                            Mark as Complete
                                                        </Button>
                                                    )
                                                }
                                                {
                                                    currentLessonIndex < module.lessons.length - 1 ? (
                                                        <Button
                                                            onClick={() => setCurrentLessonIndex(prev => prev + 1)}
                                                            className="gap-2 cursor-pointer"
                                                        >
                                                            Next Lesson
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <Link href="/opensource/exam">
                                                            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 cursor-pointer">
                                                                Take Certification Exam
                                                                <ArrowRight className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}