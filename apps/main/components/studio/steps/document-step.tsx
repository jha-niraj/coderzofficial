"use client";

import { motion } from "framer-motion";
import { FileText, ExternalLink, Globe, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import type { StudioStep, DocumentMetadata } from "@/types/studios";

interface DocumentStepProps {
  step: StudioStep;
}

export function DocumentStep({ step }: DocumentStepProps) {
  const metadata = (step.metadata || {}) as Partial<DocumentMetadata>;

  const getDocTypeIcon = () => {
    switch (metadata.docType) {
      case "documentation":
        return <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case "tutorial":
        return <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      case "article":
      default:
        return <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getDocTypeLabel = () => {
    switch (metadata.docType) {
      case "documentation":
        return "Official Documentation";
      case "tutorial":
        return "Tutorial";
      case "article":
        return "Article";
      default:
        return "Document";
    }
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
              {getDocTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {metadata.title || "Document"}
              </h3>
              {metadata.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                  {metadata.description}
                </p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                  {getDocTypeLabel()}
                </span>
                {metadata.url && (
                  <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                    <Globe className="h-3 w-3" />
                    {getDomain(metadata.url)}
                  </span>
                )}
                {metadata.source && (
                  <span className="text-xs text-neutral-400 capitalize">
                    Added by {metadata.source === "xai" ? "AI" : "you"}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => metadata.url && window.open(metadata.url, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
