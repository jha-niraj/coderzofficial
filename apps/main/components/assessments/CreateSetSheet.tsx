'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Code, FileQuestion, Loader2, Lock, Mic, Sparkles, Zap, Globe, 
    HelpCircle, GraduationCap, BookOpen
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
    createPracticeSet, createExamSet, PRACTICE_SET_CREDIT_COST, 
    EXAM_SET_CREDIT_COST, getAssessmentTopics 
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
    NODEJS: { label: 'Node.js', icon: '🟩' },
    PHP: { label: 'PHP', icon: '🐘' },
    SWIFT: { label: 'Swift', icon: '🍎' },
    KOTLIN: { label: 'Kotlin', icon: '🎯' },
    RUBY: { label: 'Ruby', icon: '💎' },
    SCALA: { label: 'Scala', icon: '🔴' },
}

// Mode configs
const MODES = [
    { key: 'QUIZ' as AssessmentMode, label: 'Quiz', icon: FileQuestion, description: 'Multiple choice' },
    { key: 'CODE' as AssessmentMode, label: 'Code', icon: Code, description: 'Coding challenges' },
    { key: 'MOCK' as AssessmentMode, label: 'Mock', icon: Mic, description: 'Interview prep' },
    { key: 'MIXED' as AssessmentMode, label: 'Mixed', icon: Sparkles, description: 'All types' },
]

