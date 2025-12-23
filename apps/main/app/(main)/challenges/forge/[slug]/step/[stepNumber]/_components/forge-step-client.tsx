'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { 
    ArrowLeft, ArrowRight, BookOpen, Send, CheckCircle2, 
    XCircle, Lightbulb, Play, Code2, HelpCircle, Zap,
    ChevronRight, ChevronLeft, X, ExternalLink, PlayCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { submitForgeStep, revealForgeHint } from '@/actions/(main)/challenges/forge.action'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface LearningModule {
    id: string
    conceptName: string
    quickExplanation: string
    codeExamples?: any
    videoUrl?: string | null
    videoDuration?: number | null
    interactiveCode?: string | null
    interactiveSolution?: string | null
    interactiveHint?: string | null
    quizQuestion?: string | null
    quizOptions?: any
    quizAnswer?: number | null
    externalLinks?: any
}

interface ForgeStep {
    id: string
    stepNumber: number
    title: string
    slug: string
    storyContent: string
    missionContent: string
    deliverableType: string
    expectedAnswer?: string | null
    xpReward: number
    hints?: any
    track: {
        id: string
        name: string
        slug: string
        themeColor: string
        creditsRequired: number
        isFree: boolean
    }
    learningModules: LearningModule[]
}

interface Submission {
    id: string
    submission: string
    status: string
    feedback?: string | null
    xpEarned: number
    attemptNumber: number
    submittedAt: Date
}

interface ForgeStepClientProps {
    step: ForgeStep
    submissions: Submission[]
    user: { id: string; name: string | null; image: string | null }
}

