"use client";

import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import type { StudioStep, FlashcardMetadata } from "@/types/studios";

interface FlashcardStepProps {
  step: StudioStep;
}

export function FlashcardStep({ step }: FlashcardStepProps) {
  const metadata = (step.metadata || {}) as Partial<FlashcardMetadata>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Flashcard Deck
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {metadata.topic} • {metadata.cardCount} cards
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-neutral-500">
          Flashcard component coming soon
        </div>
      </div>
    </motion.div>
  );
}
