import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import ConceptBlockEditor from "./_components/concept-block-editor";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const metadata: Metadata = {
    title: "Create Concept | TheCoderz",
    description: "Create a new concept for the Concepts Hub",
};

export const dynamic = "force-dynamic";

export default async function CreateConceptPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }


    return (
        <div className="h-full bg-background">
            <Suspense fallback={<CreateFormSkeleton />}>
                <ConceptBlockEditor />
            </Suspense>
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