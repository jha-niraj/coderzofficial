import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
// import { prisma } from "@repo/prisma";
import ConceptCreateForm from "./_components/concept-create-form";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

export const metadata: Metadata = {
    title: "Create Concept | Admin | TheCoderz",
    description: "Create a new concept for the Concepts Hub",
};

export default async function CreateConceptPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Check if user is admin
    // const user = await prisma.user.findUnique({
    //     where: { id: session.user.id },
    //     select: { role: true },
    // });

    // if (user?.role !== "Admin") {
    //     redirect("/concepts");
    // }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Suspense fallback={<CreateFormSkeleton />}>
                    <ConceptCreateForm />
                </Suspense>
            </div>
        </div>
    );
}

function CreateFormSkeleton() {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
    );
}