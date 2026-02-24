"use client";

import { FlashcardStep } from "../steps/flashcard-step";
import { StudioStep, StudioStepType, ContentSource, StudioStepStatus } from "@/types/studios";

interface FlashcardDeck {
    id: string;
    title: string;
    cards: Array<{
        front: string;
        back: string;
        hint?: string;
    }>;
}

interface StudioFlashcardBlockProps {
    deck: FlashcardDeck;
    skipSave?: boolean;
}

export default function StudioFlashcardBlock({ deck }: StudioFlashcardBlockProps) {
    // Convert deck to StudioStep format
    const step: StudioStep = {
        id: deck.id,
        studioId: "temp-id",
        orderNumber: 0,
        type: "FLASHCARD" as StudioStepType, // Use the string literal directly or import enum
        content: JSON.stringify(deck.cards),
        metadata: {
            topic: deck.title,
            cardCount: deck.cards.length
        },
        source: "AI" as ContentSource,
        status: "COMPLETED" as StudioStepStatus,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    return <FlashcardStep step={step} />;
}
