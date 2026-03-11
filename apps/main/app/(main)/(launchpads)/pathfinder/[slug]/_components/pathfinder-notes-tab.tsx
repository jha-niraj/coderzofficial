'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Code2, ThumbsUp, ThumbsDown, Sparkles, Send, Loader2,
    BookOpen, FileCode, StickyNote, ChevronDown, ChevronUp, Wand2
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { cn } from '@repo/ui/lib/utils'
import type { SubGoalResources } from '@/app/store/pathfinderStore'
import { MarkdownRenderer } from '@/components/common/markdown-renderer'
import CodeEditor from '@/components/main/code-editor'
import { StudioPanel } from '@/components/studio/studio-panel'
import { generateNotesContent } from '@/actions/(main)/pathfinder/studio-link.action'
import toast from '@repo/ui/components/ui/sonner'

interface PathfinderNotesTabProps {
    subGoalId: string
    subGoalTitle: string
    goalId: string
    aiResources: SubGoalResources | null | undefined
}

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
                    <span className="font-medium text-sm text-neutral-900 dark:text-white">{title}</span>
                    {badge && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{badge}</Badge>
                    )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
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
                        <div className="p-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

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
    const [userNotes, setUserNotes] = useState('')
    const [aiPrompt, setAiPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<string[]>([])
    const [showAiBar, setShowAiBar] = useState(false)
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    const hasResources = Boolean(
        aiResources?.content ||
        (aiResources?.codeExamples?.length ?? 0) > 0 ||
        (aiResources?.dosDonts?.dos?.length ?? 0) > 0 ||
        (aiResources?.dosDonts?.donts?.length ?? 0) > 0
    )

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }, [])

    useEffect(() => {
        if (generatedContent.length > 0) setTimeout(scrollToBottom, 100)
    }, [generatedContent, scrollToBottom])

    const handleGenerateContent = async (
        contentType: 'explanation' | 'summary' | 'examples' | 'custom',
        customPrompt?: string
    ) => {
        setIsGenerating(true)
        try {
            const result = await generateNotesContent(goalId, subGoalTitle, contentType, customPrompt)
            if (result.error) toast.error(result.error)
            else if (result.content) {
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

    const handleSubmitPrompt = () => {
        if (!aiPrompt.trim()) return
        handleGenerateContent('custom', aiPrompt)
    }

    return (
        <div className="flex h-full overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                <ScrollArea className="flex-1">
                    <div ref={scrollRef} className="space-y-4 p-4 pb-32">
                        {aiResources?.content && (
                            <ContentSection title="AI Explanation" icon={BookOpen} defaultOpen>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <MarkdownRenderer content={aiResources.content} />
                                </div>
                            </ContentSection>
                        )}

                        {aiResources?.codeExamples && aiResources.codeExamples.length > 0 && (
                            <ContentSection
                                title="Code Examples"
                                icon={Code2}
                                badge={`${aiResources.codeExamples.length}`}
                            >
                                <div className="space-y-4">
                                    {aiResources.codeExamples.map((ex, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                                        >
                                            <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                                                <span className="font-medium text-sm">{ex.title}</span>
                                                {ex.explanation && (
                                                    <p className="text-xs text-neutral-500 mt-0.5">{ex.explanation}</p>
                                                )}
                                            </div>
                                            <div className="min-h-[200px]">
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
                                        </div>
                                    ))}
                                </div>
                            </ContentSection>
                        )}

                        {aiResources?.dosDonts &&
                            (aiResources.dosDonts.dos?.length > 0 || aiResources.dosDonts.donts?.length > 0) && (
                                <ContentSection title="Best Practices" icon={ThumbsUp} defaultOpen={false}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-lg border border-green-200 dark:border-green-800/50 p-4 bg-green-50/50 dark:bg-green-950/20">
                                            <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                                                <ThumbsUp className="w-4 h-4" />
                                                Do&apos;s
                                            </h4>
                                            <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                                {aiResources.dosDonts.dos?.map((d, i) => (
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
                                                {aiResources.dosDonts.donts?.map((d, i) => (
                                                    <li key={i}>• {d}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </ContentSection>
                            )}

                        {generatedContent.length > 0 && (
                            <ContentSection
                                title="AI Generated Notes"
                                icon={Sparkles}
                                badge={`${generatedContent.length}`}
                            >
                                <div className="space-y-6">
                                    {generatedContent.map((content, i) => (
                                        <div key={i} className="relative">
                                            {i > 0 && <hr className="mb-6 border-neutral-200 dark:border-neutral-800" />}
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <MarkdownRenderer content={content} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ContentSection>
                        )}

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
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!hasResources && generatedContent.length === 0 && (
                            <div className="text-center py-8 text-neutral-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No notes yet</p>
                                <p className="text-sm mt-1">Use the AI tools below to generate study content</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3">
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
                                        className="self-end gap-1.5 bg-neutral-900 hover:bg-neutral-800"
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

            <div className="hidden lg:block w-[380px] flex-shrink-0 border-l border-neutral-200 dark:border-neutral-800">
                <StudioPanel
                    isOpen
                    onToggle={() => {}}
                    context={{
                        title: `Notes: ${subGoalTitle}`,
                        description: `Study notes for ${subGoalTitle}`,
                        source: 'manual',
                        sourceId: subGoalId,
                        topicLabel: subGoalTitle,
                    }}
                    isLoggedIn={true}
                    width="100%"
                    hideClose
                />
            </div>
        </div>
    )
}
