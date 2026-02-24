'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Video, ExternalLink, Layers, Code2, ThumbsUp, ThumbsDown,
    Sparkles, Send, Loader2, BookOpen, ListVideo, FileCode, StickyNote,
    ChevronDown, ChevronUp, Wand2
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@repo/ui/lib/utils'
import {
    usePathfinderStore, type SubGoalResources
} from '@/app/store/pathfinderStore'
import CodeEditor from '@/components/main/code-editor'
import StudioFlashcardBlock from '@/components/studio/blocks/flashcard-block'
import { generateNotesContent } from '@/actions/(main)/pathfinder/studio-link.action'
import toast from '@repo/ui/components/ui/sonner'

interface PathfinderNotesTabProps {
    subGoalId: string
    subGoalTitle: string
    goalId: string
    aiResources: SubGoalResources | null | undefined
}

// Content section component with collapsible behavior
function ContentSection({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
    badge,
}: {
    title: string
    icon: React.ComponentType<{ className?: string }>
    children: React.ReactNode
    defaultOpen?: boolean
    badge?: string
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-violet-500" />
                    <span className="font-medium text-sm text-neutral-900 dark:text-white">
                        {title}
                    </span>
                    {badge && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            {badge}
                        </Badge>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// YouTube video ID helper
function getYouTubeVideoId(url: string): string | null {
    try {
        const u = new URL(url)
        if (u.hostname.includes('youtube.com')) {
            return u.searchParams.get('v')
        }
        if (u.hostname.includes('youtu.be')) {
            return u.pathname.slice(1) || null
        }
    } catch {
        return null
    }
    return null
}

// AI Quick Action buttons
const AI_QUICK_ACTIONS = [
    { type: 'explanation' as const, label: 'Explain', icon: BookOpen, color: 'text-blue-500' },
    { type: 'summary' as const, label: 'Summarize', icon: StickyNote, color: 'text-green-500' },
    { type: 'examples' as const, label: 'Examples', icon: FileCode, color: 'text-orange-500' },
]

export function PathfinderNotesTab({
    subGoalId,
    subGoalTitle,
    goalId,
    aiResources,
}: PathfinderNotesTabProps) {
    const storeResources = usePathfinderStore((s) => s.getSubGoalResources(subGoalId))
    const resources = aiResources ?? storeResources

    const [userNotes, setUserNotes] = useState('')
    const [aiPrompt, setAiPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<string[]>([])
    const [showAiBar, setShowAiBar] = useState(false)
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    const hasResources = Boolean(
        resources?.content ||
        (resources?.codeExamples?.length ?? 0) > 0 ||
        (resources?.videos?.length ?? 0) > 0 ||
        (resources?.documentations?.length ?? 0) > 0 ||
        (resources?.flashcards?.length ?? 0) > 0
    )

    // Scroll to bottom when new content is generated
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [])

    useEffect(() => {
        if (generatedContent.length > 0) {
            setTimeout(scrollToBottom, 100)
        }
    }, [generatedContent, scrollToBottom])

    // Handle AI content generation
    const handleGenerateContent = async (
        contentType: 'explanation' | 'summary' | 'examples' | 'custom',
        customPrompt?: string
    ) => {
        setIsGenerating(true)
        try {
            const result = await generateNotesContent(
                goalId,
                subGoalTitle,
                contentType,
                customPrompt
            )

            if (result.error) {
                toast.error(result.error)
            } else if (result.content) {
                setGeneratedContent(prev => [...prev, result.content!])
                toast.success('Content generated!')
            }
        } catch {
            toast.error('Failed to generate content')
        } finally {
            setIsGenerating(false)
            setAiPrompt('')
        }
    }

    // Handle custom prompt submission
    const handleSubmitPrompt = () => {
        if (!aiPrompt.trim()) return
        handleGenerateContent('custom', aiPrompt)
    }

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1">
                <div ref={scrollRef} className="space-y-4 p-4 pb-32">
                    {/* AI Resources - Explanation Content */}
                    {resources?.content && (
                        <ContentSection
                            title="AI Explanation"
                            icon={BookOpen}
                            defaultOpen={true}
                        >
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {resources.content}
                                </ReactMarkdown>
                            </div>
                        </ContentSection>
                    )}

                    {/* Code Examples */}
                    {resources?.codeExamples && resources.codeExamples.length > 0 && (
                        <ContentSection
                            title="Code Examples"
                            icon={Code2}
                            badge={`${resources.codeExamples.length}`}
                        >
                            <div className="space-y-4">
                                {resources.codeExamples.map((ex, i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                                    >
                                        <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                                            <span className="font-medium text-sm">{ex.title}</span>
                                            {ex.explanation && (
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {ex.explanation}
                                                </p>
                                            )}
                                        </div>
                                        <CodeEditor
                                            code={ex.code}
                                            language={ex.language}
                                            readOnly
                                            showLanguageSelector={false}
                                            showCopyButton
                                            showRunButton={false}
                                            showSubmitButton={false}
                                            height="200px"
                                            className="border-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </ContentSection>
                    )}

                    {/* Videos */}
                    {resources?.videos && resources.videos.length > 0 && (
                        <ContentSection
                            title="Videos"
                            icon={ListVideo}
                            badge={`${resources.videos.length}`}
                            defaultOpen={false}
                        >
                            <div className="space-y-4">
                                {resources.videos.map((v, i) => {
                                    const videoId = getYouTubeVideoId(v.url)
                                    return (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                                        >
                                            {videoId ? (
                                                <div className="aspect-video bg-black">
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={`https://www.youtube.com/embed/${videoId}`}
                                                        title={v.description ?? 'Video'}
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : (
                                                <a
                                                    href={v.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                                >
                                                    <Video className="w-5 h-5 text-violet-500" />
                                                    <div className="flex-1">
                                                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                                            {v.description || v.url}
                                                        </p>
                                                        {v.duration && (
                                                            <span className="text-xs text-neutral-500">
                                                                {v.duration}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                                                </a>
                                            )}
                                            {videoId && v.description && (
                                                <div className="p-3 flex items-center justify-between">
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        {v.description}
                                                    </p>
                                                    {v.duration && (
                                                        <span className="text-xs text-neutral-500">
                                                            {v.duration}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </ContentSection>
                    )}

                    {/* Documentation Links */}
                    {resources?.documentations && resources.documentations.length > 0 && (
                        <ContentSection
                            title="Documentation"
                            icon={FileText}
                            badge={`${resources.documentations.length}`}
                            defaultOpen={false}
                        >
                            <div className="space-y-2">
                                {resources.documentations.map((d, i) => (
                                    <a
                                        key={i}
                                        href={d.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                    >
                                        <FileText className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                                {d.description || d.url}
                                            </p>
                                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                                                {d.url}
                                            </p>
                                            {d.type && (
                                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                                                    {d.type}
                                                </span>
                                            )}
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </ContentSection>
                    )}

                    {/* Do's and Don'ts */}
                    {resources?.dosDonts && (resources.dosDonts.dos?.length > 0 || resources.dosDonts.donts?.length > 0) && (
                        <ContentSection
                            title="Best Practices"
                            icon={ThumbsUp}
                            defaultOpen={false}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-lg border border-green-200 dark:border-green-800/50 p-4 bg-green-50/50 dark:bg-green-950/20">
                                    <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                                        <ThumbsUp className="w-4 h-4" />
                                        Do&apos;s
                                    </h4>
                                    <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                        {resources.dosDonts.dos?.map((d, i) => (
                                            <li key={i}>• {d}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="rounded-lg border border-red-200 dark:border-red-800/50 p-4 bg-red-50/50 dark:bg-red-950/20">
                                    <h4 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                                        <ThumbsDown className="w-4 h-4" />
                                        Don&apos;ts
                                    </h4>
                                    <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                                        {resources.dosDonts.donts?.map((d, i) => (
                                            <li key={i}>• {d}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </ContentSection>
                    )}

                    {/* Flashcards */}
                    {resources?.flashcards && resources.flashcards.length > 0 && (
                        <ContentSection
                            title="Flashcards"
                            icon={Layers}
                            badge={`${resources.flashcards.length}`}
                            defaultOpen={false}
                        >
                            <StudioFlashcardBlock
                                deck={{
                                    id: subGoalId,
                                    title: subGoalTitle,
                                    cards: resources.flashcards,
                                }}
                                skipSave
                            />
                        </ContentSection>
                    )}

                    {/* AI Generated Content (appended) */}
                    {generatedContent.length > 0 && (
                        <ContentSection
                            title="AI Generated Notes"
                            icon={Sparkles}
                            badge={`${generatedContent.length}`}
                        >
                            <div className="space-y-6">
                                {generatedContent.map((content, i) => (
                                    <div key={i} className="relative">
                                        {i > 0 && (
                                            <hr className="mb-6 border-neutral-200 dark:border-neutral-800" />
                                        )}
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ContentSection>
                    )}

                    {/* User Personal Notes */}
                    <ContentSection
                        title="My Notes"
                        icon={StickyNote}
                        defaultOpen={generatedContent.length === 0 && !hasResources}
                    >
                        <Textarea
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            placeholder="Write your personal notes here... ✍️"
                            className="min-h-[150px] resize-none border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 focus:ring-violet-500"
                        />
                    </ContentSection>

                    {/* Loading skeleton for generation */}
                    <AnimatePresence>
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-xl border border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-950/20 p-6"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles className="w-5 h-5 text-violet-500" />
                                    </motion.div>
                                    <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                                        Generating content...
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="h-3 rounded-full bg-violet-200/50 dark:bg-violet-800/30"
                                            style={{ width: `${85 - i * 15}%` }}
                                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Empty state */}
                    {!hasResources && generatedContent.length === 0 && (
                        <div className="text-center py-8 text-neutral-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No notes yet</p>
                            <p className="text-sm mt-1">
                                Use the AI tools below to generate study content, or write your own notes
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Bottom AI Prompt Bar */}
            <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
                {/* Quick action buttons */}
                <div className="flex items-center gap-2 mb-2">
                    {AI_QUICK_ACTIONS.map((action) => (
                        <Button
                            key={action.type}
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateContent(action.type)}
                            disabled={isGenerating}
                            className="text-xs gap-1.5 h-7"
                        >
                            <action.icon className={cn('w-3 h-3', action.color)} />
                            {action.label}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAiBar(!showAiBar)}
                        className="text-xs gap-1.5 h-7 ml-auto"
                    >
                        <Wand2 className="w-3 h-3 text-violet-500" />
                        Custom
                    </Button>
                </div>

                {/* Custom prompt input */}
                <AnimatePresence>
                    {showAiBar && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex gap-2">
                                <Textarea
                                    ref={promptRef}
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder={`Ask AI about "${subGoalTitle}"...`}
                                    className="flex-1 min-h-[60px] max-h-[100px] resize-none text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSubmitPrompt()
                                        }
                                    }}
                                />
                                <Button
                                    onClick={handleSubmitPrompt}
                                    disabled={!aiPrompt.trim() || isGenerating}
                                    className="self-end gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
