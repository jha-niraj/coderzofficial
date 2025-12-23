'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Code, FileQuestion, Loader2, Lock, Mic, Sparkles, Zap, Globe,
    HelpCircle, GraduationCap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
    SheetFooter
} from '@/components/ui/sheet'
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'
import { useUserStore } from '@/app/store/useUserStore'
import {
    createExamSet, EXAM_SET_CREDIT_COST, getAssessmentTopics
} from '@/actions/(main)/assessments/user-sets.action'
import {
    AssessmentLanguage, AssessmentMode, QuestionDifficulty
} from '@prisma/client'
import { ScrollArea } from '@/components/ui/scroll-area'

// Language configs
const LANGUAGES: Record<string, { label: string; icon: string }> = {
    JAVASCRIPT: { label: 'JavaScript', icon: '🟨' },
    PYTHON: { label: 'Python', icon: '🐍' },
    C: { label: 'C', icon: '🔷' },
    CPP: { label: 'C++', icon: '🔶' },
    REACTJS: { label: 'React.js', icon: '⚛️' },
    TYPESCRIPT: { label: 'TypeScript', icon: '🔵' },
    JAVA: { label: 'Java', icon: '☕' },
    GO: { label: 'Go', icon: '🐹' },
    RUST: { label: 'Rust', icon: '🦀' },
}

// Mode configs
const MODES = [
    { key: 'QUIZ' as AssessmentMode, label: 'Quiz', icon: FileQuestion, description: 'Multiple choice' },
    { key: 'CODE' as AssessmentMode, label: 'Code', icon: Code, description: 'Coding challenges' },
    { key: 'MOCK' as AssessmentMode, label: 'Mock', icon: Mic, description: 'Interview prep' },
    { key: 'MIXED' as AssessmentMode, label: 'Mixed', icon: Sparkles, description: 'All types' },
]

