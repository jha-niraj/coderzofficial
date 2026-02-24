import { getGlobalLeaderboard } from "@/actions/(main)/learn/leaderboard";
import { LeaderboardList } from "./_components/leaderboard-list";

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function GlobalLeaderboardPage() {
    const { ranking, currentUserRank, error } = await getGlobalLeaderboard();

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
                <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
                <p className="text-muted-foreground text-lg">
                    See where you stand among top learners globally.
                </p>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <LeaderboardList ranking={ranking || []} currentUserRank={currentUserRank || null} />
            </div>
        </div>
    );
}
