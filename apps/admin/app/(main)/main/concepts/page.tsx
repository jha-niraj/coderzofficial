import { Suspense } from "react";
import { getPendingVerificationConcepts } from "@/actions/main/concept.action";
import ConceptsVerificationClient from "./_components/concepts-verification-client";

export default async function ConceptsAdminPage() {
    const result = await getPendingVerificationConcepts();
    
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Concept Verification
                </h1>
                <p className="text-muted-foreground mt-1">
                    Review and verify concepts submitted by creators
                </p>
            </div>
            
            <Suspense fallback={<div className="animate-pulse h-96 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />}>
                <ConceptsVerificationClient 
                    concepts={result.concepts || []}
                />
            </Suspense>
        </div>
    );
}
