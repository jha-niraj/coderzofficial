import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getLearnBySlug, recordLearnView
} from "@/actions/(main)/learn/learn.action";
import { auth } from '@repo/auth';
import LearnDetailClient from "./_components/learn-detail-client";
import LearnDetailSkeleton from "./_components/learn-detail-skeleton";

interface LearnPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getLearnBySlug(slug);

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
    const { slug } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const result = await getLearnBySlug(slug);

    if (result.error || !result.learn) {
        notFound();
    }

    const _learn = result.learn;

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
                />
            </Suspense>
        </div>
    );
}