'use client'

import { useState } from 'react'
import {
    Tabs, TabsList, TabsTrigger, TabsContent
} from '@repo/ui/components/ui/tabs'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Brain, Code2, CheckCircle2, Video, FileText, Layers, ExternalLink,
    Play, ThumbsUp, ThumbsDown, Mic, Loader2
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useRouter } from 'next/navigation'
import {
    usePathfinderStore, type SubGoalResources
} from '@/app/store/pathfinderStore'
import CodeEditor from '@/components/main/code-editor'
import StudioFlashcardBlock from '@/components/studio/blocks/flashcard-block'
import {
    createPathfinderPracticeMockAndSession
} from '@/actions/(main)/pathfinder/practice-mock.action'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'

/** SubGoal shape expected by Quiz and Coding components */
interface SubGoalForTabs {
    id: string
    title: string
    aiQuizQuestions: unknown
    aiCodingProblem: unknown
    quizCompleted: boolean
    quizScore: number | null
    codingCompleted: boolean
    codingPassed: boolean
}

interface SubGoalContentTabsProps {
    subGoalId: string
    subGoalTitle: string
    aiResources: SubGoalResources | null | undefined
    aiQuizQuestions: unknown
    hasCoding: boolean
    aiCodingProblem: unknown
    quizCompleted: boolean
    quizScore: number | null
    codingCompleted: boolean
    codingPassed: boolean
    onQuizComplete: () => void
    onCodingComplete: () => void
    SubGoalQuizComponent: React.ComponentType<{ subGoal: SubGoalForTabs; onComplete: () => void }>
    SubGoalCodingComponent: React.ComponentType<{ subGoal: SubGoalForTabs; onComplete: () => void }>
    subGoal: SubGoalForTabs
}

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

