"use client";

// This file re-exports the centralized Quiz component for backward compatibility.
// New code should import directly from "@/components/main/quiz"

import Quiz, {
    type QuizOption,
    type QuizQuestion,
    type QuizProps,
    type QuizResult,
    type QuizAnswer,
    type QuizSubmitResult,
} from "@/components/main/quiz";

// Re-export types with original names for backward compatibility
export type { QuizOption, QuizQuestion, QuizProps, QuizResult, QuizAnswer, QuizSubmitResult };

// Re-export the component as default
export default Quiz;