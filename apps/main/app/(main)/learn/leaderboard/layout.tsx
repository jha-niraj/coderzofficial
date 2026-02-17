import { getHierarchicalCategories } from "@/actions/(main)/learn/categories";
import { LeaderboardSidebar } from "./_components/leaderboard-sidebar";
import { notFound } from "next/navigation";

export default async function LeaderboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { categories, error } = await getHierarchicalCategories();

    if (error || !categories) {
        notFound();
    }

    return (
        <div className="flex h-screen bg-background">
            <LeaderboardSidebar categories={categories} />
            <main className="flex-1 overflow-auto p-8 relative">
                {children}
            </main>
        </div>
    );
}
