"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import { cn } from "@repo/ui/lib/utils";
import {
    Clock, HelpCircle, Code2, MessageSquare, Shuffle
} from "lucide-react";
import { DIFFICULTY_CONFIG } from "@/types/assessment";
import type {
    QuestionDifficulty, AssessmentQuestionType
} from "@repo/prisma/client";

// Import individual mode components
import { QuizMode, type QuizQuestion, type QuizAnswer } from "./QuizMode";
import { CodeMode, type CodeQuestion, type CodeAnswer } from "./CodeMode";
import { MockMode, type MockQuestion, type MockAnswer, type AIFeedback } from "./MockMode";

// ==================== TYPES ====================

export interface MixedQuestion {
    id: string;
    question: string;
    type: AssessmentQuestionType;
    difficulty: QuestionDifficulty;
    mode: "QUIZ" | "CODE" | "MOCK";
    // Quiz fields
    options?: string[];
    // Code fields
    starterCode?: string | null;
    solutionCode?: string | null;
    testCases?: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
    language?: string;
    // Mock fields
    expectedTopics?: string[];
    category?: string;
    // Common
    codeSnippet?: string | null;
    hints?: string[];
    points?: number;
}

export type MixedAnswer = (QuizAnswer | CodeAnswer | MockAnswer) & {
    mode: "QUIZ" | "CODE" | "MOCK";
};

export interface MixedModeProps {
    questions: MixedQuestion[];
    onSubmitQuizAnswer: (questionId: string, answer: string, timeTaken: number) => Promise<{
        isCorrect: boolean;
        correctAnswer: string;
        explanation?: string | null;
    }>;
    onSubmitCodeAnswer: (questionId: string, code: string, timeTaken: number) => Promise<{
        isCorrect: boolean;
        testResults: Array<{
            input: string;
            expectedOutput: string;
            actualOutput: string;
            passed: boolean;
            error?: string;
        }>;
        explanation?: string | null;
    }>;
    onSubmitMockAnswer: (questionId: string, answer: string, timeTaken: number) => Promise<{
        feedback: AIFeedback;
    }>;
    onRunCode?: (code: string, language: string) => Promise<{
        output: string;
        error?: string;
        executionTime?: number;
    }>;
    onComplete: (answers: MixedAnswer[]) => void;
    onExit?: () => void;
    showTimer?: boolean;
    timeLimit?: number;
    allowHints?: boolean;
    showProgress?: boolean;
    context?: "practice" | "exam";
}

// ==================== HELPER FUNCTION ====================

function getModeIcon(mode: "QUIZ" | "CODE" | "MOCK") {
    switch (mode) {
        case "QUIZ":
            return <HelpCircle className="w-4 h-4" />;
        case "CODE":
            return <Code2 className="w-4 h-4" />;
        case "MOCK":
            return <MessageSquare className="w-4 h-4" />;
    }
}

function getModeLabel(mode: "QUIZ" | "CODE" | "MOCK") {
    switch (mode) {
        case "QUIZ":
            return "Quiz";
        case "CODE":
            return "Coding";
        case "MOCK":
            return "Mock Interview";
    }
}

// ==================== COMPONENT ====================

