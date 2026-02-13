"use client";

import { createContext, useContext, useState } from "react";
import KnowmeChatSheet from "./knowme-chat-sheet";

type KnowmeSheetContextValue = (() => void) | null;

const KnowmeSheetContext = createContext<KnowmeSheetContextValue>(null);

export function KnowmeSheetProvider({ children }: { children: React.ReactNode }) {
    const [sheetOpen, setSheetOpen] = useState(false);

    const openKnowmeSheet = () => setSheetOpen(true);

    return (
        <KnowmeSheetContext.Provider value={openKnowmeSheet}>
            {children}
            <KnowmeChatSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </KnowmeSheetContext.Provider>
    );
}

export function useKnowmeSheet() {
    return useContext(KnowmeSheetContext);
}
