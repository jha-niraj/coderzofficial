'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    ArrowLeft, Award, BookOpen, Clock, Code, FileQuestion, Loader2,
    Medal, Mic, Play, Plus, Sparkles, Target, Eye, Heart, AlertTriangle
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import {
    AssessmentLanguage, AssessmentMode, QuestionDifficulty
} from '@prisma/client'
import { CreateSetSheet } from '@/components/assessments/CreateSetSheet'
import { getUserExamSets } from '@/actions/(main)/assessments/user-sets.action'
import type { ExamSetPreview } from '@/types/assessment'

// Local language config with colors and icons
const LANGUAGES: Record<AssessmentLanguage, { label: string; icon: string; color: string }> = {
    JAVASCRIPT: { label: 'JavaScript', icon: '🟨', color: '#f7df1e' },
    PYTHON: { label: 'Python', icon: '🐍', color: '#3776ab' },
    C: { label: 'C', icon: '🔷', color: '#00599c' },
    CPP: { label: 'C++', icon: '🔶', color: '#f34b7d' },
    REACTJS: { label: 'React.js', icon: '⚛️', color: '#61dafb' },
    TYPESCRIPT: { label: 'TypeScript', icon: '🔵', color: '#3178c6' },
    JAVA: { label: 'Java', icon: '☕', color: '#b07219' },
    GO: { label: 'Go', icon: '🐹', color: '#00add8' },
    RUST: { label: 'Rust', icon: '🦀', color: '#dea584' },
}

// Difficulty configs with exam-specific settings
const DIFFICULTIES: Record<QuestionDifficulty, { 
    label: string; 
    color: string; 
    timeLimit: number; 
    passingScore: number; 
    questions: number;
    description: string;
}> = {
    EASY: { 
        label: 'Easy', 
        color: '#22c55e', 
        timeLimit: 20 * 60, 
        passingScore: 60, 
        questions: 15,
        description: 'Basic concepts and fundamentals'
    },
    INTERMEDIATE: { 
        label: 'Intermediate', 
        color: '#f59e0b', 
        timeLimit: 30 * 60, 
        passingScore: 65, 
        questions: 20,
        description: 'Working knowledge required'
    },
    HARD: { 
        label: 'Hard', 
        color: '#ef4444', 
        timeLimit: 45 * 60, 
        passingScore: 70, 
        questions: 25,
        description: 'Expert level assessment'
    },
}

// Mode configuration with icons
const MODES: Record<AssessmentMode, { label: string; icon: React.ReactNode; description: string }> = {
    QUIZ: {
        label: 'Quiz',
        icon: <FileQuestion className="w-4 h-4" />,
        description: 'MCQs and theory'
    },
    CODE: {
        label: 'Coding',
        icon: <Code className="w-4 h-4" />,
        description: 'Write code'
    },
    MOCK: {
        label: 'Mock',
        icon: <Mic className="w-4 h-4" />,
        description: 'Interview style'
    },
    MIXED: {
        label: 'Mixed',
        icon: <Sparkles className="w-4 h-4" />,
        description: 'All types'
    },
}

