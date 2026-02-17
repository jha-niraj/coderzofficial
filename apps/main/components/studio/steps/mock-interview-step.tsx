"use client";

import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import type { StudioStep, MockInterviewMetadata } from "@/types/studios";

interface MockInterviewStepProps {
  step: StudioStep;
}

export function MockInterviewStep({ step }: MockInterviewStepProps) {
  const metadata = (step.metadata || {}) as Partial<MockInterviewMetadata>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500 flex items-center justify-center">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Mock Interview
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {metadata.topic} • {metadata.durationMinutes} minutes
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-neutral-500">
          Mock interview component coming soon
        </div>
      </div>
    </motion.div>
  );
}
