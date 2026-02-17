"use client";

import { motion } from "framer-motion";
import { Video } from "lucide-react";
import type { StudioStep, VideoMetadata } from "@/types/studios";

interface VideoStepProps {
  step: StudioStep;
}

export function VideoStep({ step }: VideoStepProps) {
  const metadata = (step.metadata || {}) as Partial<VideoMetadata>;

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()
        : new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        {metadata.url ? (
          <div className="aspect-video">
            <iframe
              src={getEmbedUrl(metadata.url)}
              title={metadata.title || "Video"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center aspect-video">
            <Video className="h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Video not available
            </p>
          </div>
        )}
        {metadata.title && (
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {metadata.title}
            </h4>
            {metadata.duration && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Duration: {Math.floor(metadata.duration / 60)}:{String(metadata.duration % 60).padStart(2, "0")}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