export function MixedMode({
    questions,
    onSubmitQuizAnswer,
    onSubmitCodeAnswer,
    onSubmitMockAnswer,
    onRunCode,
    onComplete,
    onExit,
    showTimer = true,
    timeLimit,
    allowHints = true,
    showProgress = true,
    context = "practice",
}: MixedModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<MixedAnswer[]>([]);
    const [totalTime, setTotalTime] = useState(0);
    const [, setQuestionStartTime] = useState(Date.now());

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    // Group questions by mode for stats
    const questionStats = useMemo(() => {
        const stats = {
            quiz: { total: 0, answered: 0, correct: 0 },
            code: { total: 0, answered: 0, correct: 0 },
            mock: { total: 0, answered: 0, avgScore: 0 },
        };

        questions.forEach((q) => {
            if (q.mode === "QUIZ") stats.quiz.total++;
            else if (q.mode === "CODE") stats.code.total++;
            else if (q.mode === "MOCK") stats.mock.total++;
        });

        let mockTotalScore = 0;
        answers.forEach((a) => {
            if (a.mode === "QUIZ") {
                stats.quiz.answered++;
                if ((a as QuizAnswer).isCorrect) stats.quiz.correct++;
            } else if (a.mode === "CODE") {
                stats.code.answered++;
                if ((a as CodeAnswer).isCorrect) stats.code.correct++;
            } else if (a.mode === "MOCK") {
                stats.mock.answered++;
                mockTotalScore += (a as MockAnswer).score || 0;
            }
        });

        if (stats.mock.answered > 0) {
            stats.mock.avgScore = Math.round(mockTotalScore / stats.mock.answered);
        }

        return stats;
    }, [questions, answers]);

    // Timer effect
    useEffect(() => {
        if (!showTimer) return;

        const interval = setInterval(() => {
            setTotalTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [showTimer]);

    const handleComplete = useCallback(() => {
        onComplete(answers);
    }, [answers, onComplete]);

    // Check time limit
    useEffect(() => {
        if (timeLimit && totalTime >= timeLimit) {
            handleComplete();
        }
    }, [totalTime, timeLimit, handleComplete]);

    // Reset on question change
    useEffect(() => {
        setQuestionStartTime(Date.now());
    }, [currentIndex]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle quiz answer
    const handleQuizComplete = (quizAnswers: QuizAnswer[]) => {
        const mixedAnswers: MixedAnswer[] = quizAnswers.map((a) => ({
            ...a,
            mode: "QUIZ" as const,
        }));
        setAnswers((prev) => [...prev, ...mixedAnswers]);
        moveToNext();
    };

    // Handle code answer
    const handleCodeComplete = (codeAnswers: CodeAnswer[]) => {
        const mixedAnswers: MixedAnswer[] = codeAnswers.map((a) => ({
            ...a,
            mode: "CODE" as const,
        }));
        setAnswers((prev) => [...prev, ...mixedAnswers]);
        moveToNext();
    };

    // Handle mock answer
    const handleMockComplete = (mockAnswers: MockAnswer[]) => {
        const mixedAnswers: MixedAnswer[] = mockAnswers.map((a) => ({
            ...a,
            mode: "MOCK" as const,
        }));
        setAnswers((prev) => [...prev, ...mixedAnswers]);
        moveToNext();
    };

    const moveToNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            handleComplete();
        }
    };

    const _handlePrevious = () => {
        if (currentIndex > 0 && context === "practice") {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const difficultyConfig = DIFFICULTY_CONFIG[currentQuestion?.difficulty || "EASY"];

    // Convert current question to the appropriate mode format
    const renderQuestionMode = () => {
        switch (currentQuestion?.mode) {
            case "QUIZ": {
                const quizQuestion: QuizQuestion = {
                    id: currentQuestion?.id || "",
                    question: currentQuestion.question,
                    type: currentQuestion.type,
                    difficulty: currentQuestion?.difficulty || "EASY",
                    options: currentQuestion?.options || [],
                    codeSnippet: currentQuestion?.codeSnippet,
                    hints: currentQuestion.hints,
                    points: currentQuestion.points,
                };
                return (
                    <QuizMode
                        questions={[quizQuestion]}
                        onSubmitAnswer={onSubmitQuizAnswer}
                        onComplete={handleQuizComplete}
                        showTimer={false}
                        allowHints={allowHints}
                        showProgress={false}
                        immediateResults={true}
                        context={context}
                    />
                );
            }
            case "CODE": {
                const codeQuestion: CodeQuestion = {
                    id: currentQuestion.id,
                    question: currentQuestion.question,
                    type: currentQuestion.type,
                    difficulty: currentQuestion.difficulty,
                    starterCode: currentQuestion.starterCode,
                    solutionCode: currentQuestion.solutionCode,
                    testCases: currentQuestion.testCases || [],
                    hints: currentQuestion.hints,
                    points: currentQuestion.points,
                    language: currentQuestion.language || "javascript",
                };
                return (
                    <CodeMode
                        questions={[codeQuestion]}
                        onSubmitCode={onSubmitCodeAnswer}
                        onRunCode={onRunCode}
                        onComplete={handleCodeComplete}
                        showTimer={false}
                        allowHints={allowHints}
                        showProgress={false}
                        context={context}
                    />
                );
            }
            case "MOCK": {
                const mockQuestion: MockQuestion = {
                    id: currentQuestion.id,
                    question: currentQuestion.question,
                    type: currentQuestion.type,
                    difficulty: currentQuestion.difficulty,
                    expectedTopics: currentQuestion.expectedTopics,
                    hints: currentQuestion.hints,
                    points: currentQuestion.points,
                    category: currentQuestion.category,
                };
                return (
                    <MockMode
                        questions={[mockQuestion]}
                        onSubmitAnswer={onSubmitMockAnswer}
                        onComplete={handleMockComplete}
                        showTimer={false}
                        allowHints={allowHints}
                        showProgress={false}
                        context={context}
                    />
                );
            }
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="gap-1">
                        <Shuffle className="w-3 h-3" />
                        Mixed Mode
                    </Badge>
                    <Badge variant="outline" className={cn(difficultyConfig.bg, difficultyConfig.text)}>
                        {difficultyConfig.label}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                        {getModeIcon(currentQuestion?.mode || "QUIZ")}
                        {getModeLabel(currentQuestion?.mode || "QUIZ")}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {
                        showTimer && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                <span className={cn(
                                    timeLimit && totalTime > timeLimit * 0.8 && "text-red-500 font-medium"
                                )}>
                                    {formatTime(timeLimit ? timeLimit - totalTime : totalTime)}
                                </span>
                            </div>
                        )
                    }
                    {
                        onExit && (
                            <Button variant="ghost" size="sm" onClick={onExit}>
                                Exit
                            </Button>
                        )
                    }
                </div>
            </div>
            {
                showProgress && (
                    <div className="space-y-3">
                        <Progress value={progress} className="h-2" />
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                                <HelpCircle className="w-4 h-4 text-blue-500" />
                                <span className="text-muted-foreground">Quiz:</span>
                                <span className="font-medium">
                                    {questionStats.quiz.correct}/{questionStats.quiz.total}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                                <Code2 className="w-4 h-4 text-green-500" />
                                <span className="text-muted-foreground">Code:</span>
                                <span className="font-medium">
                                    {questionStats.code.correct}/{questionStats.code.total}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                                <MessageSquare className="w-4 h-4 text-purple-500" />
                                <span className="text-muted-foreground">Mock:</span>
                                <span className="font-medium">
                                    {questionStats.mock.avgScore}% avg
                                </span>
                            </div>
                        </div>
                    </div>
                )
            }
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion?.id || ""}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderQuestionMode()}
                </motion.div>
            </AnimatePresence>
            <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
                {
                    questions.map((q, idx) => {
                        const answer = answers.find((a) => a.questionId === q.id);
                        const isCurrent = idx === currentIndex;

                        let isCorrect = false;
                        if (answer) {
                            if (answer.mode === "QUIZ") {
                                isCorrect = (answer as QuizAnswer).isCorrect;
                            } else if (answer.mode === "CODE") {
                                isCorrect = (answer as CodeAnswer).isCorrect;
                            } else if (answer.mode === "MOCK") {
                                isCorrect = ((answer as MockAnswer).score || 0) >= 70;
                            }
                        }

                        return (
                            <button
                                key={q.id}
                                onClick={() => context === "practice" && setCurrentIndex(idx)}
                                disabled={context === "exam"}
                                className={cn(
                                    "w-10 h-10 rounded-full text-xs font-medium transition-all relative flex items-center justify-center",
                                    !answer && !isCurrent && "bg-muted hover:bg-muted/80",
                                    isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                                    answer && isCorrect && "bg-green-500 text-white",
                                    answer && !isCorrect && "bg-red-500 text-white",
                                    context === "exam" && "cursor-default"
                                )}
                            >
                                <span className="absolute -top-1 -right-1">
                                    {getModeIcon(q.mode)}
                                </span>
                                {idx + 1}
                            </button>
                        );
                    })
                }
            </div>
        </div>
    );
}