const PRACTICE_DIFFICULTIES = [
    { key: 'EASY' as QuestionDifficulty, label: 'Easy', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
    { key: 'INTERMEDIATE' as QuestionDifficulty, label: 'Intermediate', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
    { key: 'HARD' as QuestionDifficulty, label: 'Hard', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
]

// Exams only allow INTERMEDIATE and HARD
const EXAM_DIFFICULTIES = [
    { key: 'INTERMEDIATE' as QuestionDifficulty, label: 'Intermediate', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
    { key: 'HARD' as QuestionDifficulty, label: 'Hard', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
]

const PRACTICE_QUESTION_COUNTS = [5, 10, 15, 20, 25, 30]
const EXAM_QUESTION_COUNTS = [10, 15, 20, 25, 30, 40]

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

export type SetType = 'practice' | 'exam'

interface CreateSetSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: SetType
    defaultLanguage?: AssessmentLanguage
    defaultMode?: AssessmentMode
    onSuccess?: (setId: string, slug: string, type: SetType) => void
}

export function CreateSetSheet({
    open,
    onOpenChange,
    type,
    defaultLanguage,
    defaultMode,
    onSuccess
}: CreateSetSheetProps) {
    const router = useRouter()
    const { user } = useUserStore()
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [language, setLanguage] = useState<AssessmentLanguage | ''>(defaultLanguage || '')
    const [mode, setMode] = useState<AssessmentMode>(defaultMode || (type === 'exam' ? 'MIXED' : 'QUIZ'))
    const [difficulty, setDifficulty] = useState<QuestionDifficulty>(type === 'exam' ? 'INTERMEDIATE' : 'EASY')
    const [questionCount, setQuestionCount] = useState(type === 'exam' ? 15 : 10)
    const [isPublic, setIsPublic] = useState(false)
    const [topics, setTopics] = useState<Topic[]>([])
    const [selectedTopicId, setSelectedTopicId] = useState<string>('')
    const [selectedSubModuleId, setSelectedSubModuleId] = useState<string>('')
    const [loadingTopics, setLoadingTopics] = useState(false)

    // Type-specific values
    const isPractice = type === 'practice'
    const creditCost = isPractice ? PRACTICE_SET_CREDIT_COST : EXAM_SET_CREDIT_COST
    const difficulties = isPractice ? PRACTICE_DIFFICULTIES : EXAM_DIFFICULTIES
    const questionCounts = isPractice ? PRACTICE_QUESTION_COUNTS : EXAM_QUESTION_COUNTS
    const typeLabel = isPractice ? 'Practice Set' : 'Exam'
    const TypeIcon = isPractice ? BookOpen : GraduationCap

    // Reset form when sheet opens or type changes
    useEffect(() => {
        if (open) {
            setTitle('')
            setDescription('')
            setLanguage(defaultLanguage || '')
            setMode(defaultMode || (type === 'exam' ? 'MIXED' : 'QUIZ'))
            setDifficulty(type === 'exam' ? 'INTERMEDIATE' : 'EASY')
            setQuestionCount(type === 'exam' ? 15 : 10)
            setIsPublic(false)
            setSelectedTopicId('')
            setSelectedSubModuleId('')
        }
    }, [open, type, defaultLanguage, defaultMode])

    // Fetch topics when language changes
    useEffect(() => {
        async function fetchTopics() {
            if (!language) {
                setTopics([])
                return
            }

            setLoadingTopics(true)
            try {
                const result = await getAssessmentTopics(language as AssessmentLanguage)
                if (result.success && result.data) {
                    setTopics(result.data as Topic[])
                }
            } catch (error) {
                console.error('Error fetching topics:', error)
            } finally {
                setLoadingTopics(false)
            }
        }

        fetchTopics()
    }, [language])

    // Reset submodule when topic changes
    useEffect(() => {
        setSelectedSubModuleId('')
    }, [selectedTopicId])

    const selectedTopic = topics.find(t => t.id === selectedTopicId)
    const isFormValid = title.trim() && language && selectedTopicId
    const hasEnoughCredits = (user?.credits || 0) >= creditCost

    const handleCreate = async () => {
        if (!isFormValid || !language) return

        setIsCreating(true)
        try {
            if (isPractice) {
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
                    toast.success('Practice set created successfully! Generating questions...')
                    onOpenChange(false)
                    if (onSuccess) {
                        onSuccess(result.practiceSetId, result.slug || '', 'practice')
                    } else {
                        router.push(`/assessments/practice/set/${result.practiceSetId}`)
                    }
                } else {
                    toast.error(result.error || 'Failed to create practice set')
                }
            } else {
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
                    toast.success('Exam created successfully! Generating questions...')
                    onOpenChange(false)
                    if (onSuccess) {
                        onSuccess(result.examSetId, result.slug || '', 'exam')
                    } else {
                        router.push(`/assessments/exam/set/${result.examSetId}`)
                    }
                } else {
                    toast.error(result.error || 'Failed to create exam')
                }
            }
        } catch (error) {
            console.error('Error creating set:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsCreating(false)
        }
    }

    if (!user) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-lg">
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <Lock className="w-12 h-12 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">Sign in required</h2>
                        <p className="text-muted-foreground text-center">
                            Please sign in to create {type === 'practice' ? 'practice sets' : 'exams'}
                        </p>
                        <Button onClick={() => router.push('/login')}>Sign In</Button>
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            isPractice ? "bg-blue-100 dark:bg-blue-900/30" : "bg-purple-100 dark:bg-purple-900/30"
                        )}>
                            <TypeIcon className={cn(
                                "w-5 h-5",
                                isPractice ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"
                            )} />
                        </div>
                        <div>
                            <SheetTitle>Create {typeLabel}</SheetTitle>
                            <SheetDescription>
                                AI-generated questions • {creditCost} credits
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6">
                    <div className="space-y-5 py-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder={isPractice ? "e.g., JavaScript Array Methods" : "e.g., React Advanced Certification"}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                            />
                        </div>

                        {/* Description */}
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
                                maxLength={500}
                                rows={2}
                            />
                        </div>

                        {/* Language */}
                        <div className="space-y-2">
                            <Label>Language *</Label>
                            <Select value={language} onValueChange={(v) => setLanguage(v as AssessmentLanguage)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(LANGUAGES).map(([key, lang]) => (
                                        <SelectItem key={key} value={key}>
                                            <span className="flex items-center gap-2">
                                                <span>{lang.icon}</span>
                                                <span>{lang.label}</span>
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Topic */}
                        {language && (
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    Topic *
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Select a topic for AI to generate questions</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </Label>
                                <Select 
                                    value={selectedTopicId} 
                                    onValueChange={setSelectedTopicId}
                                    disabled={loadingTopics}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={loadingTopics ? "Loading..." : "Select topic"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {topics.map((topic) => (
                                            <SelectItem key={topic.id} value={topic.id}>
                                                {topic.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* SubModule - Only for Practice */}
                        {isPractice && selectedTopic && selectedTopic.subModules.length > 0 && (
                            <div className="space-y-2">
                                <Label>
                                    Sub-topic
                                    <span className="text-muted-foreground text-xs ml-2">(optional)</span>
                                </Label>
                                <Select value={selectedSubModuleId} onValueChange={setSelectedSubModuleId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sub-topic (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedTopic.subModules.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.id}>
                                                {sub.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Mode */}
                        <div className="space-y-2">
                            <Label>Question Type</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {MODES.map((m) => {
                                    const isSelected = mode === m.key
                                    return (
                                        <button
                                            key={m.key}
                                            type="button"
                                            onClick={() => setMode(m.key)}
                                            className={cn(
                                                "flex items-center gap-2 p-2.5 rounded-lg border-2 transition-all text-left",
                                                isSelected
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-muted-foreground/50"
                                            )}
                                        >
                                            <m.icon className={cn("w-4 h-4", isSelected && "text-primary")} />
                                            <div>
                                                <p className="font-medium text-sm">{m.label}</p>
                                                <p className="text-xs text-muted-foreground">{m.description}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <div className={cn("grid gap-2", difficulties.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
                                {difficulties.map((diff) => (
                                    <button
                                        key={diff.key}
                                        type="button"
                                        onClick={() => setDifficulty(diff.key)}
                                        className={cn(
                                            "p-2.5 rounded-lg border-2 transition-all text-center",
                                            difficulty === diff.key
                                                ? "border-primary bg-primary/5"
                                                : "border-muted hover:border-muted-foreground/50"
                                        )}
                                    >
                                        <Badge className={diff.color}>{diff.label}</Badge>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question Count */}
                        <div className="space-y-2">
                            <Label>Number of Questions</Label>
                            <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {questionCounts.map((count) => (
                                        <SelectItem key={count} value={count.toString()}>
                                            {count} questions
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Public/Private */}
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                {isPublic ? (
                                    <Globe className="w-4 h-4 text-blue-500" />
                                ) : (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <div>
                                    <p className="font-medium text-sm">{isPublic ? 'Public' : 'Private'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isPublic ? 'Visible to everyone' : 'Only you can access'}
                                    </p>
                                </div>
                            </div>
                            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                        </div>

                        {/* Credit Info */}
                        <div className={cn(
                            "p-3 rounded-lg border flex items-center justify-between",
                            hasEnoughCredits 
                                ? "bg-muted/50" 
                                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                        )}>
                            <div className="flex items-center gap-2">
                                <Zap className={cn("w-4 h-4", hasEnoughCredits ? "text-amber-500" : "text-red-500")} />
                                <span className="text-sm">
                                    Cost: <strong>{creditCost} credits</strong>
                                </span>
                            </div>
                            <span className={cn(
                                "text-sm font-medium",
                                hasEnoughCredits ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                                You have {user?.credits || 0}
                            </span>
                        </div>

                        {!hasEnoughCredits && (
                            <p className="text-sm text-red-500 text-center">
                                Not enough credits.{' '}
                                <button 
                                    onClick={() => router.push('/credits')} 
                                    className="underline"
                                >
                                    Get more credits
                                </button>
                            </p>
                        )}
                    </div>
                </ScrollArea>

                <SheetFooter className="px-6 py-4 border-t">
                    <div className="flex gap-3 w-full">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 gap-2"
                            disabled={!isFormValid || !hasEnoughCredits || isCreating}
                            onClick={handleCreate}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Create {typeLabel}
                                </>
                            )}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