// Exams only allow INTERMEDIATE and HARD
const DIFFICULTIES = [
    { key: 'INTERMEDIATE' as QuestionDifficulty, label: 'Intermediate', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
    { key: 'HARD' as QuestionDifficulty, label: 'Hard', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
]

const QUESTION_COUNTS = [10, 15, 20, 25, 30, 40]

interface Topic {
    id: string
    name: string
    subModules: Array<{
        id: string
        name: string
        slug: string
        description: string | null
    }>
}

interface CreateExamSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultLanguage?: AssessmentLanguage
    defaultMode?: AssessmentMode
    onSuccess?: (examSetId: string, slug: string) => void
}

export function CreateExamSheet({
    open,
    onOpenChange,
    defaultLanguage,
    defaultMode,
    onSuccess
}: CreateExamSheetProps) {
    const router = useRouter()
    const { user } = useUserStore()
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [language, setLanguage] = useState<AssessmentLanguage | ''>(defaultLanguage || '')
    const [mode, setMode] = useState<AssessmentMode>(defaultMode || 'MIXED')
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>('INTERMEDIATE')
    const [questionCount, setQuestionCount] = useState(15)
    const [isPublic, setIsPublic] = useState(false)
    const [topics, setTopics] = useState<Topic[]>([])
    const [selectedTopicId, setSelectedTopicId] = useState<string>('')

    // Fetch topics when language changes
    useEffect(() => {
        async function fetchTopics() {
            if (!language) {
                setTopics([])
                return
            }
            try {
                const result = await getAssessmentTopics(language as AssessmentLanguage)
                if (result.success && result.data) {
                    setTopics(result.data as Topic[])
                }
            } catch (error) {
                console.error('Error fetching topics:', error)
            }
        }
        fetchTopics()
    }, [language])

    const isFormValid = title.trim() && language && mode

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setLanguage(defaultLanguage || '')
        setMode(defaultMode || 'MIXED')
        setDifficulty('INTERMEDIATE')
        setQuestionCount(15)
        setIsPublic(false)
        setSelectedTopicId('')
    }

    const handleCreate = async () => {
        if (!isFormValid || !language) return

        setIsCreating(true)
        try {
            const result = await createExamSet({
                title: title.trim(),
                description: description.trim() || undefined,
                language: language as AssessmentLanguage,
                mode,
                difficulty,
                topicId: selectedTopicId || undefined,
                questionCount,
                isPublic,
            })

            if (result.success && result.examSetId) {
                toast.success('Exam set created successfully!', {
                    description: `Used ${result.creditsUsed} credits`,
                })
                resetForm()
                onOpenChange(false)
                if (onSuccess) {
                    onSuccess(result.examSetId, result.slug!)
                } else {
                    router.push(`/assessments/exam/set/${result.examSetId}`)
                }
            } else {
                toast.error(result.error || 'Failed to create exam set')
            }
        } catch (error) {
            console.error('Error creating exam set:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsCreating(false)
        }
    }

    const creditCost = EXAM_SET_CREDIT_COST
    const effectiveCost = isPublic ? Math.floor(creditCost * 0.5) : creditCost

    if (!user) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-lg">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
                        <p className="text-muted-foreground mb-4">
                            Please sign in to create exam sets
                        </p>
                        <Button onClick={() => router.push('/login')}>Sign In</Button>
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0">
                <SheetHeader className="p-6 pb-4 border-b">
                    <SheetTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-primary" />
                            Create Exam Set
                        </span>
                        <Badge variant="outline" className="gap-1">
                            <Zap className="w-3 h-3" />
                            {effectiveCost} Credits
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        Create a timed exam with AI-generated questions
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-180px)]">
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., JavaScript Fundamentals Exam"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description
                                <span className="text-muted-foreground text-xs ml-2">(optional)</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={300}
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Language *</Label>
                            <Select value={language} onValueChange={(v) => {
                                setLanguage(v as AssessmentLanguage)
                                setSelectedTopicId('')
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        Object.entries(LANGUAGES).map(([key, lang]) => (
                                            <SelectItem key={key} value={key}>
                                                <span className="flex items-center gap-2">
                                                    <span>{lang.icon}</span>
                                                    <span>{lang.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        {
                            language && topics.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        Topic
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Select a topic for focused questions</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Label>
                                    <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a topic (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                topics.map((topic) => (
                                                    <SelectItem key={topic.id} value={topic.id}>
                                                        {topic.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        }
                        <div className="space-y-2">
                            <Label>Question Type *</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {
                                    MODES.map((m) => {
                                        const isSelected = mode === m.key
                                        return (
                                            <button
                                                key={m.key}
                                                type="button"
                                                onClick={() => setMode(m.key)}
                                                className={cn(
                                                    "flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left",
                                                    isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-muted hover:border-muted-foreground/50"
                                                )}
                                            >
                                                <m.icon className={cn(
                                                    "w-4 h-4",
                                                    isSelected ? "text-primary" : "text-muted-foreground"
                                                )} />
                                                <div>
                                                    <p className="font-medium text-sm">{m.label}</p>
                                                    <p className="text-xs text-muted-foreground">{m.description}</p>
                                                </div>
                                            </button>
                                        )
                                    })
                                }
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {DIFFICULTIES.map((diff) => (
                                    <button
                                        key={diff.key}
                                        type="button"
                                        onClick={() => setDifficulty(diff.key)}
                                        className={cn(
                                            "p-3 rounded-lg border-2 transition-all text-center",
                                            difficulty === diff.key
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-muted-foreground/50"
                                        )}
                                    >
                                        <Badge className={diff.color}>{diff.label}</Badge>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Exams require Intermediate or Hard difficulty
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Number of Questions</Label>
                            <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        QUESTION_COUNTS.map((count) => (
                                            <SelectItem key={count} value={count.toString()}>
                                                {count} questions (~{count * 2} min)
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            <div className="flex items-center gap-3">
                                {
                                    isPublic ? (
                                        <Globe className="w-5 h-5 text-blue-500" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                    )
                                }
                                <div>
                                    <p className="font-medium text-sm">
                                        {isPublic ? 'Public' : 'Private'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {isPublic
                                            ? 'Share with community & get 50% credit refund'
                                            : 'Only you can access'}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                            />
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter className="p-4 border-t">
                    <div className="flex items-center justify-between w-full gap-3">
                        <p className="text-sm text-muted-foreground">
                            You have <span className="font-semibold">{user.credits ?? 0}</span> credits
                        </p>
                        <Button
                            onClick={handleCreate}
                            disabled={!isFormValid || isCreating || ((user.credits ?? 0) < creditCost)}
                            className="gap-2"
                        >
                            {
                                isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <GraduationCap className="w-4 h-4" />
                                        Create ({effectiveCost} credits)
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default CreateExamSheet;