const statusColors = {
    GENERATING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    ACTIVE: 'bg-green-500/10 text-green-500 border-green-500/20',
    ARCHIVED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}`
}

function ExamContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // URL params
    const languageParam = (searchParams.get('language') || 'JAVASCRIPT') as AssessmentLanguage
    const difficultyParam = (searchParams.get('difficulty') || 'INTERMEDIATE') as QuestionDifficulty

    // State
    const [selectedLanguage, setSelectedLanguage] = useState<AssessmentLanguage>(languageParam)
    const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>(difficultyParam)
    const [selectedMode, setSelectedMode] = useState<AssessmentMode>('MIXED')

    // User's sets state
    const [userSets, setUserSets] = useState<ExamSetPreview[]>([])
    const [isLoadingUserSets, setIsLoadingUserSets] = useState(true)

    // Create sheet state
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)

    // Active tab state
    const [activeTab, setActiveTab] = useState<'start-exam' | 'my-sets'>('start-exam')

    // Load user's exam sets
    const loadUserSets = useCallback(async () => {
        setIsLoadingUserSets(true)
        try {
            const result = await getUserExamSets()
            if (result.success && Array.isArray(result.data)) {
                setUserSets(result.data as ExamSetPreview[])
            } else {
                setUserSets([])
            }
        } catch (error) {
            console.error('Error loading user sets:', error)
            setUserSets([])
        }
        setIsLoadingUserSets(false)
    }, [])

    useEffect(() => {
        loadUserSets()
    }, [loadUserSets])

    const languageConfig = LANGUAGES[selectedLanguage] || LANGUAGES.JAVASCRIPT
    const difficultyConfig = DIFFICULTIES[selectedDifficulty] || DIFFICULTIES.INTERMEDIATE

    const handleStartExam = (examSetId?: string) => {
        if (examSetId) {
            router.push(`/assessments/exam/set/\${examSetId}`)
        } else {
            // Start a new AI-generated exam
            const params = new URLSearchParams({
                language: selectedLanguage,
                difficulty: selectedDifficulty,
                mode: selectedMode,
            })
            router.push(`/assessments/exam/session?\${params.toString()}`)
        }
    }

    const filteredUserSets = userSets.filter(set => set.language === selectedLanguage)

    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Header */}
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/assessments">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{languageConfig.icon}</span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                                    {languageConfig.label} Certification Exam
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Take AI-generated exams or create custom exam sets
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsCreateSheetOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Exam Set
                        </Button>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar */}
                        <div className="lg:w-1/3 space-y-4">
                            {/* Language Selector */}
                            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Code className="w-4 h-4" />
                                    Language
                                </h3>
                                <ScrollArea className="max-h-[200px]">
                                    <div className="space-y-1">
                                        {Object.entries(LANGUAGES).map(([key, lang]) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedLanguage(key as AssessmentLanguage)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm",
                                                    selectedLanguage === key
                                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                                                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                                )}
                                            >
                                                <span>{lang.icon}</span>
                                                <span className="font-medium">{lang.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Difficulty Selector */}
                            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Difficulty
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(DIFFICULTIES).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedDifficulty(key as QuestionDifficulty)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                                                selectedDifficulty === key
                                                    ? "border-2"
                                                    : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                                            )}
                                            style={{
                                                borderColor: selectedDifficulty === key ? config.color : undefined,
                                                backgroundColor: selectedDifficulty === key ? `\${config.color}15` : undefined
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium" style={{ color: config.color }}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-500 text-right">
                                                <div>{config.questions} Qs</div>
                                                <div>{formatTime(config.timeLimit)}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mode Selector */}
                            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Question Type
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(MODES).map(([key, mode]) => (
                                        <button
                                            key={key}
                                            onClick={() => setSelectedMode(key as AssessmentMode)}
                                            className={cn(
                                                "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                                                selectedMode === key
                                                    ? "bg-amber-600 border-amber-600 text-white"
                                                    : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-400"
                                            )}
                                        >
                                            {mode.icon}
                                            <span className="text-xs font-medium">{mode.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:w-2/3">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'start-exam' | 'my-sets')}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="start-exam" className="flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        Start Exam
                                    </TabsTrigger>
                                    <TabsTrigger value="my-sets" className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        My Exam Sets
                                        {filteredUserSets.length > 0 && (
                                            <Badge variant="secondary" className="ml-1">
                                                {filteredUserSets.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="start-exam">
                                    {/* Exam Details Card */}
                                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                                            Exam Details
                                        </h2>

                                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                                <Clock className="w-5 h-5 text-blue-500" />
                                                <div>
                                                    <div className="text-sm text-neutral-500">Time Limit</div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">
                                                        {formatTime(difficultyConfig.timeLimit)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                                <FileQuestion className="w-5 h-5 text-purple-500" />
                                                <div>
                                                    <div className="text-sm text-neutral-500">Questions</div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">
                                                        {difficultyConfig.questions} Questions
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                                <Target className="w-5 h-5 text-amber-500" />
                                                <div>
                                                    <div className="text-sm text-neutral-500">Passing Score</div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">
                                                        {difficultyConfig.passingScore}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                                <Medal className="w-5 h-5 text-emerald-500" />
                                                <div>
                                                    <div className="text-sm text-neutral-500">Certificate</div>
                                                    <div className="font-semibold text-neutral-900 dark:text-white">
                                                        Valid for 1 Year
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Alert className="mb-6">
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Important:</strong> Once you start the exam, the timer cannot be paused.
                                                Make sure you have a stable internet connection and enough time to complete the exam.
                                                Questions are AI-generated and unique to each attempt.
                                            </AlertDescription>
                                        </Alert>

                                        <Button
                                            size="lg"
                                            className="w-full bg-amber-600 hover:bg-amber-700"
                                            onClick={() => handleStartExam()}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Start {languageConfig.label} {difficultyConfig.label} Exam
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="my-sets">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            My Exam Sets
                                        </h3>
                                        <Button
                                            size="sm"
                                            onClick={() => setIsCreateSheetOpen(true)}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create New
                                        </Button>
                                    </div>

                                    {isLoadingUserSets ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                                        </div>
                                    ) : filteredUserSets.length === 0 ? (
                                        <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                            <Award className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                                No Exam Sets Yet
                                            </h3>
                                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                                Create custom AI-generated exam sets for {languageConfig.label}.
                                            </p>
                                            <Button onClick={() => setIsCreateSheetOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Exam Set
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {filteredUserSets.map((set, index) => (
                                                <motion.div
                                                    key={set.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Card
                                                        className={cn(
                                                            "cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-all",
                                                            set.status !== 'ACTIVE' && "opacity-70"
                                                        )}
                                                        onClick={() => set.status === 'ACTIVE' && handleStartExam(set.id)}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl">
                                                                        {LANGUAGES[set.language]?.icon || '📝'}
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={statusColors[set.status as keyof typeof statusColors]}
                                                                    >
                                                                        {set.status === 'ACTIVE' ? 'Ready' : set.status}
                                                                    </Badge>
                                                                </div>
                                                                {set.isPublic && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Public
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h4 className="font-semibold text-neutral-900 dark:text-white mb-1 line-clamp-1">
                                                                {set.title}
                                                            </h4>
                                                            <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
                                                                {set.description || 'No description'}
                                                            </p>
                                                            <div className="flex items-center justify-between text-xs text-neutral-500">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="flex items-center gap-1">
                                                                        <FileQuestion className="w-3 h-3" />
                                                                        {set.questionCount} questions
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {formatTime(set.timeLimit)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="flex items-center gap-1">
                                                                        <Eye className="w-3 h-3" />
                                                                        {set.views}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Heart className="w-3 h-3" />
                                                                        {set._count?.likedBy || 0}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </section>

            {/* Create Exam Set Sheet */}
            <CreateSetSheet
                type="exam"
                open={isCreateSheetOpen}
                onOpenChange={setIsCreateSheetOpen}
                defaultLanguage={selectedLanguage}
                defaultMode={selectedMode}
            />
        </main>
    )
}

export default function ExamPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
            </div>
        }>
            <ExamContent />
        </Suspense>
    )
}