export function ForgeStepClient({
    step,
    submissions,
    user
}: ForgeStepClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'story' | 'mission' | 'learn' | 'submit'>('story')
    const [answer, setAnswer] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showLearningSheet, setShowLearningSheet] = useState(false)
    const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null)
    const [revealedHints, setRevealedHints] = useState<number[]>([])
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})

    const latestSubmission = submissions[0]
    const isCompleted = latestSubmission?.status === 'CORRECT'
    const hints = step.hints ? JSON.parse(step.hints as string) : []

    const handleSubmit = async () => {
        if (!answer.trim()) {
            toast.error('Please enter your answer')
            return
        }

        setSubmitting(true)
        try {
            const result = await submitForgeStep(step.id, answer)
            if (result.success) {
                if (result.isCorrect) {
                    toast.success(`🎉 ${result.feedback}`, {
                        description: `You earned ${result.xpEarned} XP!`
                    })
                    router.refresh()
                } else {
                    toast.error(result.feedback || 'Incorrect answer')
                }
            } else {
                toast.error(result.error || 'Failed to submit')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRevealHint = async (index: number) => {
        if (revealedHints.includes(index)) return

        const hint = hints[index]
        if (hint.xpCost > 0) {
            const result = await revealForgeHint(step.id, index)
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
                            <Link href={`/challenges/forge/${step.track.slug}`}>
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
                            <div>
                                <p className="text-xs text-neutral-500">
                                    {step.track.name}
                                </p>
                                <h1 className="font-semibold text-neutral-900 dark:text-white">
                                    Step {step.stepNumber}: {step.title}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isCompleted && (
                                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                </Badge>
                            )}
                            <Badge 
                                variant="outline" 
                                style={{ borderColor: step.track.themeColor, color: step.track.themeColor }}
                            >
                                <Zap className="w-3 h-3 mr-1" />
                                {step.xpReward} XP
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
                            <TabsList className="grid grid-cols-4 mb-6">
                                <TabsTrigger value="story" className="gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span className="hidden sm:inline">Story</span>
                                </TabsTrigger>
                                <TabsTrigger value="mission" className="gap-1">
                                    <Code2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Mission</span>
                                </TabsTrigger>
                                <TabsTrigger value="learn" className="gap-1">
                                    <Lightbulb className="w-4 h-4" />
                                    <span className="hidden sm:inline">Learn</span>
                                </TabsTrigger>
                                <TabsTrigger value="submit" className="gap-1">
                                    <Send className="w-4 h-4" />
                                    <span className="hidden sm:inline">Submit</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="story" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5" style={{ color: step.track.themeColor }} />
                                            The Story
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <ReactMarkdown>{step.storyContent}</ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="mission" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Code2 className="w-5 h-5" style={{ color: step.track.themeColor }} />
                                            Your Mission
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                                            <ReactMarkdown>{step.missionContent}</ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="learn" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5" style={{ color: step.track.themeColor }} />
                                            Learning Modules
                                        </CardTitle>
                                        <CardDescription>
                                            Concepts you might need for this step. Click to learn more.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {step.learningModules.length === 0 ? (
                                            <p className="text-neutral-500 text-center py-8">
                                                No learning modules for this step.
                                            </p>
                                        ) : (
                                            <div className="grid gap-3">
                                                {step.learningModules.map((module) => (
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
                                                                        style={{ backgroundColor: `${step.track.themeColor}20` }}
                                                                    >
                                                                        <BookOpen className="w-5 h-5" style={{ color: step.track.themeColor }} />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-semibold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                                            {module.conceptName}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                                            {module.videoUrl && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <PlayCircle className="w-3 h-3" />
                                                                                    Video
                                                                                </span>
                                                                            )}
                                                                            {module.interactiveCode && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Code2 className="w-3 h-3" />
                                                                                    Interactive
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

                            <TabsContent value="submit" className="mt-0">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Send className="w-5 h-5" style={{ color: step.track.themeColor }} />
                                            Submit Your Answer
                                        </CardTitle>
                                        <CardDescription>
                                            {step.deliverableType === 'URL' 
                                                ? 'Submit the live URL for verification'
                                                : 'Submit your answer below'
                                            }
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {isCompleted ? (
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-2">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="font-semibold">Completed!</span>
                                                </div>
                                                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                                                    You've successfully completed this step. +{latestSubmission.xpEarned} XP earned!
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {step.deliverableType === 'URL' ? (
                                                    <Input
                                                        placeholder="https://your-deployed-url.com"
                                                        value={answer}
                                                        onChange={(e) => setAnswer(e.target.value)}
                                                    />
                                                ) : (
                                                    <Input
                                                        placeholder="Enter your answer"
                                                        value={answer}
                                                        onChange={(e) => setAnswer(e.target.value)}
                                                    />
                                                )}

                                                <Button
                                                    className="w-full"
                                                    style={{ backgroundColor: step.track.themeColor }}
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
                                                            Submit Answer
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        )}

                                        {/* Previous Attempts */}
                                        {submissions.length > 0 && (
                                            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                                                    Previous Attempts ({submissions.length})
                                                </h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {submissions.map((sub) => (
                                                        <div 
                                                            key={sub.id}
                                                            className={cn(
                                                                "p-3 rounded-lg text-sm",
                                                                sub.status === 'CORRECT'
                                                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                                                    : "bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="flex items-center gap-1">
                                                                    {sub.status === 'CORRECT' ? (
                                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 text-red-500" />
                                                                    )}
                                                                    Attempt #{sub.attemptNumber}
                                                                </span>
                                                                <span className="text-xs text-neutral-400">
                                                                    {new Date(sub.submittedAt).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-neutral-500 truncate">{sub.submission}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Hints Card */}
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
                                                <AccordionTrigger className="hover:no-underline">
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
                                                            {hint.xpCost > 0 ? `Reveal (-${hint.xpCost} XP)` : 'Reveal Hint'}
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
                                    {step.stepNumber > 1 && (
                                        <Link href={`/challenges/forge/${step.track.slug}/step/${step.stepNumber - 1}`} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Prev
                                            </Button>
                                        </Link>
                                    )}
                                    {isCompleted && (
                                        <Link href={`/challenges/forge/${step.track.slug}/step/${step.stepNumber + 1}`} className="flex-1">
                                            <Button className="w-full" style={{ backgroundColor: step.track.themeColor }}>
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
                                    <BookOpen className="w-5 h-5" style={{ color: step.track.themeColor }} />
                                    {selectedModule.conceptName}
                                </SheetTitle>
                                <SheetDescription>
                                    Learn this concept to help with the challenge
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Quick Explanation */}
                                <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-600">1</span>
                                        Quick Concept
                                    </h4>
                                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                        <ReactMarkdown>{selectedModule.quickExplanation}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Video */}
                                {selectedModule.videoUrl && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-600">2</span>
                                            Video Explanation
                                            {selectedModule.videoDuration && (
                                                <span className="text-xs text-neutral-500 font-normal">
                                                    ({Math.floor(selectedModule.videoDuration / 60)}:{(selectedModule.videoDuration % 60).toString().padStart(2, '0')})
                                                </span>
                                            )}
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
                                            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-600">3</span>
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
                                            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-600">4</span>
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
                                    style={{ backgroundColor: step.track.themeColor }}
                                >
                                    Got it! Back to Challenge
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}


