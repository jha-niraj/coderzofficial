import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getConceptBySlug, recordConceptView, getConceptChain
} from "@/actions/(main)/concepts/concept.action";
import { auth } from '@repo/auth';
import ConceptDetailClient from "./_components/concept-detail-client";
import ConceptDetailSkeleton from "./_components/concept-detail-skeleton";

interface ConceptPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: ConceptPageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getConceptBySlug(slug);

    if (!result.concept) {
        return {
            title: "Concept Not Found | TheCoderz",
        };
    }

    return {
        title: `${result.concept.title} | Concepts Hub | TheCoderz`,
        description: result.concept.description.slice(0, 160),
    };
}

export default async function ConceptPage({ params }: ConceptPageProps) {
    const { slug } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const result = await getConceptBySlug(slug);

    if (result.error || !result.concept) {
        notFound();
    }

    // Record view (non-blocking)
    recordConceptView(result.concept.id, "direct").catch(() => { });

    // Fetch learning path chain
    const chain = await getConceptChain(result.concept.id);

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <Suspense fallback={<ConceptDetailSkeleton />}>
                <ConceptDetailClient
                    concept={result.concept}
                    isLiked={result.isLiked || false}
                    isBookmarked={result.isBookmarked || false}
                    progress={result.progress}
                    isLoggedIn={!!userId}
                    previousConcepts={chain.previous || []}
                    nextConcepts={chain.next || []}
                />
            </Suspense>
        </div>
    );
}