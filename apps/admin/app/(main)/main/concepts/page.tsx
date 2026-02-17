import { Suspense } from "react";
import { getPendingVerificationLearns } from "@/actions/main/Learn.action";
import LearnsVerificationClient from "./_components/Learns-verification-client";

export default async function LearnsAdminPage() {
    const result = await getPendingVerificationLearns();

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Learn Verification
                </h1>
                <p className="text-muted-foreground mt-1">
                    Review and verify Learns submitted by creators
                </p>
            </div>

            <Suspense fallback={<div className="animate-pulse h-96 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />}>
                <LearnsVerificationClient
                    Learns={result.Learns || []}
                />
            </Suspense>
        </div>
    );
}
