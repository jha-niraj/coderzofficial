"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    GraduationCap, ArrowRight,
    Trophy, BarChart2, MessageSquare, ChevronDown, ChevronUp,
    RotateCcw, Sparkles
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { cn } from "@repo/ui/lib/utils"
import toast from "@repo/ui/components/ui/sonner"
import {
    createInterview, evaluateAnswer, completeInterview, getInterview
} from "@/actions/(main)/ai/codesage/interview.action"
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"

type Mode = "explain" | "defend" | "improve" | "mixed"
type Difficulty = "junior" | "mid" | "senior"

interface Question {
    id: string
    questionText: string
    codeContext: string
    filePath: string
    keyPoints: string[]
    difficulty: string
    userAnswer?: string
    score?: number
    feedback?: string
}

interface InterviewSummary {
    id: string
    mode: string
    difficulty: string
    score: number | null
    status: string
    createdAt: Date
    completedAt: Date | null
}

const MODE_CONFIG = {
    explain:  { label: "Explain Mode",  desc: "Walk me through your code",       color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
    defend:   { label: "Defend Mode",   desc: "Justify your architectural choices", color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20" },
    improve:  { label: "Improve Mode",  desc: "How would you make this better?",  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    mixed:    { label: "Full Stack",    desc: "Mix of all three modes",           color: "text-blue-600",   bg: "bg-blue-50 dark:bg-blue-900/20" },
} as const

const DIFF_CONFIG = {
    junior: { label: "Junior",  desc: "0–2 years experience",  badge: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
    mid:    { label: "Mid",     desc: "2–5 years experience",  badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
    senior: { label: "Senior",  desc: "5+ years experience",   badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
}

type InterviewPhase = "setup" | "in_progress" | "completed"

export function InterviewClient({
    projectSlug,
    projectName,
    interviews: initialInterviews,
    folders,
    isReady,
}: {
    projectSlug: string
    projectName: string
    interviews: InterviewSummary[]
    folders: string[]
    isReady: boolean
}) {
    const [phase, setPhase] = useState<InterviewPhase>("setup")
    const [interviews, setInterviews] = useState(initialInterviews)

    // Setup form
    const [mode, setMode] = useState<Mode>("mixed")
    const [difficulty, setDifficulty] = useState<Difficulty>("mid")
    const [focusArea, setFocusArea] = useState<string>("all")
    const [generating, setGenerating] = useState(false)

    // In-progress state
    const [interviewId, setInterviewId] = useState<string | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answer, setAnswer] = useState("")
    const [evaluating, setEvaluating] = useState(false)
    const [currentFeedback, setCurrentFeedback] = useState<{ score: number; feedback: string; missedPoints: string[]; strongPoints: string[] } | null>(null)

    // Results state
    const [finalScore, setFinalScore] = useState<number | null>(null)
    const [completedQuestions, setCompletedQuestions] = useState<Question[]>([])
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)

    const currentQuestion = questions[currentIdx]

    const handleStart = async () => {
        if (!isReady) return toast.error("Project is still indexing")
        setGenerating(true)
        const toastId = toast.loading("Generating personalized questions from your codebase…")
        const res = await createInterview({
            projectSlug,
            mode,
            difficulty,
            focusArea: focusArea === "all" ? null : focusArea,
        })
        setGenerating(false)
        if (!res.success) {
            toast.error(res.error ?? "Failed to generate interview", { id: toastId })
            return
        }
        toast.dismiss(toastId)
        setInterviewId(res.interviewId!)
        setQuestions(res.questions as Question[])
        setCurrentIdx(0)
        setAnswer("")
        setCurrentFeedback(null)
        setPhase("in_progress")
    }

    const handleSubmitAnswer = async () => {
        if (!interviewId || !currentQuestion) return
        setEvaluating(true)
        const res = await evaluateAnswer({
            interviewId,
            questionId: currentQuestion.id,
            userAnswer: answer,
        })
        setEvaluating(false)
        if (!res.success) {
            toast.error("Failed to evaluate answer")
            return
        }
        setCurrentFeedback(res.evaluation!)
        setQuestions(prev => prev.map(q =>
            q.id === currentQuestion.id
                ? { ...q, userAnswer: answer, score: res.evaluation!.score, feedback: res.evaluation!.feedback }
                : q
        ))
    }

    const handleNext = () => {
        setCurrentFeedback(null)
        setAnswer("")
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(i => i + 1)
        } else {
            handleComplete()
        }
    }

    const handleComplete = async () => {
        if (!interviewId) return
        const res = await completeInterview(interviewId)
        if (!res.success) return
        setFinalScore(res.score ?? 0)
        // Load full interview for review
        const interview = await getInterview(interviewId)
        if (interview.success && interview.interview) {
            setCompletedQuestions(interview.interview.questions as unknown as Question[])
        }
        setInterviews(prev => [{
            id: interviewId,
            mode,
            difficulty,
            score: res.score ?? 0,
            status: "completed",
            createdAt: new Date(),
            completedAt: new Date(),
        }, ...prev])
        setPhase("completed")
    }

    const handleReset = () => {
        setPhase("setup")
        setQuestions([])
        setCurrentIdx(0)
        setAnswer("")
        setCurrentFeedback(null)
        setFinalScore(null)
        setInterviewId(null)
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {/* ── Setup phase ── */}
                        {phase === "setup" && (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <GraduationCap className="w-6 h-6 text-emerald-500" />
                                        Mock Interview
                                    </h1>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        AI generates questions from your actual code in <span className="font-medium text-neutral-700 dark:text-neutral-300">{projectName}</span>
                                    </p>
                                </div>

                                {/* Mode selection */}
                                <div>
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Interview Mode</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([m, conf]) => (
                                            <button
                                                key={m}
                                                onClick={() => setMode(m)}
                                                className={cn(
                                                    "flex flex-col gap-1 p-4 rounded-xl border text-left transition-all",
                                                    mode === m
                                                        ? `border-current ${conf.bg} ${conf.color}`
                                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                                )}
                                            >
                                                <p className={cn("text-sm font-semibold", mode === m ? conf.color : "text-neutral-800 dark:text-neutral-200")}>
                                                    {conf.label}
                                                </p>
                                                <p className="text-xs text-neutral-500">{conf.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Difficulty */}
                                <div>
                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Difficulty</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(Object.entries(DIFF_CONFIG) as [Difficulty, typeof DIFF_CONFIG[Difficulty]][]).map(([d, conf]) => (
                                            <button
                                                key={d}
                                                onClick={() => setDifficulty(d)}
                                                className={cn(
                                                    "flex flex-col gap-1 p-3 rounded-xl border text-left transition-all",
                                                    difficulty === d
                                                        ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                                )}
                                            >
                                                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{conf.label}</p>
                                                <p className="text-xs text-neutral-500">{conf.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Focus area */}
                                {folders.length > 0 && (
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Focus Area</p>
                                        <Select value={focusArea} onValueChange={setFocusArea}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Whole Codebase</SelectItem>
                                                {folders.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <Button
                                    onClick={handleStart}
                                    disabled={generating || !isReady}
                                    size="lg"
                                    className="w-full h-12 bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl font-semibold"
                                >
                                    {generating ? (
                                        <><DotmSquare11 size={18} dotSize={3} speed={1.4} className="mr-2" />Generating questions…</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" />Start Interview</>
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {/* ── In progress ── */}
                        {phase === "in_progress" && currentQuestion && (
                            <motion.div
                                key="in-progress"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-5"
                            >
                                {/* Progress */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                            Question {currentIdx + 1} of {questions.length}
                                        </span>
                                        <div className="flex gap-1">
                                            {questions.map((q, i) => (
                                                <div
                                                    key={q.id}
                                                    className={cn(
                                                        "h-1.5 w-6 rounded-full transition-colors",
                                                        i < currentIdx
                                                            ? "bg-emerald-500"
                                                            : i === currentIdx
                                                                ? "bg-neutral-900 dark:bg-white"
                                                                : "bg-neutral-200 dark:bg-neutral-700"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {MODE_CONFIG[mode].label}
                                    </Badge>
                                </div>

                                {/* Question */}
                                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4">
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <p className="text-base font-medium text-neutral-900 dark:text-white leading-relaxed">
                                            {currentQuestion.questionText}
                                        </p>
                                    </div>

                                    {/* Code context */}
                                    {currentQuestion.codeContext && (
                                        <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                            <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between">
                                                <span className="text-[10px] font-mono text-neutral-500">{currentQuestion.filePath}</span>
                                                <Badge variant="secondary" className="text-[9px]">Context</Badge>
                                            </div>
                                            <pre className="text-xs font-mono text-neutral-700 dark:text-neutral-300 p-4 overflow-auto whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-900/50">
                                                {currentQuestion.codeContext.slice(0, 1500)}
                                            </pre>
                                        </div>
                                    )}
                                </div>

                                {/* Answer area */}
                                {!currentFeedback ? (
                                    <div className="space-y-3">
                                        <Textarea
                                            value={answer}
                                            onChange={e => setAnswer(e.target.value)}
                                            placeholder="Type your answer here… Be specific and reference the code shown above."
                                            rows={5}
                                            disabled={evaluating}
                                            className="resize-none text-sm"
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleSubmitAnswer()}
                                                disabled={evaluating}
                                                className="flex-1"
                                            >
                                                {evaluating ? (
                                                    <><DotmSquare11 size={16} dotSize={2.5} speed={1.4} className="mr-2" />Evaluating…</>
                                                ) : (
                                                    <>Submit Answer</>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={handleNext}
                                                className="text-neutral-500"
                                                disabled={evaluating}
                                            >
                                                Skip
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Feedback */
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Your Score</p>
                                            <div className={cn(
                                                "text-2xl font-bold",
                                                currentFeedback.score >= 80 ? "text-green-500" :
                                                currentFeedback.score >= 60 ? "text-amber-500" : "text-red-500"
                                            )}>
                                                {currentFeedback.score}/100
                                            </div>
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                            {currentFeedback.feedback}
                                        </p>
                                        {currentFeedback.strongPoints.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 mb-1">✓ Strong points</p>
                                                <ul className="space-y-0.5">
                                                    {currentFeedback.strongPoints.map((p, i) => (
                                                        <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5">
                                                            <span className="text-green-500 mt-0.5">•</span>{p}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {currentFeedback.missedPoints.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-amber-600 mb-1">→ Could have mentioned</p>
                                                <ul className="space-y-0.5">
                                                    {currentFeedback.missedPoints.map((p, i) => (
                                                        <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5">
                                                            <span className="text-amber-500 mt-0.5">•</span>{p}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <Button
                                            onClick={handleNext}
                                            className="w-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl"
                                        >
                                            {currentIdx < questions.length - 1 ? (
                                                <><ArrowRight className="w-4 h-4 mr-2" />Next Question</>
                                            ) : (
                                                <><Trophy className="w-4 h-4 mr-2" />See Results</>
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}

                        {/* ── Completed ── */}
                        {phase === "completed" && (
                            <motion.div
                                key="completed"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4"
                                    >
                                        <Trophy className="w-9 h-9 text-emerald-500" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Interview Complete!</h2>
                                    <div className={cn(
                                        "text-5xl font-black mt-3 mb-1",
                                        (finalScore ?? 0) >= 80 ? "text-green-500" :
                                        (finalScore ?? 0) >= 60 ? "text-amber-500" : "text-red-500"
                                    )}>
                                        {finalScore ?? 0}
                                        <span className="text-2xl text-neutral-400">/100</span>
                                    </div>
                                    <p className="text-sm text-neutral-500">
                                        {(finalScore ?? 0) >= 80 ? "Excellent! You know your codebase well." :
                                         (finalScore ?? 0) >= 60 ? "Good understanding. A few areas to sharpen." :
                                         "Room to grow. Review the feedback below."}
                                    </p>
                                </div>

                                {/* Question review */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Question Review</h3>
                                    {completedQuestions.map((q) => (
                                        <div
                                            key={q.id}
                                            className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                                className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                    (q.score ?? 0) >= 70
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/20"
                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/20"
                                                )}>
                                                    {q.score ?? "—"}
                                                </div>
                                                <p className="text-sm text-neutral-700 dark:text-neutral-300 flex-1 text-left line-clamp-1">
                                                    {q.questionText}
                                                </p>
                                                {expandedQuestion === q.id ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                                            </button>
                                            {expandedQuestion === q.id && q.feedback && (
                                                <div className="px-4 pb-4 pt-0 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                                                    <p className="mt-3 leading-relaxed">{q.feedback}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    onClick={handleReset}
                                    className="w-full bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Take Another Interview
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* History sidebar */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" />
                        Interview History
                    </h3>
                    {interviews.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-6 text-center">
                            <GraduationCap className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                            <p className="text-xs text-neutral-500">No interviews yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {interviews.map(iv => (
                                <div
                                    key={iv.id}
                                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-3"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge
                                            className={cn("text-[10px] font-normal capitalize", DIFF_CONFIG[iv.difficulty as Difficulty]?.badge ?? "")}
                                        >
                                            {iv.difficulty}
                                        </Badge>
                                        {iv.score !== null && (
                                            <span className={cn(
                                                "text-sm font-bold",
                                                iv.score >= 80 ? "text-green-500" : iv.score >= 60 ? "text-amber-500" : "text-red-500"
                                            )}>
                                                {iv.score}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">{iv.mode} mode</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">
                                        {new Date(iv.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {interviews.length > 0 && (
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
                            <p className="text-xs text-neutral-500 mb-1">Best Score</p>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {Math.max(...interviews.filter(i => i.score !== null).map(i => i.score!))}%
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">{interviews.length} interviews taken</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
