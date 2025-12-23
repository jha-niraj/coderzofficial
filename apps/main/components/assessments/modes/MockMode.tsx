"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "../../lib/utils";
import {
    Mic,
    MicOff,
    Send,
    ChevronRight,
    ChevronLeft,
    Clock,
    Lightbulb,
    MessageSquare,
    User,
    Bot,
    Volume2,
    VolumeX,
    RotateCcw,
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

export interface MockQuestion {
    id: string;
    question: string;
    type: AssessmentQuestionType;
    difficulty: QuestionDifficulty;
    expectedTopics?: string[];
    followUpQuestions?: string[];
    hints?: string[];
    points?: number;
    category?: string; // e.g., "Behavioral", "Technical", "System Design"
}

export interface MockAnswer {
    questionId: string;
    textAnswer: string;
    audioUrl?: string;
    feedback?: string;
    score?: number;
    timeTaken: number;
}

export interface AIFeedback {
    score: number;
    strengths: string[];
    improvements: string[];
    suggestedAnswer?: string;
    followUpQuestion?: string;
}

export interface MockModeProps {
    questions: MockQuestion[];
    onSubmitAnswer: (questionId: string, answer: string, timeTaken: number) => Promise<{
        feedback: AIFeedback;
    }>;
    onComplete: (answers: MockAnswer[]) => void;
    onExit?: () => void;
    showTimer?: boolean;
    timeLimit?: number;
    allowHints?: boolean;
    showProgress?: boolean;
    enableVoice?: boolean;
    context?: "practice" | "exam";
}

// ==================== COMPONENT ====================

export function MockMode({
    questions,
    onSubmitAnswer,
    onComplete,
    onExit,
    showTimer = true,
    timeLimit,
    allowHints = true,
    showProgress = true,
    enableVoice = false,
    context = "practice",
}: MockModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState<MockAnswer[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<AIFeedback | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [totalTime, setTotalTime] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = answers.length;
    const avgScore = answers.length > 0
        ? Math.round(answers.reduce((acc, a) => acc + (a.score || 0), 0) / answers.length)
        : 0;

    // Timer effect
    useEffect(() => {
        if (!showTimer) return;

        const interval = setInterval(() => {
            setTotalTime((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [showTimer]);

    const handleComplete = useCallback(() => {
        const allAnswers = [...answers];
        questions.forEach((q) => {
            if (!allAnswers.find((a) => a.questionId === q.id)) {
                allAnswers.push({
                    questionId: q.id,
                    textAnswer: "",
                    score: 0,
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

    // Reset on question change
    useEffect(() => {
        setQuestionStartTime(Date.now());
        setAnswer("");
        setFeedback(null);
        setShowResult(false);
        setShowHint(false);
        textareaRef.current?.focus();
    }, [currentIndex]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

        try {
            const result = await onSubmitAnswer(currentQuestion.id, answer, timeTaken);

            const mockAnswer: MockAnswer = {
                questionId: currentQuestion.id,
                textAnswer: answer,
                feedback: result.feedback.suggestedAnswer,
                score: result.feedback.score,
                timeTaken,
            };

            setAnswers((prev) => [...prev, mockAnswer]);
            setFeedback(result.feedback);
            setShowResult(true);
        } catch (error) {
            console.error("Error submitting answer:", error);
        } finally {
            setIsSubmitting(false);
        }
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

    const handleReset = () => {
        setAnswer("");
        setFeedback(null);
        setShowResult(false);
    };

    const toggleHint = () => {
        if (currentQuestion.hints && currentQuestion.hints.length > 0) {
            setShowHint((prev) => !prev);
        }
    };

    const toggleRecording = () => {
        // Voice recording implementation would go here
        setIsRecording((prev) => !prev);
    };

    const speakQuestion = () => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const difficultyConfig = DIFFICULTY_CONFIG[currentQuestion.difficulty];

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={cn(difficultyConfig.bg, difficultyConfig.text)}>
                        {difficultyConfig.label}
                    </Badge>
                    {currentQuestion.category && (
                        <Badge variant="secondary">{currentQuestion.category}</Badge>
                    )}
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
                        <span>Avg Score: {avgScore}%</span>
                    </div>
                </div>
            )}

            {/* Interview Question Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <CardDescription className="mb-2">Interviewer</CardDescription>
                                <CardTitle className="text-lg font-medium leading-relaxed">
                                    {currentQuestion.question}
                                </CardTitle>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {enableVoice && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={isSpeaking ? stopSpeaking : speakQuestion}
                                            >
                                                {isSpeaking ? (
                                                    <VolumeX className="w-4 h-4" />
                                                ) : (
                                                    <Volume2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isSpeaking ? "Stop" : "Read aloud"}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}

                            {allowHints && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={toggleHint}
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
                    {/* Expected Topics */}
                    {currentQuestion.expectedTopics && currentQuestion.expectedTopics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {currentQuestion.expectedTopics.map((topic, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {topic}
                                </Badge>
                            ))}
                        </div>
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

                    {/* Answer Input */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">Your Answer</span>
                        </div>

                        <Textarea
                            ref={textareaRef}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here... Be detailed and structured in your response."
                            className="min-h-[200px] resize-none"
                            disabled={showResult || isSubmitting}
                        />

                        {enableVoice && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={isRecording ? "destructive" : "outline"}
                                    size="sm"
                                    onClick={toggleRecording}
                                    disabled={showResult}
                                >
                                    {isRecording ? (
                                        <>
                                            <MicOff className="w-4 h-4 mr-2" />
                                            Stop Recording
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="w-4 h-4 mr-2" />
                                            Record Answer
                                        </>
                                    )}
                                </Button>
                                {isRecording && (
                                    <span className="text-sm text-red-500 animate-pulse">
                                        Recording...
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Feedback */}
                    <AnimatePresence>
                        {showResult && feedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="space-y-4"
                            >
                                {/* Score */}
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">AI Evaluation</span>
                                        <span className={cn("text-2xl font-bold", getScoreColor(feedback.score))}>
                                            {feedback.score}/100
                                        </span>
                                    </div>
                                    <Progress value={feedback.score} className="h-2" />
                                </div>

                                {/* Strengths */}
                                {feedback.strengths.length > 0 && (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                                            ✓ Strengths
                                        </h4>
                                        <ul className="space-y-1">
                                            {feedback.strengths.map((s, idx) => (
                                                <li key={idx} className="text-sm text-green-700 dark:text-green-300">
                                                    • {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Improvements */}
                                {feedback.improvements.length > 0 && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                        <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                                            → Areas for Improvement
                                        </h4>
                                        <ul className="space-y-1">
                                            {feedback.improvements.map((i, idx) => (
                                                <li key={idx} className="text-sm text-orange-700 dark:text-orange-300">
                                                    • {i}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Suggested Answer */}
                                {feedback.suggestedAnswer && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                            📝 Sample Answer
                                        </h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                                            {feedback.suggestedAnswer}
                                        </p>
                                    </div>
                                )}

                                {/* Follow-up Question */}
                                {feedback.followUpQuestion && (
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                                            🤔 Follow-up Question
                                        </h4>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">
                                            {feedback.followUpQuestion}
                                        </p>
                                    </div>
                                )}
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
                    {showResult && (
                        <Button variant="ghost" onClick={handleReset}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    )}

                    {!showResult ? (
                        <Button
                            onClick={handleSubmitAnswer}
                            disabled={!answer.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                "Evaluating..."
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Answer
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button onClick={handleNext}>
                            {currentIndex < questions.length - 1 ? (
                                <>
                                    Next Question
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </>
                            ) : (
                                "Complete Interview"
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
                {questions.map((q, idx) => {
                    const qAnswer = answers.find((a) => a.questionId === q.id);
                    const isCurrent = idx === currentIndex;

                    return (
                        <button
                            key={q.id}
                            onClick={() => context === "practice" && setCurrentIndex(idx)}
                            disabled={context === "exam"}
                            className={cn(
                                "w-8 h-8 rounded-full text-xs font-medium transition-all",
                                !qAnswer && !isCurrent && "bg-muted hover:bg-muted/80",
                                isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                                qAnswer && qAnswer.score !== undefined && qAnswer.score >= 70 && "bg-green-500 text-white",
                                qAnswer && qAnswer.score !== undefined && qAnswer.score >= 40 && qAnswer.score < 70 && "bg-yellow-500 text-white",
                                qAnswer && qAnswer.score !== undefined && qAnswer.score < 40 && "bg-red-500 text-white",
                                context === "exam" && "cursor-default"
                            )}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
