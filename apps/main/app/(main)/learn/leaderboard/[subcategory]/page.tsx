import { getCategoryLeaderboard } from "@/actions/(main)/learn/leaderboard";
import { LeaderboardList } from "../_components/leaderboard-list";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryLeaderboardPage({ params }: { params: Promise<{ subcategory: string }> }) {
    const { subcategory } = await params;
    const { ranking, currentUserRank, categoryName, error } = await getCategoryLeaderboard(subcategory);

    if (error === "Category not found") {
        notFound();
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <p>Failed to load leaderboard. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{categoryName} Leaderboard</h1>
                <p className="text-muted-foreground text-lg">
                    Top learners mastering {categoryName || "this topic"}.
                </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <LeaderboardList ranking={ranking || []} currentUserRank={currentUserRank || null} />
            </div>
        </div>
    );
}
