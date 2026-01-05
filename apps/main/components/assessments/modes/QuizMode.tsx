"use client";

import Quiz, {
    type QuizQuestion as CentralQuizQuestion,
    type QuizResult,
} from "@/components/main/quiz";
import type { QuestionDifficulty, AssessmentQuestionType } from "@repo/prisma/client";

export interface QuizQuestion {
    id: string;
    question: string;
    type: AssessmentQuestionType;
    difficulty: QuestionDifficulty;
    options: string[];
    codeSnippet?: string | null;
    hints?: string[];
    points?: number;
}

export interface QuizAnswer {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeTaken: number;
}

export interface QuizModeProps {
    questions: QuizQuestion[];
    onSubmitAnswer: (questionId: string, answer: string, timeTaken: number) => Promise<{
        isCorrect: boolean;
        correctAnswer: string;
        explanation?: string | null;
    }>;
    onComplete: (answers: QuizAnswer[]) => void;
    onExit?: () => void;
    showTimer?: boolean;
    timeLimit?: number;
    allowSkip?: boolean;
    allowHints?: boolean;
    showProgress?: boolean;
    immediateResults?: boolean;
    context?: "practice" | "exam";
}

// ==================== COMPONENT ====================

export function QuizMode({
    questions,
    onSubmitAnswer,
    onComplete,
    onExit,
    showTimer = true,
    timeLimit,
    allowSkip = true,
    allowHints = true,
    showProgress = true,
    immediateResults = true,
    context = "practice",
}: QuizModeProps) {
    // Transform questions to the new format
    const transformedQuestions: CentralQuizQuestion[] = questions.map(q => ({
        id: q.id,
        text: q.question,
        type: "single", // Assessment questions are single choice
        options: q.options.map((opt, idx) => ({
            id: idx.toString(),
            text: opt,
        })),
        hint: q.hints?.[0],
        difficulty: q.difficulty,
        points: q.points,
        codeSnippet: q.codeSnippet || undefined,
    }));

    // Handle the answer submission and transform the response
    const handleAnswerSubmit = async (questionId: string, answer: string | string[], timeTaken: number) => {
        const answerStr = Array.isArray(answer) ? answer[0] || "" : answer;
        const result = await onSubmitAnswer(questionId, answerStr, timeTaken);
        return {
            isCorrect: result.isCorrect,
            correctAnswer: result.correctAnswer,
            explanation: result.explanation || undefined,
        };
    };

    // Handle completion and transform results to the expected format
    const handleComplete = (result: QuizResult) => {
        const answers: QuizAnswer[] = result.answers.map(a => ({
            questionId: a.questionId,
            selectedOption: Array.isArray(a.selectedAnswer) ? a.selectedAnswer[0] || "" : a.selectedAnswer,
            isCorrect: a.isCorrect || false,
            timeTaken: a.timeTaken,
        }));
        onComplete(answers);
    };

    return (
        <Quiz
            quizId="assessment-quiz"
            questions={transformedQuestions}
            title="Assessment"
            timeLimit={timeLimit}
            showTimer={showTimer}
            mode={context}
            immediateResults={immediateResults}
            allowSkip={allowSkip}
            allowHints={allowHints}
            allowFlag={true}
            allowPrevious={context === "practice"}
            allowQuestionNavigation={context === "practice"}
            autoSubmitOnTimeUp={true}
            onAnswerSubmit={handleAnswerSubmit}
            onComplete={handleComplete}
            onExit={onExit}
            showProgress={showProgress}
            showQuestionNavigator={true}
        />
    );
}