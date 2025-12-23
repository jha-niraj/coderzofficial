"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "../../lib/utils";
import {
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronLeft,
    Clock,
    Lightbulb,
    Flag,
    SkipForward,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DIFFICULTY_CONFIG } from "@/types/assessment";
import type { QuestionDifficulty, AssessmentQuestionType } from "@prisma/client";

// ==================== TYPES ====================

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
    timeLimit?: number; // in seconds, for the entire quiz
    allowSkip?: boolean;
    allowHints?: boolean;
    showProgress?: boolean;
    immediateResults?: boolean; // Show if answer is correct immediately
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState<{
        isCorrect: boolean;
        correctAnswer: string;
        explanation?: string | null;
    } | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [totalTime, setTotalTime] = useState(0);
    const [usedHints, setUsedHints] = useState<Set<string>>(new Set());
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
    const [showHint, setShowHint] = useState(false);

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;

    // Timer effect
    useEffect(() => {
        if (!showTimer) return;

        const interval = setInterval(() => {
            setTotalTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [showTimer]);

    const handleComplete = useCallback(() => {
        // Add any unanswered questions as skipped
        const allAnswers = [...answers];
        questions.forEach((q) => {
            if (!allAnswers.find((a) => a.questionId === q.id)) {
                allAnswers.push({
                    questionId: q.id,
                    selectedOption: "",
                    isCorrect: false,
                    timeTaken: 0,
                });
            }
        });
        onComplete(allAnswers);
    }, [answers, questions, onComplete]);

    // Check time limit
    useEffect(() => {
        if (timeLimit && totalTime >= timeLimit) {
            handleComplete();
        }
    }, [totalTime, timeLimit, handleComplete]);

    // Reset question timer when question changes
    useEffect(() => {
        setQuestionStartTime(Date.now());
        setSelectedOption(null);
        setShowResult(false);
        setLastResult(null);
        setShowHint(false);
    }, [currentIndex]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleOptionSelect = (option: string) => {
        if (showResult || isSubmitting) return;
        setSelectedOption(option);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedOption || isSubmitting) return;

        setIsSubmitting(true);
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

        try {
            const result = await onSubmitAnswer(currentQuestion.id, selectedOption, timeTaken);

            const answer: QuizAnswer = {
                questionId: currentQuestion.id,
                selectedOption,
                isCorrect: result.isCorrect,
                timeTaken,
            };

            setAnswers((prev) => [...prev, answer]);
            setLastResult(result);

            if (immediateResults) {
                setShowResult(true);
            } else {
                // Move to next question immediately in exam mode
                handleNext();
            }
        } catch (error) {
            console.error("Error submitting answer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        const answer: QuizAnswer = {
            questionId: currentQuestion.id,
            selectedOption: "",
            isCorrect: false,
            timeTaken: Math.floor((Date.now() - questionStartTime) / 1000),
        };
        setAnswers((prev) => [...prev, answer]);
        handleNext();
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0 && context === "practice") {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const toggleFlag = () => {
        setFlaggedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(currentQuestion.id)) {
                next.delete(currentQuestion.id);
            } else {
                next.add(currentQuestion.id);
            }
            return next;
        });
    };

    const toggleHint = () => {
        if (currentQuestion.hints && currentQuestion.hints.length > 0) {
            setShowHint((prev) => !prev);
            setUsedHints((prev) => new Set(prev).add(currentQuestion.id));
        }
    };

    const difficultyConfig = DIFFICULTY_CONFIG[currentQuestion.difficulty];

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={cn(difficultyConfig.bg, difficultyConfig.text)}>
                        {difficultyConfig.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {showTimer && (
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            <span className={cn(
                                timeLimit && totalTime > timeLimit * 0.8 && "text-red-500 font-medium"
                            )}>
                                {formatTime(timeLimit ? timeLimit - totalTime : totalTime)}
                            </span>
                        </div>
                    )}

                    {onExit && (
                        <Button variant="ghost" size="sm" onClick={onExit}>
                            Exit
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress */}
            {showProgress && (
                <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{answeredCount} answered</span>
                        <span>{correctCount} correct</span>
                    </div>
                </div>
            )}

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-lg font-medium leading-relaxed">
                                {currentQuestion.question}
                            </CardTitle>
                            {currentQuestion.points && (
                                <CardDescription className="mt-1">
                                    {currentQuestion.points} points
                                </CardDescription>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={toggleFlag}
                                            className={cn(
                                                flaggedQuestions.has(currentQuestion.id) && "text-yellow-500"
                                            )}
                                        >
                                            <Flag className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Flag for review</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {allowHints && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={toggleHint}
                                                className={cn(
                                                    usedHints.has(currentQuestion.id) && "text-amber-500"
                                                )}
                                            >
                                                <Lightbulb className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Show hint</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Code Snippet */}
                    {currentQuestion.codeSnippet && (
                        <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg overflow-x-auto text-sm font-mono">
                            <code>{currentQuestion.codeSnippet}</code>
                        </pre>
                    )}

                    {/* Hint */}
                    <AnimatePresence>
                        {showHint && currentQuestion.hints && currentQuestion.hints[0] && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                            >
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Hint:</strong> {currentQuestion.hints[0]}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const letter = String.fromCharCode(65 + index);
                            const isSelected = selectedOption === option;
                            const isCorrect = showResult && lastResult?.correctAnswer === option;
                            const isWrong = showResult && isSelected && !lastResult?.isCorrect;

                            return (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: showResult ? 1 : 1.01 }}
                                    whileTap={{ scale: showResult ? 1 : 0.99 }}
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={showResult || isSubmitting}
                                    className={cn(
                                        "w-full p-4 text-left rounded-lg border-2 transition-all",
                                        "flex items-center gap-3",
                                        !showResult && !isSelected && "border-border hover:border-primary/50 hover:bg-accent",
                                        !showResult && isSelected && "border-primary bg-primary/10",
                                        isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20",
                                        isWrong && "border-red-500 bg-red-50 dark:bg-red-900/20",
                                        (showResult || isSubmitting) && "cursor-not-allowed"
                                    )}
                                >
                                    <span className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                                        !showResult && !isSelected && "bg-muted",
                                        !showResult && isSelected && "bg-primary text-primary-foreground",
                                        isCorrect && "bg-green-500 text-white",
                                        isWrong && "bg-red-500 text-white"
                                    )}>
                                        {showResult ? (
                                            isCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                                            isWrong ? <XCircle className="w-5 h-5" /> : letter
                                        ) : letter}
                                    </span>
                                    <span className="flex-1">{option}</span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    <AnimatePresence>
                        {showResult && lastResult?.explanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={cn(
                                    "p-4 rounded-lg border",
                                    lastResult.isCorrect
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                )}
                            >
                                <p className="text-sm font-medium mb-1">
                                    {lastResult.isCorrect ? "🎉 Correct!" : "📚 Explanation"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {lastResult.explanation}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || context === "exam"}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    {allowSkip && !showResult && (
                        <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
                            <SkipForward className="w-4 h-4 mr-2" />
                            Skip
                        </Button>
                    )}

                    {!showResult ? (
                        <Button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedOption || isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Answer"}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            {currentIndex < questions.length - 1 ? (
                                <>
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            ) : (
                                "Complete"
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Question Navigation Pills */}
            <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
                {questions.map((q, idx) => {
                    const answer = answers.find((a) => a.questionId === q.id);
                    const isCurrent = idx === currentIndex;
                    const isFlagged = flaggedQuestions.has(q.id);

                    return (
                        <button
                            key={q.id}
                            onClick={() => context === "practice" && setCurrentIndex(idx)}
                            disabled={context === "exam"}
                            className={cn(
                                "w-8 h-8 rounded-full text-xs font-medium transition-all relative",
                                !answer && !isCurrent && "bg-muted hover:bg-muted/80",
                                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                                answer?.isCorrect && "bg-green-500 text-white",
                                answer && !answer.isCorrect && answer.selectedOption && "bg-red-500 text-white",
                                answer && !answer.selectedOption && "bg-gray-400 text-white",
                                context === "exam" && "cursor-default"
                            )}
                        >
                            {idx + 1}
                            {isFlagged && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
