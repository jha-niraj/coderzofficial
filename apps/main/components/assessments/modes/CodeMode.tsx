"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui/components/ui/button";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";
import { cn } from "@repo/ui/lib/utils";
import {
    Play, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Clock, Lightbulb,
    RefreshCw, Terminal, Code2, FileCode
} from "lucide-react";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@repo/ui/components/ui/tooltip";
import { DIFFICULTY_CONFIG } from "@/types/assessment";
import type { QuestionDifficulty, AssessmentQuestionType } from "@repo/prisma/client";
import dynamic from "next/dynamic";

// Dynamic import for CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] bg-zinc-900 rounded-lg flex items-center justify-center">
            <div className="text-zinc-400">Loading editor...</div>
        </div>
    ),
});

// ==================== TYPES ====================

export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

export interface TestResult {
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
    executionTime?: number;
    error?: string;
}

export interface CodeQuestion {
    id: string;
    question: string;
    type: AssessmentQuestionType;
    difficulty: QuestionDifficulty;
    starterCode?: string | null;
    solutionCode?: string | null;
    testCases: TestCase[];
    hints?: string[];
    points?: number;
    language: string;
}

export interface CodeAnswer {
    questionId: string;
    code: string;
    isCorrect: boolean;
    testsPassed: number;
    totalTests: number;
    timeTaken: number;
}

export interface CodeModeProps {
    questions: CodeQuestion[];
    onSubmitCode: (questionId: string, code: string, timeTaken: number) => Promise<{
        isCorrect: boolean;
        testResults: TestResult[];
        explanation?: string | null;
    }>;
    onRunCode?: (code: string, language: string) => Promise<{
        output: string;
        error?: string;
        executionTime?: number;
    }>;
    onComplete: (answers: CodeAnswer[]) => void;
    onExit?: () => void;
    showTimer?: boolean;
    timeLimit?: number;
    allowHints?: boolean;
    showProgress?: boolean;
    context?: "practice" | "exam";
}

// ==================== COMPONENT ====================

