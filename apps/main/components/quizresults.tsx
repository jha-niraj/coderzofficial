"use client";

// This file re-exports the centralized QuizResults component for backward compatibility.
// New code should import directly from "@/components/main/quiz-results"

import QuizResults, { type QuizResultsProps } from "@/components/main/quiz-results";
import type { QuizQuestion, QuizResult, QuizAnswer } from "@/components/main/quiz";

// Re-export types
export type { QuizResultsProps, QuizQuestion, QuizResult, QuizAnswer };

// Re-export the component as default
export default QuizResults;