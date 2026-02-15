import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
    getConceptBySlug, recordConceptView, getConceptChain
} from "@/actions/(main)/concepts/concept.action";
import { fetchXpAndCredit } from "@/actions/(main)/subscription/credits.action";
import { auth } from '@repo/auth';
import ConceptDetailClient from "./_components/concept-detail-client";
import ConceptDetailSkeleton from "./_components/concept-detail-skeleton";
import ConceptPurchaseGate from "./_components/concept-purchase-gate";
import ConceptPendingGate from "./_components/concept-pending-gate";

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
            title: "Concept Not Found | BuildrHQ",
        };
    }

    return {
        title: `${result.concept.title} | Concepts Hub | BuildrHQ`,
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

    const concept = result.concept;

    // Handle pending verification state - show gate for non-admins
    if (concept.status === "PENDING_VERIFICATION" && !result.isAdmin && !result.isCreator) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                <ConceptPendingGate concept={concept} />
            </div>
        );
    }

    // Handle paid concept purchase gate
    if (concept.pricingType === "PAID" && !result.hasFullAccess) {
        // Get user's credit balance
        const creditsData = userId ? await fetchXpAndCredit() : null;
        
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                <ConceptPurchaseGate 
                    concept={concept}
                    userCredits={creditsData?.credits || 0}
                    isLoggedIn={!!userId}
                />
            </div>
        );
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
                    isAdmin={result.isAdmin || false}
                    isCreator={result.isCreator || false}
                />
            </Suspense>
        </div>
    );
}