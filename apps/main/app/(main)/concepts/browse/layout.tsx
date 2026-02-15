import { BrowseSidebar } from "./_components/browse-sidebar";
import { getCategories } from "@/actions/(main)/concepts/concept.action";
import { Suspense } from "react";

export default async function BrowseLayout({ children }: { children: React.ReactNode }) {
    const categoriesResult = await getCategories();
    const categories = categoriesResult.categories || [];

    // Calculate accurate total concepts count from categories
    const totalConcepts = categories.reduce((acc, cat) => acc + cat._count, 0);

    return (
        <div className="flex h-screen bg-white dark:bg-neutral-950 overflow-hidden">
            {/* Left Sidebar - Fixed Width */}
            <div className="w-[320px] max-w-[320px] flex-shrink-0 h-full hidden lg:block border-r border-neutral-200 dark:border-neutral-800">
                <Suspense fallback={<div className="p-6">Loading filters...</div>}>
                    <BrowseSidebar totalConcepts={totalConcepts} />
                </Suspense>
            </div>

            {/* Main Content - Flexible Width */}
            <main className="flex-1 h-full overflow-y-auto">
                <div className="h-full w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
