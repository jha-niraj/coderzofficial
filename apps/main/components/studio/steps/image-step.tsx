"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import type { StudioStep, ImageMetadata } from "@/types/studios";

interface ImageStepProps {
  step: StudioStep;
}

export function ImageStep({ step }: ImageStepProps) {
  const metadata = (step.metadata || {}) as Partial<ImageMetadata>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        {metadata.url ? (
          <img
            src={metadata.url}
            alt={metadata.prompt || "Generated image"}
            className="w-full h-auto"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Image not available
            </p>
          </div>
        )}
        {metadata.prompt && (
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {metadata.prompt}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
