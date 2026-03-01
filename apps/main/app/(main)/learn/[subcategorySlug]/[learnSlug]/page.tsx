import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getLearnBySlug, recordLearnView, getAdjacentLearns
} from "@/actions/(main)/learn/learn.action";
import { auth } from '@repo/auth';
import LearnDetailClient from "./_components/learn-detail-client";
import LearnDetailSkeleton from "./_components/learn-detail-skeleton";

interface LearnPageProps {
    params: Promise<{
        subcategorySlug: string;
        learnSlug: string;
    }>;
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
    const { learnSlug } = await params;
    const result = await getLearnBySlug(learnSlug);

    if (!result.learn) {
        return {
            title: "Learn Not Found | TheCoderz",
        };
    }

    return {
        title: `${result.learn.title} | Learns Hub | TheCoderz`,
        description: result.learn.description.slice(0, 160),
    };
}

export default async function LearnPage({ params }: LearnPageProps) {
    const { subcategorySlug, learnSlug } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const [result, adjacentResult] = await Promise.all([
        getLearnBySlug(learnSlug),
        getAdjacentLearns(learnSlug),
    ]);

    if (result.error || !result.learn) {
        notFound();
    }

    // Record view (non-blocking)
    recordLearnView(result.learn.id, "direct").catch(() => { });

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <Suspense fallback={<LearnDetailSkeleton />}>
                <LearnDetailClient
                    learn={result.learn}
                    isLiked={result.isLiked || false}
                    isBookmarked={result.isBookmarked || false}
                    progress={result.progress}
                    isLoggedIn={!!userId}
                    isAdmin={result.isAdmin || false}
                    isCreator={result.isCreator || false}
                    subcategorySlug={subcategorySlug}
                    previousLearn={adjacentResult.previousLearn}
                    nextLearn={adjacentResult.nextLearn}
                />
            </Suspense>
        </div>
    );
}