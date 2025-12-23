import { Suspense } from "react";
import { Metadata } from "next";
import StudioList from "@/components/studio/studio-list";
import StudioListSkeleton from "@/components/studio/studio-list-skeleton";

export const metadata: Metadata = {
  title: "Studio | The Coderz",
  description: "Your personal AI-powered learning workspace",
};

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Studio
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Your personal AI-powered learning workspace. Create notes, generate quizzes, flashcards, and more.
          </p>
        </div>

        {/* Studio List */}
        <Suspense fallback={<StudioListSkeleton />}>
          <StudioList />
        </Suspense>
      </div>
    </div>
  );
}
