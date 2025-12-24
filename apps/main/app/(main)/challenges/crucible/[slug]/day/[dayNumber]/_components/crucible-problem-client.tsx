'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { 
    ArrowLeft, Flame, CheckCircle2, Download, Send, 
    Lightbulb, BookOpen, Brain, ChevronRight, ChevronLeft,
    HelpCircle, XCircle, Zap, Code2, PlayCircle, ExternalLink
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Input } from '@repo/ui/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@repo/ui/components/ui/sheet'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { submitCrucibleAnswer, revealCrucibleHint, getUserCrucibleInput } from '@/actions/(main)/challenges/crucible.action'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'

interface LearningModule {
    id: string
    conceptName: string
    explanation: string
    codeExamples?: any
    videoUrl?: string | null
    videoDuration?: number | null
    interactiveCode?: string | null
    interactiveSolution?: string | null
    quizQuestion?: string | null
    quizOptions?: any
    quizAnswer?: number | null
}

interface CrucibleProblem {
    id: string
    dayNumber: number
    title: string
    slug: string
    storyContent: string
    problemContent: string
    sampleInput?: string | null
    sampleOutput?: string | null
    answerType: string
    difficulty: number
    xpReward: number
    hints?: any
    concepts: string[]
    learningModules: LearningModule[]
}

interface UserInput {
    id: string
    inputData: string
}

interface Submission {
    id: string
    answer: string
    isCorrect: boolean
    attemptNumber: number
    xpEarned: number
    submittedAt: Date
}

interface CrucibleProblemClientProps {
    problem: CrucibleProblem
    event: { id: string; name: string; slug: string; themeColor: string }
    userInput: UserInput | null
    submissions: Submission[]
    isSolved: boolean
    user: { id: string; name: string | null; image: string | null }
}

