"use client";

import { CheckCircle2 } from "lucide-react";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";

interface Learn {
    id: string;
    // ... minimal types if needed, but not used really
}

interface LearnsVerificationClientProps {
    Learns: Learn[]; // or any[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LearnsVerificationClient(_props: LearnsVerificationClientProps) {
    // Verification system has been removed
    return (
        <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">System Update</h3>
                <p className="text-muted-foreground text-center">
                    Learn verification is no longer required. All Learns are published directly.
                </p>
            </CardContent>
        </Card>
    );
}