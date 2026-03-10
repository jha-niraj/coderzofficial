import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@repo/auth";
import { getUserStudios } from "@/actions/(main)/studios/studio.actions";
import { 
    StickyNote, Target, Orbit
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { StudioListItem } from "@/types/studios";
import { CreateStudioButton } from "./_components/create-studio-button";

export const metadata: Metadata = {
    title: "My Studios | The Coderz",
    description: "Your AI-powered learning workspaces",
};

export default async function StudiosPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <StickyNote className="w-5 h-5 text-white" />
                                </div>
                                My Studios
                            </h1>
                            <p className="text-neutral-500 mt-2 text-sm">
                                AI-powered learning workspaces for notes, code, quizzes, and more.
                            </p>
                        </div>
                        <CreateStudioButton />
                    </div>

                    {/* Context info cards */}
                    <div className="flex items-center gap-3 mt-4">
                        <Link
                            href="/pathfinder"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-sm"
                        >
                            <Target className="w-4 h-4 text-violet-500" />
                            <span className="text-violet-700 dark:text-violet-300">
                                Create from Pathfinder
                            </span>
                        </Link>
                        <Link
                            href="/space"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                        >
                            <Orbit className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-700 dark:text-blue-300">
                                Create from Spaces
                            </span>
                        </Link>
                    </div>
                </div>

                <Suspense fallback={<StudiosListSkeleton />}>
                    <StudiosContent />
                </Suspense>
            </div>
        </div>
    );
}

async function StudiosContent() {
    const session = await auth();

    if (!session?.user?.id) {
        return (
            <div className="text-center py-20">
                <p className="text-neutral-600 dark:text-neutral-400">
                    Sign in to view your studios
                </p>
            </div>
        );
    }

    const result = await getUserStudios();

    if (!result.success || !result.studios) {
        return (
            <div className="text-center py-20">
                <p className="text-red-600 dark:text-red-400">
                    {result.error || "Failed to load studios"}
                </p>
            </div>
        );
    }

    if (result.studios.length === 0) {
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

    // Group studios by source
    const pathfinderStudios = result.studios.filter((s) => s.source === "PATHFINDER");
    const spaceStudios = result.studios.filter((s) => s.source === "SPACE");
    const manualStudios = result.studios.filter((s) => s.source === "MANUAL");

    return (
        <div className="space-y-8">
            {pathfinderStudios.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-violet-500" />
                        From Pathfinder Goals
                        <span className="text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {pathfinderStudios.length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pathfinderStudios.map((studio) => (
                            <StudioCard key={studio.id} studio={studio} />
                        ))}
                    </div>
                </section>
            )}

            {spaceStudios.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Orbit className="h-5 w-5 text-blue-500" />
                        From Learning Spaces
                        <span className="text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {spaceStudios.length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {spaceStudios.map((studio) => (
                            <StudioCard key={studio.id} studio={studio} />
                        ))}
                    </div>
                </section>
            )}

            {manualStudios.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <StickyNote className="h-5 w-5 text-purple-500" />
                        Personal Studios
                        <span className="text-sm font-normal text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                            {manualStudios.length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {manualStudios.map((studio) => (
                            <StudioCard key={studio.id} studio={studio} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function StudioCard({ studio }: { studio: StudioListItem }) {
    const getSourceUrl = () => {
        if (studio.source === "PATHFINDER" && studio.sourceId) {
            return `/pathfinder?goalId=${studio.sourceId}`;
        }
        if (studio.source === "SPACE" && studio.sourceId) {
            return `/space/${studio.sourceId}`;
        }
        return "/studios";
    };

    return (
        <Link
            href={getSourceUrl()}
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

            {studio.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                    {studio.description}
                </p>
            )}

            <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{studio.stepCount} steps</span>
                {studio.lastEditedAt && (
                    <span>
                        {formatDistanceToNow(new Date(studio.lastEditedAt), { addSuffix: true })}
                    </span>
                )}
            </div>
        </Link>
    );
}

function StudiosListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 animate-pulse"
                >
                    <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded mb-3 w-3/4" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2 w-full" />
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-3 w-2/3" />
                    <div className="flex justify-between">
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
                        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
}