export function CrucibleProblemClient({
    problem,
    event,
    userInput,
    submissions,
    isSolved,
    user
}: CrucibleProblemClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'story' | 'problem' | 'learn'>('story')
    const [answer, setAnswer] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showLearningSheet, setShowLearningSheet] = useState(false)
    const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
    const [revealedHints, setRevealedHints] = useState<number[]>([])
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
    const [downloadingInput, setDownloadingInput] = useState(false)

    const hints = problem.hints ? JSON.parse(problem.hints as string) : []

    const handleSubmit = async () => {
        if (!answer.trim()) {
            toast.error('Please enter your answer')
            return
        }

        setSubmitting(true)
        try {
            const result = await submitCrucibleAnswer(problem.id, answer)
            if (result.success) {
                if (result.isCorrect) {
                    toast.success(result.message || '🎉 Correct!', {
                        description: `You earned ${result.xpEarned} XP!`
                    })
                    router.refresh()
                } else {
                    toast.error(result.message || 'Incorrect. Try again!')
                }
            } else {
                if (result.alreadySolved) {
                    toast.info('Already solved!')
                } else {
                    toast.error(result.error || 'Failed to submit')
                }
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDownloadInput = async () => {
        setDownloadingInput(true)
        try {
            let inputData = userInput?.inputData
            
            if (!inputData) {
                const result = await getUserCrucibleInput(problem.id)
                if (result.success) {
                    inputData = result.data
                } else {
                    toast.error('Failed to get input')
                    return
                }
            }

            // Create and download file
            const blob = new Blob([inputData!], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `day${problem.dayNumber}-input.txt`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            
            toast.success('Input downloaded!')
        } catch {
            toast.error('Failed to download input')
        } finally {
            setDownloadingInput(false)
        }
    }

    const handleRevealHint = async (index: number) => {
        if (revealedHints.includes(index)) return

        const hint = hints[index]
        if (hint.xpCost > 0) {
            const result = await revealCrucibleHint(problem.id, index)
            if (!result.success) {
                toast.error(result.error || 'Failed to get hint')
                return
            }
        }
        
        setRevealedHints([...revealedHints, index])
    }

    const openLearningModule = (module: LearningModule) => {
        setSelectedModule(module)
        setShowLearningSheet(true)
    }

    const checkQuizAnswer = (moduleId: string, selectedIndex: number, correctAnswer: number) => {
        setQuizAnswers({ ...quizAnswers, [moduleId]: selectedIndex })
        if (selectedIndex === correctAnswer) {
            toast.success('Correct! 🎉')
        } else {
            toast.error('Not quite right. Try again!')
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-5xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={`/challenges/crucible/${event.slug}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
                            <div>
                                <p className="text-xs text-neutral-500">
                                    {event.name}
                                </p>
                                <h1 className="font-semibold text-neutral-900 dark:text-white">
                                    Day {problem.dayNumber}: {problem.title}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isSolved && (
                                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Solved
                                </Badge>
                            )}
                            <Badge 
                                variant="outline" 
                                style={{ borderColor: event.themeColor, color: event.themeColor }}
                            >
                                <Zap className="w-3 h-3 mr-1" />
                                {problem.xpReward} XP
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Content Area */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                            <TabsList className="grid grid-cols-3 mb-6">
                                <TabsTrigger value="story" className="gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    Story
                                </TabsTrigger>
                                <TabsTrigger value="problem" className="gap-1">
                                    <Brain className="w-4 h-4" />
                                    Problem
                                </TabsTrigger>
                                <TabsTrigger value="learn" className="gap-1">
                                    <Lightbulb className="w-4 h-4" />
                                    Learn
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="story" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" style={{ color: event.themeColor }} />
                                            The Story
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <ReactMarkdown>{problem.storyContent}</ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="problem" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Brain className="w-5 h-5" style={{ color: event.themeColor }} />
                                            The Problem
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <ReactMarkdown>{problem.problemContent}</ReactMarkdown>
                                        </div>

                                        {/* Sample Input/Output */}
                                        {(problem.sampleInput || problem.sampleOutput) && (
                                            <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                                <h4 className="font-semibold">Example</h4>
                                                {problem.sampleInput && (
                                                    <div>
                                                        <p className="text-sm text-neutral-500 mb-1">Sample Input:</p>
                                                        <pre className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-sm overflow-x-auto">
                                                            {problem.sampleInput}
                                                        </pre>
                                                    </div>
                                                )}
                                                {problem.sampleOutput && (
                                                    <div>
                                                        <p className="text-sm text-neutral-500 mb-1">Expected Output:</p>
                                                        <pre className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-sm">
                                                            {problem.sampleOutput}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="learn" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5" style={{ color: event.themeColor }} />
                                            Concepts That Might Help
                                        </CardTitle>
                                        <CardDescription>
                                            Optional learning modules to help you solve this problem
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {problem.learningModules.length === 0 ? (
                                            <p className="text-neutral-500 text-center py-8">
                                                No learning modules for this problem.
                                            </p>
                                        ) : (
                                            <div className="grid gap-3">
                                                {problem.learningModules.map((module) => (
                                                    <motion.div
                                                        key={module.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <button
                                                            onClick={() => openLearningModule(module)}
                                                            className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all text-left group"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div 
                                                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                                        style={{ backgroundColor: `${event.themeColor}20` }}
                                                                    >
                                                                        <Brain className="w-5 h-5" style={{ color: event.themeColor }} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-semibold text-neutral-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                                            {module.conceptName}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                                            {module.videoUrl && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <PlayCircle className="w-3 h-3" />
                                                                                    Video
                                                                                </span>
                                                                            )}
                                                                            {module.quizQuestion && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <HelpCircle className="w-3 h-3" />
                                                                                    Quiz
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                                                            </div>
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Input Download */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Download className="w-5 h-5" style={{ color: event.themeColor }} />
                                    Your Input
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full gap-2"
                                    variant="outline"
                                    onClick={handleDownloadInput}
                                    disabled={downloadingInput}
                                >
                                    {downloadingInput ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Download Input
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-neutral-500 mt-2 text-center">
                                    Your input is unique. Use it to solve the problem.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Submit Answer */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Send className="w-5 h-5" style={{ color: event.themeColor }} />
                                    Submit Answer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {isSolved ? (
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-semibold">Solved!</span>
                                        </div>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-300">
                                            Great job! You've solved this problem.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <Input
                                            placeholder="Enter your answer"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        />
                                        <Button
                                            className="w-full"
                                            style={{ backgroundColor: event.themeColor }}
                                            onClick={handleSubmit}
                                            disabled={submitting || !answer.trim()}
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                    Checking...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}

                                {/* Previous Attempts */}
                                {submissions.length > 0 && (
                                    <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                        <p className="text-xs text-neutral-500 mb-2">
                                            Attempts: {submissions.length}
                                        </p>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                            {submissions.slice(0, 5).map((sub) => (
                                                <div 
                                                    key={sub.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-2 rounded text-xs",
                                                        sub.isCorrect
                                                            ? "bg-emerald-50 dark:bg-emerald-900/20"
                                                            : "bg-neutral-50 dark:bg-neutral-900"
                                                    )}
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {sub.isCorrect ? (
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3 text-red-500" />
                                                        )}
                                                        {sub.answer}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Hints */}
                        {hints.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-amber-500" />
                                        Hints
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible>
                                        {hints.map((hint: any, index: number) => (
                                            <AccordionItem key={index} value={`hint-${index}`}>
                                                <AccordionTrigger className="hover:no-underline text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>Hint {index + 1}</span>
                                                        {hint.xpCost > 0 && !revealedHints.includes(index) && (
                                                            <Badge variant="outline" className="text-xs">
                                                                -{hint.xpCost} XP
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    {revealedHints.includes(index) ? (
                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                            {hint.text}
                                                        </p>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRevealHint(index)}
                                                        >
                                                            {hint.xpCost > 0 ? `Reveal (-${hint.xpCost} XP)` : 'Reveal'}
                                                        </Button>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        )}

                        {/* Navigation */}
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex gap-2">
                                    {problem.dayNumber > 1 && (
                                        <Link href={`/challenges/crucible/${event.slug}/day/${problem.dayNumber - 1}`} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Prev
                                            </Button>
                                        </Link>
                                    )}
                                    {isSolved && (
                                        <Link href={`/challenges/crucible/${event.slug}/day/${problem.dayNumber + 1}`} className="flex-1">
                                            <Button className="w-full" style={{ backgroundColor: event.themeColor }}>
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Learning Module Sheet */}
            <Sheet open={showLearningSheet} onOpenChange={setShowLearningSheet}>
                <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                    {selectedModule && (
                        <>
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Brain className="w-5 h-5" style={{ color: event.themeColor }} />
                                    {selectedModule.conceptName}
                                </SheetTitle>
                                <SheetDescription>
                                    Learn this concept to help with the problem
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Explanation */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-xs font-bold text-rose-600">1</span>
                                        Explanation
                                    </h4>
                                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                        <ReactMarkdown>{selectedModule.explanation}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Video */}
                                {selectedModule.videoUrl && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-xs font-bold text-rose-600">2</span>
                                            Video
                                        </h4>
                                        <a 
                                            href={selectedModule.videoUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            <PlayCircle className="w-8 h-8 text-red-500" />
                                            <span className="font-medium">Watch Video</span>
                                            <ExternalLink className="w-4 h-4 ml-auto text-neutral-400" />
                                        </a>
                                    </div>
                                )}

                                {/* Code Examples */}
                                {selectedModule.codeExamples && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-xs font-bold text-rose-600">3</span>
                                            Code Examples
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(JSON.parse(selectedModule.codeExamples as string) as Record<string, string>).map(([lang, code]) => (
                                                <div key={lang}>
                                                    <p className="text-xs text-neutral-500 uppercase mb-1">{lang}</p>
                                                    <pre className="p-4 bg-neutral-900 dark:bg-neutral-950 text-neutral-100 rounded-lg overflow-x-auto text-sm">
                                                        <code>{code}</code>
                                                    </pre>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quiz */}
                                {selectedModule.quizQuestion && selectedModule.quizOptions && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-xs font-bold text-rose-600">4</span>
                                            Quick Check
                                        </h4>
                                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg space-y-3">
                                            <p className="font-medium">{selectedModule.quizQuestion}</p>
                                            <div className="space-y-2">
                                                {(JSON.parse(selectedModule.quizOptions as string) as string[]).map((option, idx) => {
                                                    const isSelected = quizAnswers[selectedModule.id] === idx
                                                    const isCorrect = selectedModule.quizAnswer === idx
                                                    const showResult = quizAnswers[selectedModule.id] !== undefined

                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => checkQuizAnswer(selectedModule.id, idx, selectedModule.quizAnswer!)}
                                                            disabled={showResult && isSelected && isCorrect}
                                                            className={cn(
                                                                "w-full p-3 rounded-lg text-left text-sm transition-all",
                                                                showResult && isSelected
                                                                    ? isCorrect
                                                                        ? "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500"
                                                                        : "bg-red-100 dark:bg-red-900/30 border-2 border-red-500"
                                                                    : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
                                                            )}
                                                        >
                                                            {option}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button 
                                    className="w-full" 
                                    onClick={() => setShowLearningSheet(false)}
                                    style={{ backgroundColor: event.themeColor }}
                                >
                                    Got it! Back to Problem
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}