export function SubGoalContentTabs({
    subGoalId,
    subGoalTitle,
    aiResources,
    aiQuizQuestions: _aiQuizQuestions,
    hasCoding,
    aiCodingProblem: _aiCodingProblem,
    quizCompleted,
    quizScore: _quizScore,
    codingCompleted,
    codingPassed,
    onQuizComplete,
    onCodingComplete,
    SubGoalQuizComponent,
    SubGoalCodingComponent,
    subGoal,
}: SubGoalContentTabsProps) {
    const router = useRouter()
    const storeResources = usePathfinderStore((s) => s.getSubGoalResources(subGoalId))
    const resources = aiResources ?? storeResources
    const [mockLoading, setMockLoading] = useState(false)

    const hasResources = Boolean(
        resources?.content ||
        (resources?.codeExamples?.length ?? 0) > 0 ||
        (resources?.videos?.length ?? 0) > 0 ||
        (resources?.documentations?.length ?? 0) > 0 ||
        (resources?.flashcards?.length ?? 0) > 0
    )

    const handleStartMock = async () => {
        setMockLoading(true)
        try {
            const result = await createPathfinderPracticeMockAndSession(subGoalId)
            if (result.success && result.sessionId) {
                router.push(`/mock/voice/interview/${result.sessionId}`)
            } else {
                toast.error(result.error ?? 'Failed to start mock')
            }
        } catch {
            toast.error('Failed to start mock')
        } finally {
            setMockLoading(false)
        }
    }

    return (
        <Tabs defaultValue="resources" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="flex-shrink-0 mx-4 mt-4 h-auto flex-wrap gap-1">
                <TabsTrigger value="resources" className="text-xs gap-1">
                    <FileText className="w-3 h-3" />
                    Resources
                </TabsTrigger>
                <TabsTrigger value="videos" className="text-xs gap-1">
                    <Video className="w-3 h-3" />
                    Videos
                </TabsTrigger>
                <TabsTrigger value="docs" className="text-xs gap-1">
                    <FileText className="w-3 h-3" />
                    Docs
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="text-xs gap-1">
                    <Layers className="w-3 h-3" />
                    Flashcards
                </TabsTrigger>
                <TabsTrigger value="quiz" className="text-xs gap-1">
                    <Brain className="w-3 h-3" />
                    Quiz
                    {quizCompleted && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                </TabsTrigger>
                {
                    hasCoding && (
                        <TabsTrigger value="coding" className="text-xs gap-1">
                            <Code2 className="w-3 h-3" />
                            Coding
                            {
                                codingCompleted && (
                                    <CheckCircle2
                                        className={cn(
                                            'w-3 h-3',
                                            codingPassed ? 'text-green-500' : 'text-red-500'
                                        )}
                                    />
                                )
                            }
                        </TabsTrigger>
                    )
                }
                <TabsTrigger value="mock" className="text-xs gap-1">
                    <Mic className="w-3 h-3" />
                    Mock Practice
                </TabsTrigger>
            </TabsList>
            <TabsContent value="resources" className="flex-1 overflow-hidden m-0 p-4">
                <ScrollArea className="h-full">
                    {
                        !hasResources ? (
                            <div className="text-center py-12 text-neutral-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Resources are loading...</p>
                            </div>
                        ) : (
                            <div className="space-y-6 pr-4">
                                {
                                    resources?.content && (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {resources.content}
                                            </ReactMarkdown>
                                        </div>
                                    )
                                }
                                {
                                    resources?.codeExamples && resources.codeExamples.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                Code Examples
                                            </h3>
                                            {
                                                resources.codeExamples.map((ex, i) => (
                                                    <div
                                                        key={i}
                                                        className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                                                    >
                                                        <div className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                                                            <span className="font-medium text-sm">{ex.title}</span>
                                                            {
                                                                ex.explanation && (
                                                                    <p className="text-xs text-neutral-500 mt-0.5">
                                                                        {ex.explanation}
                                                                    </p>
                                                                )
                                                            }
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
                                                ))
                                            }
                                        </div>
                                    )
                                }
                                {
                                    resources?.dosDonts && (resources.dosDonts.dos?.length > 0 || resources.dosDonts.donts?.length > 0) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="rounded-lg border border-green-200 dark:border-green-800/50 p-4 bg-green-50/50 dark:bg-green-950/20">
                                                <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    Do&apos;s
                                                </h4>
                                                <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                                                    {
                                                        resources.dosDonts.dos?.map((d, i) => (
                                                            <li key={i}>• {d}</li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                            <div className="rounded-lg border border-red-200 dark:border-red-800/50 p-4 bg-red-50/50 dark:bg-red-950/20">
                                                <h4 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                                                    <ThumbsDown className="w-4 h-4" />
                                                    Don&apos;ts
                                                </h4>
                                                <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                                                    {
                                                        resources.dosDonts.donts?.map((d, i) => (
                                                            <li key={i}>• {d}</li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </ScrollArea>
            </TabsContent>
            <TabsContent value="videos" className="flex-1 overflow-hidden m-0 p-4">
                <ScrollArea className="h-full">
                    {
                        !resources?.videos?.length ? (
                            <div className="text-center py-12 text-neutral-500">
                                <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No videos found</p>
                            </div>
                        ) : (
                            <div className="space-y-6 pr-4">
                                {
                                    resources.videos.map((v, i) => {
                                        const videoId = getYouTubeVideoId(v.url)
                                        return (
                                            <div
                                                key={i}
                                                className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                                            >
                                                {
                                                    videoId ? (
                                                        <div className="aspect-video bg-black">
                                                            <iframe
                                                                className="w-full h-full"
                                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                                title={v.description ?? 'Video'}
                                                                allowFullScreen
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                            <Video className="w-12 h-12 text-neutral-400" />
                                                        </div>
                                                    )
                                                }
                                                <div className="p-3">
                                                    {
                                                        v.description && (
                                                            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
                                                                {v.description}
                                                            </p>
                                                        )
                                                    }
                                                    <div className="flex items-center gap-2">
                                                        {
                                                            videoId && (
                                                                <a
                                                                    href={`https://www.youtube.com/watch?v=${videoId}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 text-sm text-violet-600 hover:underline"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                    Play on YouTube
                                                                </a>
                                                            )
                                                        }
                                                        {
                                                            v.duration && (
                                                                <span className="text-xs text-neutral-500">
                                                                    {v.duration}
                                                                </span>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    }
                </ScrollArea>
            </TabsContent>
            <TabsContent value="docs" className="flex-1 overflow-hidden m-0 p-4">
                <ScrollArea className="h-full">
                    {
                        !resources?.documentations?.length ? (
                            <div className="text-center py-12 text-neutral-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No documentation links found</p>
                            </div>
                        ) : (
                            <div className="space-y-3 pr-4">
                                {
                                    resources.documentations.map((d, i) => (
                                        <a
                                            key={i}
                                            href={d.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                        >
                                            <FileText className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                                    {d.url}
                                                </p>
                                                {
                                                    d.description && (
                                                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                                                            {d.description}
                                                        </p>
                                                    )
                                                }
                                                {
                                                    d.type && (
                                                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                                                            {d.type}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                        </a>
                                    ))
                                }
                            </div>
                        )
                    }
                </ScrollArea>
            </TabsContent>
            <TabsContent value="flashcards" className="flex-1 overflow-hidden m-0 p-4">
                {
                    !resources?.flashcards?.length ? (
                        <div className="text-center py-12 text-neutral-500">
                            <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No flashcards available</p>
                        </div>
                    ) : (
                        <StudioFlashcardBlock
                            deck={{
                                id: subGoalId,
                                title: subGoalTitle,
                                cards: resources.flashcards,
                            }}
                            skipSave
                        />
                    )
                }
            </TabsContent>
            <TabsContent value="quiz" className="flex-1 overflow-hidden m-0 p-4">
                <SubGoalQuizComponent subGoal={subGoal} onComplete={onQuizComplete} />
            </TabsContent>

            {
                hasCoding && (
                    <TabsContent value="coding" className="flex-1 overflow-hidden m-0 p-4">
                        <SubGoalCodingComponent subGoal={subGoal} onComplete={onCodingComplete} />
                    </TabsContent>
                )
            }

            <TabsContent value="mock" className="flex-1 overflow-hidden m-0 p-4">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-24 h-24 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
                        <Mic className="w-12 h-12 text-violet-500" />
                    </div>
                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white mb-2">
                        Mock Interview Practice
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-sm mb-6">
                        Practice your knowledge on &quot;{subGoalTitle}&quot; with an AI voice interview.
                        You&apos;ll be redirected to the interview page.
                    </p>
                    <Button
                        onClick={handleStartMock}
                        disabled={mockLoading}
                        className="bg-violet-600 hover:bg-violet-700 gap-2"
                    >
                        {
                            mockLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )
                        }
                        Start Mock Interview
                    </Button>
                </div>
            </TabsContent>
        </Tabs>
    )
}