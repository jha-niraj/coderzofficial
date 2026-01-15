'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageCircle, HelpCircle, FileText, Image as ImageIcon, Code2, X,
    Loader2, Plus, Hash, Link as LinkIcon, Send, ExternalLink, ArrowLeft,
    FileQuestion, Sparkles, Trash2, Clock
} from 'lucide-react'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@repo/ui/components/ui/alert-dialog'
import { Label } from '@repo/ui/components/ui/label'
import { cn } from '@repo/ui/lib/utils'
import { CommunityPostType } from '@repo/prisma/client'
import { createPost } from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { uploadCommunityImage } from '@/actions/(main)/community/upload.action'
import { QuizQuestion } from '@/components/main/quiz'

// Dynamically import CodeEditor
const CodeEditor = dynamic(() => import('@/components/main/code-editor'), { ssr: false })

// ==================== TYPES ====================
interface PostComposerProps {
    communityId: string
    communitySlug?: string
    channelSlug?: string
    sectionType?: string
    channels?: Array<{
        id: string
        name: string
        slug: string
        icon?: string | null
    }>
    user: {
        id: string | null
        name: string | null
        image: string | null
    }
    onPostCreated?: () => void
    defaultType?: CommunityPostType
    compact?: boolean
}

interface ImageAttachment {
    url: string
    name: string
    type: 'image'
}

interface LinkAttachment {
    url: string
    title: string
    description?: string
    type: 'link'
}

interface CodeAttachment {
    code: string
    language: string
    type: 'code'
}

interface QuizAttachment {
    title: string
    description?: string
    questions: QuizQuestion[]
    type: 'quiz'
}

type Attachment = ImageAttachment | LinkAttachment | CodeAttachment | QuizAttachment

interface PostDraft {
    id: string
    title: string
    content: string
    postType: CommunityPostType
    tags: string[]
    attachments: Attachment[]
    createdAt: Date
    updatedAt: Date
}

const POST_TYPES = [
    { value: 'DISCUSSION', label: 'Discussion', icon: MessageCircle, description: 'Start a conversation' },
    { value: 'QUESTION', label: 'Question', icon: HelpCircle, description: 'Ask the community' },
    { value: 'RESOURCE', label: 'Resource', icon: FileText, description: 'Share something useful' },
    { value: 'SHOWCASE', label: 'Showcase', icon: ImageIcon, description: 'Show your work' },
    { value: 'HELP_REQUEST', label: 'Need Help', icon: Code2, description: 'Request assistance' },
] as const

type ComposerStep = 'main' | 'link' | 'code' | 'quiz'

// ==================== DRAFT MANAGEMENT ====================
function getDraftsKey(communityId: string) {
    return `post_drafts_${communityId}`
}

function saveDraft(communityId: string, draft: PostDraft) {
    if (typeof window === 'undefined') return
    const key = getDraftsKey(communityId)
    const drafts = getDrafts(communityId)
    const existingIndex = drafts.findIndex(d => d.id === draft.id)
    if (existingIndex >= 0) {
        drafts[existingIndex] = { ...draft, updatedAt: new Date() }
    } else {
        drafts.unshift(draft)
    }
    // Keep only last 10 drafts
    localStorage.setItem(key, JSON.stringify(drafts.slice(0, 10)))
}

function getDrafts(communityId: string): PostDraft[] {
    if (typeof window === 'undefined') return []
    const key = getDraftsKey(communityId)
    try {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

function deleteDraft(communityId: string, draftId: string) {
    if (typeof window === 'undefined') return
    const key = getDraftsKey(communityId)
    const drafts = getDrafts(communityId).filter(d => d.id !== draftId)
    localStorage.setItem(key, JSON.stringify(drafts))
}

// ==================== DEBOUNCE HOOK ====================
function useDebouncedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout>(null)

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return useCallback((...args: unknown[]) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => callback(...args), delay)
    }, [callback, delay]) as T
}

