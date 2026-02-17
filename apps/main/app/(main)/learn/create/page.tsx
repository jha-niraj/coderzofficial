import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import LearnBlockEditor from "./_components/learn-block-editor";
import { LearnCategorySelector } from "./_components/learn-category-selector";
import { getHierarchicalCategories } from "@/actions/(main)/learn/learn.action";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const metadata: Metadata = {
    title: "Create Learn | TheCoderz",
    description: "Create a new Learn for the Learns Hub",
};

export const dynamic = "force-dynamic";

export default async function CreateLearnPage({
    searchParams,
}: {
    searchParams: Promise<{ 
        mainCategoryId?: string; 
        subCategoryId?: string; 
        edit?: string 
    }>;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const params = await searchParams;

    // Fetch categories once, as they might be needed for both editor and selector
    const { categories } = await getHierarchicalCategories();

    // If editing or main/sub category selected, show editor
    if (params.edit || (params.mainCategoryId && params.subCategoryId)) {
        return (
            <div className="h-full bg-background">
                <Suspense fallback={<CreateFormSkeleton />}>
                    <LearnBlockEditor
                        initialMainCategoryId={params.mainCategoryId}
                        initialSubCategoryId={params.subCategoryId}
                        initialLearnId={params.edit}
                        categories={categories || []}
                    />
                </Suspense>
            </div>
        );
    }

    // Otherwise show category selector
    return (
        <div className="h-full bg-background overflow-auto">
            <LearnCategorySelector categories={categories || []} />
        </div>
    );
}

function CreateFormSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
    );
}