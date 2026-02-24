"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudioViewer } from "./viewer/studio-viewer";
import { AIInputPanel } from "./ui/ai-input-panel";
import { Button } from "@repo/ui/components/ui/button";
import { ArrowLeft, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@repo/ui/components/ui/dropdown-menu";
import { deleteStudio } from "@/actions/(main)/studios/studio.actions";
import toast from "@repo/ui/components/ui/sonner";
import type { StudioWithSteps } from "@/types/studios";

interface StudioContainerProps {
  studio: StudioWithSteps;
  backUrl?: string;
  backLabel?: string;
}

export function StudioContainer({
  studio,
  backUrl = "/studio",
}: StudioContainerProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleContentAdded = () => {
    // Refresh the studio view
    setRefreshKey((prev) => prev + 1);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this studio? This action cannot be undone.")) {
      return;
    }

    const result = await deleteStudio(studio.id);
    if (result.success) {
      toast.success("Studio deleted");
      router.push(backUrl);
    } else {
      toast.error(result.error || "Failed to delete studio");
    }
  };

  const getSourceLabel = () => {
    switch (studio.source) {
      case "PATHFINDER":
        return "From Pathfinder Goal";
      case "SPACE":
        return "From Learning Space";
      default:
        return "Personal Studio";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(backUrl)}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div>
                <div className="flex items-center gap-3">
                  {studio.emoji && (
                    <span className="text-2xl">{studio.emoji}</span>
                  )}
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {studio.title}
                  </h1>
                </div>
                {studio.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {studio.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
                    {getSourceLabel()}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {studio.stepCount} {studio.stepCount === 1 ? "step" : "steps"}
                  </span>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info("Settings coming soon")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Studio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content viewer */}
      <div className="flex-1 overflow-hidden">
        <StudioViewer key={refreshKey} studio={studio} className="h-full" />
      </div>

      {/* AI Input Panel */}
      <div className="flex-shrink-0">
        <AIInputPanel studioId={studio.id} onContentAdded={handleContentAdded} />
      </div>
    </div>
  );
}
