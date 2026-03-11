import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@repo/auth";
import { getUserStudios } from "@/actions/(main)/studios/studio.actions";
import {
    StickyNote, Target, Orbit
} from "lucide-react";
import Link from "next/link";
import type { StudioListItem } from "@/types/studios";
import { CreateStudioButton } from "./_components/create-studio-button";
import { StudiosPageClient } from "./_components/studios-page-client";

export const metadata: Metadata = {
    title: "My Studios | The Coderz",
    description: "Your AI-powered learning workspaces",
};

export default async function StudiosPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: string }>;
}) {
    const params = await searchParams;
    const defaultTab = params.tab === "pathfinder" ? "pathfinder" : params.tab === "learn" ? "learn" : "notes";

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <StickyNote className="h-5 w-5 text-white" />
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
                            <Target className="h-4 w-4 text-violet-500" />
                            <span className="text-violet-700 dark:text-violet-300">
                                Create from Pathfinder
                            </span>
                        </Link>
                        <Link
                            href="/space"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                        >
                            <Orbit className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-700 dark:text-blue-300">
                                Create from Spaces
                            </span>
                        </Link>
                    </div>
                </div>

                <Suspense fallback={<StudiosListSkeleton />}>
                    <StudiosContent defaultTab={defaultTab} />
                </Suspense>
            </div>
        </div>
    );
}

async function StudiosContent({ defaultTab }: { defaultTab: string }) {
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

    const studios = result.studios as StudioListItem[];
    const learnStudioIds = result.learnStudioIds ?? [];

    return (
        <StudiosPageClient
            studios={studios}
            defaultTab={defaultTab}
            learnStudioIds={learnStudioIds}
        />
    );
}

function StudiosListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
                    />
                ))}
            </div>
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
        </div>
    );
}