export function CodeMode({
    questions,
    onSubmitCode,
    onRunCode,
    onComplete,
    onExit,
    showTimer = true,
    timeLimit,
    allowHints = true,
    showProgress = true,
    context = "practice",
}: CodeModeProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [code, setCode] = useState("");
    const [answers, setAnswers] = useState<CodeAnswer[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [totalTime, setTotalTime] = useState(0);
    const [usedHints, setUsedHints] = useState<Set<string>>(new Set());
    const [showHint, setShowHint] = useState(false);
    const [activeTab, setActiveTab] = useState<"code" | "output" | "tests">("code");

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const answeredCount = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;

    // Initialize code with starter code
    useEffect(() => {
        setCode(currentQuestion?.starterCode || "");
        setOutput(null);
        setTestResults([]);
        setShowResult(false);
        setShowHint(false);
        setQuestionStartTime(Date.now());
        setActiveTab("code");
    }, [currentIndex, currentQuestion?.starterCode]);

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
                    code: "",
                    isCorrect: false,
                    testsPassed: 0,
                    totalTests: q.testCases.length,
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleRunCode = async () => {
        if (!onRunCode || isRunning) return;

        setIsRunning(true);
        setOutput(null);

        try {
            const result = await onRunCode(code, currentQuestion?.language || "JavaScript");
            setOutput(result.error || result.output);
            setActiveTab("output");
        } catch (error) {
            console.log("Error occurred while running code: " + error);
            setOutput("Error running code. Please try again.");
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitCode = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

        try {
            const result = await onSubmitCode(currentQuestion?.id || "", code, timeTaken);

            const testsPassed = result.testResults.filter((t) => t.passed).length;
            const totalTests = result.testResults.length;

            const answer: CodeAnswer = {
                questionId: currentQuestion?.id || "",
                code,
                isCorrect: result.isCorrect,
                testsPassed,
                totalTests,
                timeTaken,
            };

            setAnswers((prev) => [...prev, answer]);
            setTestResults(result.testResults);
            setShowResult(true);
            setActiveTab("tests");
        } catch (error) {
            console.error("Error submitting code:", error);
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
        setCode(currentQuestion?.starterCode || "");
        setOutput(null);
        setTestResults([]);
    };

    const toggleHint = () => {
        if (currentQuestion?.hints && currentQuestion?.hints.length > 0) {
            setShowHint((prev) => !prev);
            setUsedHints((prev) => new Set(prev).add(currentQuestion?.id || ""));
        }
    };

    const difficultyConfig = DIFFICULTY_CONFIG[currentQuestion?.difficulty || "EASY"];
    const visibleTestCases = currentQuestion?.testCases.filter((tc) => !tc.isHidden) || [];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className={cn(difficultyConfig.bg, difficultyConfig.text)}>
                        {difficultyConfig.label}
                    </Badge>
                    <Badge variant="outline">
                        <Code2 className="w-3 h-3 mr-1" />
                        {currentQuestion?.language || "JavaScript"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Problem {currentIndex + 1} of {questions.length}
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
                    <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{answeredCount} completed</span>
                            <span>{correctCount} passed</span>
                        </div>
                    </div>
                )
            }
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="lg:row-span-2">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-lg font-medium">
                                    {currentQuestion?.question || ""}
                                </CardTitle>
                                {
                                    currentQuestion?.points && (
                                        <CardDescription className="mt-1">
                                            {currentQuestion?.points} points
                                        </CardDescription>
                                    )
                                }
                            </div>
                            {
                                allowHints && currentQuestion?.hints && currentQuestion?.hints.length > 0 && (
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
                                )
                            }
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AnimatePresence>
                            {
                                showHint && currentQuestion?.hints && currentQuestion?.hints[0] && (
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
                                )
                            }
                        </AnimatePresence>
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">Example Test Cases</h4>
                            {
                                visibleTestCases.slice(0, 3).map((tc, idx) => (
                                    <div key={idx} className="p-3 bg-muted rounded-lg text-sm font-mono">
                                        <div className="flex gap-2">
                                            <span className="text-muted-foreground">Input:</span>
                                            <span>{tc.input}</span>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-muted-foreground">Expected:</span>
                                            <span>{tc.expectedOutput}</span>
                                        </div>
                                    </div>
                                ))
                            }
                            {
                                currentQuestion?.testCases.some((tc) => tc.isHidden) && (
                                    <p className="text-xs text-muted-foreground">
                                        + {currentQuestion.testCases.filter((tc) => tc.isHidden).length} hidden test cases
                                    </p>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>
                <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="code" className="gap-2">
                                    <FileCode className="w-4 h-4" />
                                    Code
                                </TabsTrigger>
                                <TabsTrigger value="output" className="gap-2">
                                    <Terminal className="w-4 h-4" />
                                    Output
                                </TabsTrigger>
                                <TabsTrigger value="tests" className="gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Tests
                                </TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={handleReset}>
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Reset code</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <TabsContent value="code" className="mt-4">
                            <div className="h-[400px] border rounded-lg overflow-hidden">
                                <CodeEditor
                                    language={currentQuestion?.language?.toLowerCase() || "javascript"}
                                    forceCode={code}
                                    initialCode={currentQuestion?.starterCode || ""}
                                    onChange={(value) => setCode(value || "")}
                                    height="400px"
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="output" className="mt-4">
                            <div className="h-[400px] bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm overflow-auto">
                                {
                                    output ? (
                                        <pre>{output}</pre>
                                    ) : (
                                        <span className="text-zinc-500">
                                            Run your code to see output here...
                                        </span>
                                    )
                                }
                            </div>
                        </TabsContent>
                        <TabsContent value="tests" className="mt-4">
                            <div className="h-[400px] bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-auto space-y-3">
                                {
                                    testResults.length > 0 ? (
                                        testResults.map((result, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "p-3 rounded-lg border",
                                                    result.passed
                                                        ? "bg-green-900/20 border-green-700"
                                                        : "bg-red-900/20 border-red-700"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    {
                                                        result.passed ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-red-500" />
                                                        )
                                                    }
                                                    <span className="font-medium">
                                                        Test Case {idx + 1}
                                                    </span>
                                                </div>
                                                <div className="text-xs space-y-1 font-mono">
                                                    <div>Input: {result.input}</div>
                                                    <div>Expected: {result.expectedOutput}</div>
                                                    <div>Got: {result.actualOutput}</div>
                                                    {
                                                        result.error && (
                                                            <div className="text-red-400">Error: {result.error}</div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-zinc-500">
                                            Submit your code to see test results...
                                        </span>
                                    )
                                }
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0 || context === "exam"}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>
                <div className="flex items-center gap-2">
                    {
                        onRunCode && (
                            <Button
                                variant="outline"
                                onClick={handleRunCode}
                                disabled={isRunning || !code.trim()}
                            >
                                <Play className="w-4 h-4 mr-2" />
                                {isRunning ? "Running..." : "Run Code"}
                            </Button>
                        )
                    }
                    {
                        !showResult ? (
                            <Button
                                onClick={handleSubmitCode}
                                disabled={isSubmitting || !code.trim()}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Solution"}
                            </Button>
                        ) : (
                            <Button onClick={handleNext}>
                                {
                                    currentIndex < questions.length - 1 ? (
                                        <>
                                            Next Problem
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </>
                                    ) : (
                                        "Complete"
                                    )
                                }
                            </Button>
                        )
                    }
                </div>
            </div>
            <AnimatePresence>
                {
                    showResult && testResults.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <Card className={cn(
                                "border-2",
                                testResults.every((t) => t.passed)
                                    ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                    : "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
                            )}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {
                                                testResults.every((t) => t.passed) ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-orange-500" />
                                                )
                                            }
                                            <div>
                                                <p className="font-medium">
                                                    {testResults.filter((t) => t.passed).length} / {testResults.length} test cases passed
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {testResults.every((t) => t.passed)
                                                        ? "Great job! All tests passed."
                                                        : "Some tests failed. Review your solution."}
                                                </p>
                                            </div>
                                        </div>
                                        {
                                            context === "practice" && currentQuestion?.solutionCode && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCode(currentQuestion.solutionCode || "")}
                                                >
                                                    View Solution
                                                </Button>
                                            )
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    );
}