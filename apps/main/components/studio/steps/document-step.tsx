"use client";

import { motion } from "framer-motion";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import type { StudioStep, DocumentMetadata } from "@/types/studios";

interface DocumentStepProps {
  step: StudioStep;
}

export function DocumentStep({ step }: DocumentStepProps) {
  const metadata = (step.metadata || {}) as Partial<DocumentMetadata>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                {metadata.title || "Document"}
              </h3>
              {metadata.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {metadata.description}
                </p>
              )}
              {metadata.docType && (
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 mb-4">
                  {metadata.docType}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.open(metadata.url, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Open Document
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
