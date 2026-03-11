"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import {
    StickyNote, Target, BookOpen, Plus, Loader2
} from "lucide-react";
import type { StudioListItem } from "@/types/studios";
import { CreateStudioButton } from "./create-studio-button";
import { createStudio } from "@/actions/(main)/studios/studio.actions";
import toast from "@repo/ui/components/ui/sonner";

interface StudiosPageClientProps {
    studios: StudioListItem[];
    defaultTab: string;
    learnStudioIds?: string[];
}

export function StudiosPageClient({
    studios,
    defaultTab,
    learnStudioIds = [],
}: StudiosPageClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [isCreating, setIsCreating] = useState(false);

    const manualStudios = studios.filter((s) => s.source === "MANUAL");
    const pathfinderStudios = studios.filter((s) => s.source === "PATHFINDER");
    const learnStudios = studios.filter((s) => learnStudioIds.includes(s.id));

    const handleCreateAndRedirect = async () => {
        setIsCreating(true);
        try {
            const result = await createStudio({
                title: "Untitled Studio",
                description: "",
                source: "manual",
            });

            if (result.success && result.studio) {
                toast.success("Studio created!");
                const slug = result.studio.slug || result.studio.id;
                router.push(`/studio/${slug}`);
            } else {
                toast.error(result.error || "Failed to create studio");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsCreating(false);
        }
    };

    if (studios.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-4">
                    <StickyNote className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    No studios yet
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
                    Create a studio to start your learning workspace. Add notes, code snippets, quizzes, and more.
                    You can also create studios from Pathfinder goals or Spaces.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <CreateStudioButton />
                    <button
                        onClick={handleCreateAndRedirect}
                        disabled={isCreating}
                        className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    >
                        {isCreating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                        Create & Open
                    </button>
                    <Link
                        href="/pathfinder"
                        className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Go to Pathfinder
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
                    <TabsTrigger
                        value="notes"
                        className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm"
                    >
                        <StickyNote className="h-4 w-4" />
                        My Notes
                        <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded-full">
                            {manualStudios.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="pathfinder"
                        className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm"
                    >
                        <Target className="h-4 w-4" />
                        Pathfinder
                        <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded-full">
                            {pathfinderStudios.length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="learn"
                        className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm"
                    >
                        <BookOpen className="h-4 w-4" />
                        Learn
                        <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded-full">
                            {learnStudios.length}
                        </span>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="notes" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <StickyNote className="h-5 w-5 text-purple-500" />
                            My Notes
                        </h2>
                        <div className="flex gap-2">
                            <CreateStudioButton />
                            <button
                                onClick={handleCreateAndRedirect}
                                disabled={isCreating}
                                className="px-3 py-1.5 text-sm rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 flex items-center gap-2"
                            >
                                {
                                    isCreating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )
                                }
                                Create & Open
                            </button>
                        </div>
                    </div>
                    {
                        manualStudios.length === 0 ? (
                            <div className="text-center py-12 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                                <StickyNote className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    No personal studios yet. Create one to start taking notes.
                                </p>
                                <CreateStudioButton />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {
                                    manualStudios.map((studio) => (
                                        <StudioCard key={studio.id} studio={studio} />
                                    ))
                                }
                            </div>
                        )
                    }
                </TabsContent>
                <TabsContent value="pathfinder" className="mt-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-violet-500" />
                        From Pathfinder Goals
                    </h2>
                    {
                        pathfinderStudios.length === 0 ? (
                            <div className="text-center py-12 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                                <Target className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Studios from Pathfinder goals will appear here.
                                </p>
                                <Link
                                    href="/pathfinder"
                                    className="inline-block mt-4 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                                >
                                    Go to Pathfinder
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {
                                    pathfinderStudios.map((studio) => (
                                        <StudioCard key={studio.id} studio={studio} />
                                    ))
                                }
                            </div>
                        )
                    }
                </TabsContent>
                <TabsContent value="learn" className="mt-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-amber-500" />
                        From Learn
                    </h2>
                    {
                        learnStudios.length === 0 ? (
                            <div className="text-center py-12 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                                <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Studios linked to Learn courses will appear here.
                                </p>
                                <Link
                                    href="/learn"
                                    className="inline-block mt-4 text-sm text-amber-600 dark:text-amber-400 hover:underline"
                                >
                                    Browse Learn
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {
                                    learnStudios.map((studio) => (
                                        <StudioCard key={studio.id} studio={studio} />
                                    ))
                                }
                            </div>
                        )
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StudioCard({
    studio,
}: {
    studio: StudioListItem;
}) {
    const getUrl = () => {
        // Always link to studio viewer when we have slug or id
        if (studio.slug) return `/studio/${studio.slug}`;
        if (studio.id) return `/studio/${studio.id}`;
        if (studio.source === "PATHFINDER" && studio.sourceId) {
            return `/pathfinder/${studio.sourceId}`;
        }
        if (studio.source === "SPACE" && studio.sourceId) {
            return `/space/${studio.sourceId}`;
        }
        return `/studio`;
    };

    return (
        <Link
            href={getUrl()}
            className="block p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {studio.emoji && <span className="text-2xl">{studio.emoji}</span>}
                    <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {studio.title}
                    </h3>
                </div>
            </div>

            {
                studio.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                        {studio.description}
                    </p>
                )
            }

            <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{studio.stepCount} steps</span>
                {
                    studio.lastEditedAt && (
                        <span>
                            {formatDistanceToNow(new Date(studio.lastEditedAt), { addSuffix: true })}
                        </span>
                    )
                }
            </div>
        </Link>
    );
}