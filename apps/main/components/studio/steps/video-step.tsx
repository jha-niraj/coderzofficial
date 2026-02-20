"use client";

import { motion } from "framer-motion";
import { Video, ExternalLink, Clock } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import type { StudioStep, VideoMetadata } from "@/types/studios";

interface VideoStepProps {
  step: StudioStep;
}

export function VideoStep({ step }: VideoStepProps) {
  const metadata = (step.metadata || {}) as Partial<VideoMetadata>;

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("/").pop()?.split("?")[0]
        : new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const vimeoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    return url;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        {metadata.url ? (
          <div className="aspect-video bg-black">
            <iframe
              src={getEmbedUrl(metadata.url)}
              title={metadata.title || "Video"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center aspect-video bg-neutral-100 dark:bg-neutral-800">
            <Video className="h-12 w-12 text-neutral-400 mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Video not available
            </p>
          </div>
        )}
        {(metadata.title || metadata.duration) && (
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                {metadata.title && (
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                    {metadata.title}
                  </h4>
                )}
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {metadata.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(metadata.duration)}
                    </span>
                  )}
                  {metadata.source && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-neutral-200 dark:bg-neutral-700 capitalize">
                      {metadata.source}
                    </span>
                  )}
                </div>
              </div>
              {metadata.url && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs"
                  onClick={() => window.open(metadata.url, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
