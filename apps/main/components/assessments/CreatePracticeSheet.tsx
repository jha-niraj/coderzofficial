'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Code, FileQuestion, Loader2, Lock, Mic, Sparkles, Zap,
    Globe, HelpCircle
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { Switch } from '@repo/ui/components/ui/switch'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
    SheetFooter
} from '@repo/ui/components/ui/sheet'
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@repo/ui/components/ui/tooltip'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import { useUserStore } from '@/app/store/useUserStore'
import {
    createPracticeSet, PRACTICE_SET_CREDIT_COST, getAssessmentTopics
} from '@/actions/(main)/assessments/user-sets.action'
import {
    AssessmentLanguage, AssessmentMode, QuestionDifficulty
} from '@repo/prisma/client'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'

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

const DIFFICULTIES = [
    { key: 'EASY' as QuestionDifficulty, label: 'Easy', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
    { key: 'INTERMEDIATE' as QuestionDifficulty, label: 'Intermediate', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
    { key: 'HARD' as QuestionDifficulty, label: 'Hard', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
]

const QUESTION_COUNTS = [5, 10, 15, 20, 25, 30]

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

interface CreatePracticeSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultLanguage?: AssessmentLanguage
    defaultMode?: AssessmentMode
    onSuccess?: (practiceSetId: string, slug: string) => void
}

export function CreatePracticeSheet({
    open,
    onOpenChange,
    defaultLanguage,
    defaultMode,
    onSuccess
}: CreatePracticeSheetProps) {
    const router = useRouter()
    const { user } = useUserStore()
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [language, setLanguage] = useState<AssessmentLanguage | ''>(defaultLanguage || '')
    const [mode, setMode] = useState<AssessmentMode>(defaultMode || 'QUIZ')
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>('EASY')
    const [questionCount, setQuestionCount] = useState(10)
    const [isPublic, setIsPublic] = useState(false)
    const [topics, setTopics] = useState<Topic[]>([])
    const [selectedTopicId, setSelectedTopicId] = useState<string>('')
    const [selectedSubModuleId, setSelectedSubModuleId] = useState<string>('')

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

    const selectedTopic = topics.find(t => t.id === selectedTopicId)

    const isFormValid = title.trim() && language && mode

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setLanguage(defaultLanguage || '')
        setMode(defaultMode || 'QUIZ')
        setDifficulty('EASY')
        setQuestionCount(10)
        setIsPublic(false)
        setSelectedTopicId('')
        setSelectedSubModuleId('')
    }

    const handleCreate = async () => {
        if (!isFormValid || !language) return

        setIsCreating(true)
        try {
            const result = await createPracticeSet({
                title: title.trim(),
                description: description.trim() || undefined,
                language: language as AssessmentLanguage,
                mode,
                difficulty,
                topicId: selectedTopicId || undefined,
                subModuleId: selectedSubModuleId || undefined,
                questionCount,
                isPublic,
            })

            if (result.success && result.practiceSetId) {
                toast.success('Practice set created successfully!', {
                    description: `Used ${result.creditsUsed} credits`,
                })
                resetForm()
                onOpenChange(false)
                if (onSuccess) {
                    onSuccess(result.practiceSetId, result.slug!)
                } else {
                    router.push(`/assessments/practice/set/${result.practiceSetId}`)
                }
            } else {
                toast.error(result.error || 'Failed to create practice set')
            }
        } catch (error) {
            console.error('Error creating practice set:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsCreating(false)
        }
    }

    const creditCost = PRACTICE_SET_CREDIT_COST
    const effectiveCost = isPublic ? Math.floor(creditCost * 0.5) : creditCost

    if (!user) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-lg">
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
                        <p className="text-muted-foreground mb-4">
                            Please sign in to create practice sets
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
                            <Sparkles className="w-5 h-5 text-primary" />
                            Create Practice Set
                        </span>
                        <Badge variant="outline" className="gap-1">
                            <Zap className="w-3 h-3" />
                            {effectiveCost} Credits
                        </Badge>
                    </SheetTitle>
                    <SheetDescription>
                        AI will generate questions tailored to your topic
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-180px)]">
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="e.g., JavaScript Array Methods Practice"
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
                                setSelectedSubModuleId('')
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
                                    <Select value={selectedTopicId} onValueChange={(v) => {
                                        setSelectedTopicId(v)
                                        setSelectedSubModuleId('')
                                    }}>
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
                        {
                            selectedTopic && selectedTopic.subModules.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Sub-topic</Label>
                                    <Select value={selectedSubModuleId} onValueChange={setSelectedSubModuleId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a sub-topic (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                selectedTopic.subModules.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id}>
                                                        {sub.name}
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
                            <div className="grid grid-cols-3 gap-2">
                                {
                                    DIFFICULTIES.map((diff) => (
                                        <button
                                            key={diff.key}
                                            type="button"
                                            onClick={() => setDifficulty(diff.key)}
                                            className={cn(
                                                "p-2 rounded-lg border-2 transition-all text-center",
                                                difficulty === diff.key
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-muted-foreground/50"
                                            )}
                                        >
                                            <Badge className={diff.color}>{diff.label}</Badge>
                                        </button>
                                    ))
                                }
                            </div>
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
                                                {count} questions
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
                                        <Sparkles className="w-4 h-4" />
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

export default CreatePracticeSheet;