// ==================== MAIN COMPONENT ====================
export function PostComposer({
    communityId,
    channelSlug,
    sectionType,
    channels = [],
    user,
    onPostCreated,
    defaultType = 'DISCUSSION',
    compact = false
}: PostComposerProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [postType, setPostType] = useState<CommunityPostType>(defaultType)
    const [selectedChannel, setSelectedChannel] = useState<string>('')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')

    // Step-wise sheet
    const [currentStep, setCurrentStep] = useState<ComposerStep>('main')
    const [showSheet, setShowSheet] = useState(false)

    // Attachments
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Link form
    const [linkUrl, setLinkUrl] = useState('')
    const [linkTitle, setLinkTitle] = useState('')
    const [linkDescription, setLinkDescription] = useState('')

    // Code form
    const [codeContent, setCodeContent] = useState('')
    const [codeLanguage, setCodeLanguage] = useState('javascript')

    // Quiz form
    const [quizTitle, setQuizTitle] = useState('')
    const [quizDescription, setQuizDescription] = useState('')
    const [quizQuestionCount, setQuizQuestionCount] = useState('5')
    const [quizLevel, setQuizLevel] = useState('MEDIUM')
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
    const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[] | null>(null)

    // Draft management
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [showDraftsSheet, setShowDraftsSheet] = useState(false)
    const [drafts, setDrafts] = useState<PostDraft[]>([])

    // Load drafts on mount
    useEffect(() => {
        setDrafts(getDrafts(communityId))
    }, [communityId])

    // Auto-save draft with debounce
    const debouncedSaveDraft = useDebouncedCallback(() => {
        if (!content.trim() && !title.trim() && attachments.length === 0) return

        const draftId = currentDraftId || crypto.randomUUID()
        const draft: PostDraft = {
            id: draftId,
            title,
            content,
            postType,
            tags,
            attachments,
            createdAt: currentDraftId ? getDrafts(communityId).find(d => d.id === draftId)?.createdAt || new Date() : new Date(),
            updatedAt: new Date()
        }
        saveDraft(communityId, draft)
        setCurrentDraftId(draftId)
        setDrafts(getDrafts(communityId))
    }, 2000)

    // Trigger draft save on content changes
    useEffect(() => {
        if (isExpanded) {
            debouncedSaveDraft()
        }
    }, [content, title, postType, tags, isExpanded, debouncedSaveDraft])

    // Save draft immediately on attachments change
    const saveImmediately = useCallback(() => {
        if (!content.trim() && !title.trim() && attachments.length === 0) return

        const draftId = currentDraftId || crypto.randomUUID()
        const draft: PostDraft = {
            id: draftId,
            title,
            content,
            postType,
            tags,
            attachments,
            createdAt: currentDraftId ? getDrafts(communityId).find(d => d.id === draftId)?.createdAt || new Date() : new Date(),
            updatedAt: new Date()
        }
        saveDraft(communityId, draft)
        setCurrentDraftId(draftId)
        setDrafts(getDrafts(communityId))
    }, [attachments, communityId, content, currentDraftId, postType, tags, title])

    useEffect(() => {
        if (attachments.length > 0) {
            saveImmediately()
        }
    }, [attachments.length, saveImmediately])

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error('Please write something')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await createPost({
                communityId: communityId || '',
                channelId: selectedChannel || undefined,
                officialChannel: channelSlug || undefined,
                title: title.trim() || undefined,
                content: content.trim(),
                type: postType,
                tags,
                attachments: attachments.length > 0 ? attachments.map(a => ({
                    type: a.type,
                    url: 'url' in a ? a.url : '',
                    name: 'name' in a ? a.name : ('title' in a ? a.title : 'Attachment'),
                    ...(a.type === 'code' && { code: a.code, language: a.language }),
                    ...(a.type === 'link' && { description: a.description }),
                    ...(a.type === 'quiz' && { questions: a.questions }),
                })) : undefined,
                codeBlocks: attachments
                    .filter((a): a is CodeAttachment => a.type === 'code')
                    .map(c => ({ code: c.code, language: c.language }))
            })

            if (result.success) {
                toast.success('Post created!')
                // Delete draft on success
                if (currentDraftId) {
                    deleteDraft(communityId, currentDraftId)
                    setDrafts(getDrafts(communityId))
                }
                resetForm()
                onPostCreated?.()
            } else {
                toast.error(result.error || 'Failed to create post')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setIsExpanded(false)
        setTitle('')
        setContent('')
        setTags([])
        setAttachments([])
        setCurrentDraftId(null)
        setCurrentStep('main')
        setShowSheet(false)
    }

    const handleCancel = () => {
        if (content.trim() || title.trim() || attachments.length > 0) {
            setShowCancelDialog(true)
        } else {
            resetForm()
        }
    }

    const loadDraft = (draft: PostDraft) => {
        setTitle(draft.title)
        setContent(draft.content)
        setPostType(draft.postType)
        setTags(draft.tags)
        setAttachments(draft.attachments)
        setCurrentDraftId(draft.id)
        setShowDraftsSheet(false)
        setIsExpanded(true)
    }

    const handleDeleteDraft = (draftId: string) => {
        deleteDraft(communityId, draftId)
        setDrafts(getDrafts(communityId))
        toast.success('Draft deleted')
    }

    const handleAddTag = () => {
        const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        if (tag && !tags.includes(tag) && tags.length < 5) {
            setTags([...tags, tag])
            setTagInput('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB')
            return
        }

        setIsUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', 'communities')

            const result = await uploadCommunityImage(formData)
            if (result.success && result.url) {
                setAttachments(prev => [...prev, {
                    url: result.url!,
                    name: file.name,
                    type: 'image'
                }])
                toast.success('Image uploaded!')
            } else {
                toast.error(result.error || 'Failed to upload image')
            }
        } catch {
            toast.error('Failed to upload image')
        } finally {
            setIsUploadingImage(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleAddLink = () => {
        if (!linkUrl.trim()) {
            toast.error('Please enter a URL')
            return
        }

        try {
            new URL(linkUrl)
        } catch {
            toast.error('Please enter a valid URL')
            return
        }

        setAttachments(prev => [...prev, {
            url: linkUrl.trim(),
            title: linkTitle.trim() || linkUrl.trim(),
            description: linkDescription.trim() || undefined,
            type: 'link'
        }])

        setLinkUrl('')
        setLinkTitle('')
        setLinkDescription('')
        setCurrentStep('main')
        toast.success('Link added!')
    }

    const handleAddCode = () => {
        if (!codeContent.trim()) {
            toast.error('Please enter some code')
            return
        }

        setAttachments(prev => [...prev, {
            code: codeContent.trim(),
            language: codeLanguage,
            type: 'code'
        }])

        setCodeContent('')
        setCodeLanguage('javascript')
        setCurrentStep('main')
        setCodeLanguage('javascript')
        setCurrentStep('main')
        toast.success('Code snippet added!')
    }

    const handleGenerateQuiz = async () => {
        if (!quizTitle.trim()) {
            toast.error('Please enter a quiz title')
            return
        }

        setIsGeneratingQuiz(true)
        try {
            const { generateQuiz } = await import('@/actions/(main)/community/post.action')
            const result = await generateQuiz({
                title: quizTitle,
                description: quizDescription,
                questionCount: parseInt(quizQuestionCount),
                level: quizLevel as 'EASY' | 'MEDIUM' | 'HARD'
            })

            if (!result.success || !result?.data?.questions) {
                throw new Error(result.error || 'Failed to generate quiz')
            }

            setGeneratedQuiz(result.data.questions as QuizQuestion[])
            toast.success('Quiz generated!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate quiz')
        } finally {
            setIsGeneratingQuiz(false)
        }
    }

    // handleGenerateQuiz removed as it was unused and replaced by inline handler

    const handleAddQuiz = () => {
        if (!generatedQuiz || generatedQuiz.length === 0) {
            toast.error('Please generate a quiz first')
            return
        }

        setAttachments(prev => [...prev, {
            title: quizTitle,
            description: quizDescription,
            questions: generatedQuiz,
            type: 'quiz'
        }])

        setQuizTitle('')
        setQuizDescription('')
        setGeneratedQuiz(null)
        setCurrentStep('main')
        toast.success('Quiz added to post!')
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    const openStep = (step: ComposerStep) => {
        setCurrentStep(step)
        setShowSheet(true)
    }

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 'link':
                return (
                    <div className="space-y-4 p-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentStep('main')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h3 className="text-lg font-bold">Add Link</h3>
                                <p className="text-sm text-neutral-500">Add a link to your post</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="linkUrl">URL</Label>
                                <Input
                                    id="linkUrl"
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkTitle">Title (optional)</Label>
                                <Input
                                    id="linkTitle"
                                    placeholder="Link title"
                                    value={linkTitle}
                                    onChange={(e) => setLinkTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkDescription">Description (optional)</Label>
                                <Textarea
                                    id="linkDescription"
                                    placeholder="Brief description"
                                    value={linkDescription}
                                    onChange={(e) => setLinkDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1" onClick={() => setCurrentStep('main')}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleAddLink}>
                                Add Link
                            </Button>
                        </div>
                    </div>
                )

            case 'code':
                return (
                    <div className="space-y-4 p-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentStep('main')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h3 className="text-lg font-bold">Add Code</h3>
                                <p className="text-sm text-neutral-500">Add a code snippet to your post</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Language</Label>
                                <Select value={codeLanguage} onValueChange={setCodeLanguage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="typescript">TypeScript</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="cpp">C++</SelectItem>
                                        <SelectItem value="go">Go</SelectItem>
                                        <SelectItem value="rust">Rust</SelectItem>
                                        <SelectItem value="html">HTML</SelectItem>
                                        <SelectItem value="css">CSS</SelectItem>
                                        <SelectItem value="sql">SQL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Code</Label>
                                <CodeEditor
                                    code={codeContent}
                                    language={codeLanguage}
                                    height="300px"
                                    onChange={(code) => setCodeContent(code)}
                                    onLanguageChange={(lang) => setCodeLanguage(lang)}
                                    showLanguageSelector={false}
                                    showCopyButton
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" className="flex-1" onClick={() => setCurrentStep('main')}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleAddCode}>
                                Add Code
                            </Button>
                        </div>
                    </div>
                )

            case 'quiz':
                return (
                    <div className="space-y-4 p-4">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentStep('main')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h3 className="text-lg font-bold">Generate Quiz</h3>
                                <p className="text-sm text-neutral-500">Create an AI-powered quiz</p>
                            </div>
                        </div>

                        {!generatedQuiz ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quizTitle">Quiz Title</Label>
                                    <Input
                                        id="quizTitle"
                                        placeholder="e.g., JavaScript Fundamentals"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quizDescription">Description (optional)</Label>
                                    <Textarea
                                        id="quizDescription"
                                        placeholder="Brief description of the quiz"
                                        value={quizDescription}
                                        onChange={(e) => setQuizDescription(e.target.value)}
                                        rows={2}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Number of Questions</Label>
                                        <Select value={quizQuestionCount} onValueChange={setQuizQuestionCount}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5 Questions</SelectItem>
                                                <SelectItem value="10">10 Questions</SelectItem>
                                                <SelectItem value="15">15 Questions</SelectItem>
                                                <SelectItem value="20">20 Questions</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Difficulty</Label>
                                        <Select value={quizLevel} onValueChange={setQuizLevel}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EASY">Easy</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HARD">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button
                                    className="w-full gap-2"
                                    onClick={handleGenerateQuiz}
                                    disabled={isGeneratingQuiz || !quizTitle.trim()}
                                >
                                    {
                                        isGeneratingQuiz ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )
                                    }
                                    Generate Quiz with AI
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <FileQuestion className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-green-800 dark:text-green-200">
                                                {quizTitle}
                                            </p>
                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                {generatedQuiz.length} questions generated
                                            </p>
                                        </div>
                                    </div>

                                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        {generatedQuiz.map((q, i) => (
                                            <div key={i} className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm">
                                                <p className="font-medium mb-2">{i + 1}. {q.text}</p>
                                                <div className="grid grid-cols-1 gap-1 pl-2 border-l-2 border-neutral-100 dark:border-neutral-800">
                                                    {q.options.map((opt, optI) => (
                                                        <div key={optI} className={cn(
                                                            "px-2 py-1 rounded text-xs",
                                                            opt.isCorrect && "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium"
                                                        )}>
                                                            {opt.text}
                                                            {opt.isCorrect && " ✓"}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setGeneratedQuiz(null)}
                                    >
                                        Regenerate
                                    </Button>
                                    <Button className="flex-1" onClick={handleAddQuiz}>
                                        Add to Post
                                    </Button>
                                </div>
                            </div>
                        )
                        }

                        <Button variant="ghost" className="w-full" onClick={() => setCurrentStep('main')}>
                            Back
                        </Button>
                    </div >
                )

            default:
                return null
        }
    }

    return (
        <>
            <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
                <CardContent className={compact ? "p-3" : "p-4"}>
                    {/* Collapsed state */}
                    {!isExpanded && (
                        <div className="flex items-center gap-3">
                            <div
                                className="flex items-center gap-3 flex-1 cursor-pointer"
                                onClick={() => setIsExpanded(true)}
                            >
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={user.image ?? undefined} />
                                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                        {user.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 py-2.5 px-4 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    {sectionType === 'QA' ? 'Ask a question...' :
                                        sectionType === 'RESOURCES' ? 'Share a resource...' :
                                            sectionType === 'SHOWCASE' ? 'Showcase your work...' :
                                                'Share something with the community...'}
                                </div>
                            </div>
                            {drafts.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-neutral-500"
                                    onClick={() => setShowDraftsSheet(true)}
                                >
                                    <Clock className="w-4 h-4" />
                                    {drafts.length} draft{drafts.length > 1 ? 's' : ''}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Expanded state */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={user.image ?? undefined} />
                                            <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                                {user.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-sm text-neutral-900 dark:text-white">
                                                {user.name || 'You'}
                                            </div>
                                            <div className="text-xs text-neutral-500">Creating a post</div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleCancel}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                {/* Post type selector */}
                                <div className="flex flex-wrap gap-2">
                                    {POST_TYPES.map((type) => {
                                        const Icon = type.icon
                                        const isSelected = postType === type.value
                                        return (
                                            <Button
                                                key={type.value}
                                                variant={isSelected ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setPostType(type.value)}
                                                className={cn(
                                                    "rounded-full gap-1.5",
                                                    isSelected
                                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                        : "border-neutral-200 dark:border-neutral-700"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {type.label}
                                            </Button>
                                        )
                                    })}
                                </div>

                                {/* Channel selector */}
                                {channels.length > 0 && !channelSlug && (
                                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                                        <SelectTrigger className="w-full bg-neutral-50 dark:bg-neutral-800">
                                            <SelectValue placeholder="Select a channel (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general_channel">General</SelectItem>
                                            {channels.map((channel) => (
                                                <SelectItem key={channel.id} value={channel.id}>
                                                    {channel.icon} {channel.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Title input for certain types */}
                                {(postType === 'QUESTION' || postType === 'RESOURCE' || postType === 'SHOWCASE') && (
                                    <Input
                                        placeholder={
                                            postType === 'QUESTION' ? "What's your question?" :
                                                postType === 'RESOURCE' ? "Resource title" :
                                                    "Give your showcase a title"
                                        }
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                    />
                                )}

                                {/* Content textarea */}
                                <Textarea
                                    placeholder={
                                        postType === 'QUESTION' ? "Provide more details about your question..." :
                                            postType === 'HELP_REQUEST' ? "Describe what you need help with..." :
                                                "Write your thoughts..."
                                    }
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={4}
                                    className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 resize-none"
                                />

                                {/* Attachments preview */}
                                {attachments.length > 0 && (
                                    <div className="space-y-2">
                                        {attachments.map((attachment, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                                            >
                                                {attachment.type === 'image' && (
                                                    <>
                                                        <div className="w-16 h-16 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex-shrink-0">
                                                            <Image
                                                                src={attachment.url}
                                                                alt={attachment.name}
                                                                width={64}
                                                                height={64}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                                                            <p className="text-xs text-neutral-500">Image</p>
                                                        </div>
                                                    </>
                                                )}
                                                {attachment.type === 'link' && (
                                                    <>
                                                        <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{attachment.title}</p>
                                                            <p className="text-xs text-neutral-500 truncate">{attachment.url}</p>
                                                        </div>
                                                    </>
                                                )}
                                                {attachment.type === 'code' && (
                                                    <>
                                                        <div className="w-10 h-10 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                                            <Code2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">Code Snippet</p>
                                                            <p className="text-xs text-neutral-500">{attachment.language}</p>
                                                        </div>
                                                    </>
                                                )}
                                                {attachment.type === 'quiz' && (
                                                    <>
                                                        <div className="w-10 h-10 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                                            <FileQuestion className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{attachment.title}</p>
                                                            <p className="text-xs text-neutral-500">{attachment.questions.length} questions</p>
                                                        </div>
                                                    </>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 flex-shrink-0"
                                                    onClick={() => removeAttachment(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Tags */}
                                <div className="space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 gap-1">
                                                #{tag}
                                                <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-500">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                    {tags.length < 5 && (
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                <Input
                                                    placeholder="Add tag"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddTag()
                                                        }
                                                    }}
                                                    className="pl-9 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                                                />
                                            </div>
                                            <Button variant="outline" size="icon" onClick={handleAddTag} disabled={!tagInput.trim()}>
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-xs text-neutral-500">Add up to 5 tags</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <div className="flex gap-1">
                                        {/* Image Upload */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 text-neutral-500"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploadingImage}
                                        >
                                            {isUploadingImage ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5" />
                                            )}
                                        </Button>

                                        {/* Link */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 text-neutral-500"
                                            onClick={() => openStep('link')}
                                        >
                                            <LinkIcon className="w-5 h-5" />
                                        </Button>

                                        {/* Code */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 text-neutral-500"
                                            onClick={() => openStep('code')}
                                        >
                                            <Code2 className="w-5 h-5" />
                                        </Button>

                                        {/* Quiz */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 text-neutral-500"
                                            onClick={() => openStep('quiz')}
                                        >
                                            <FileQuestion className="w-5 h-5" />
                                        </Button>
                                    </div>

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !content.trim()}
                                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 gap-2"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        Post
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Step-wise Sheet */}
            <Sheet open={showSheet} onOpenChange={setShowSheet}>
                <SheetContent side="bottom" className="h-[80vh] sm:h-[70vh] rounded-t-3xl p-0">
                    <div className="max-w-2xl mx-auto h-full overflow-y-auto">
                        <div className="flex justify-center pt-4 pb-2">
                            <div className="w-12 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                        {renderStepContent()}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Drafts Sheet */}
            <Sheet open={showDraftsSheet} onOpenChange={setShowDraftsSheet}>
                <SheetContent side="right" className="w-full sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Saved Drafts</SheetTitle>
                        <SheetDescription>
                            Your unsaved posts are stored locally
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        {drafts.length === 0 ? (
                            <p className="text-center text-neutral-500 py-8">No drafts saved</p>
                        ) : (
                            drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                                    onClick={() => loadDraft(draft)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {draft.title || draft.content.slice(0, 50) || 'Untitled draft'}
                                            </p>
                                            <p className="text-sm text-neutral-500 truncate mt-1">
                                                {draft.content.slice(0, 100)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {draft.postType}
                                                </Badge>
                                                <span className="text-xs text-neutral-400">
                                                    {new Date(draft.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-8 h-8 text-red-500 flex-shrink-0"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeleteDraft(draft.id)
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Cancel Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your post is saved as a draft. You can continue editing later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                saveImmediately()
                                resetForm()
                            }}
                        >
                            Save & Close
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}