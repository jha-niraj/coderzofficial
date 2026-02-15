import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import { getCreatorConceptStats } from "@/actions/(main)/concepts/concept.action";
import ConceptsHomeClient from "./_components/concepts-home-client";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const metadata: Metadata = {
    title: "My Concepts | Creator Dashboard | TheCoderz",
    description: "Manage your concepts, track views, and monitor your earnings",
};

export const dynamic = "force-dynamic";

export default async function ConceptsHomePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const stats = await getCreatorConceptStats();

    if (stats.error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Failed to load data. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <Suspense fallback={<HomePageSkeleton />}>
                <ConceptsHomeClient
                    concepts={stats.concepts || []}
                    totalStats={stats.totalStats || {
                        totalConcepts: 0,
                        totalViews: 0,
                        totalLikes: 0,
                        totalBookmarks: 0,
                        totalComments: 0,
                        totalEarnings: 0,
                        totalPurchases: 0,
                        totalLearners: 0,
                    }}
                    statusCounts={stats.statusCounts || { draft: 0, pending: 0, published: 0, archived: 0 }}
                    recentPurchases={stats.recentPurchases || []}
                />
            </Suspense>
        </div>
    );
}

function HomePageSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-4 gap-6">
                {
                    [...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))
                }
            </div>
            <Skeleton className="h-[400px] rounded-xl" />
        </div>
    );
}