"use client";

import { useState } from "react";
import { Suspense } from "react";
import FeatureDiscovery from "./feature-discovery";
import KnowmeChatSheet from "./knowme-chat-sheet";
import {
    FeatureDiscoverySkeleton,
} from "./skeletons";

interface HomeClientWrapperProps {
    children: React.ReactNode;
}

export default function HomeClientWrapper({ children }: HomeClientWrapperProps) {
    const [knowmeSheetOpen, setKnowmeSheetOpen] = useState(false);

    return (
        <>
            {children}
            <KnowmeChatSheet
                open={knowmeSheetOpen}
                onOpenChange={setKnowmeSheetOpen}
            />
        </>
    );
}

export function FeatureDiscoveryWithKnowme({
    onKnowmeClick,
}: {
    onKnowmeClick: () => void;
}) {
    return (
        <Suspense fallback={<FeatureDiscoverySkeleton />}>
            <FeatureDiscovery onKnowmeClick={onKnowmeClick} />
        </Suspense>
    );
}
