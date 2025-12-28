"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Loader2, AlertCircle, Clock, CheckCircle2
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@repo/ui/components/ui/alert-dialog";
import toast from '@repo/ui/components/ui/sonner'
import {
    QuizMode, CodeMode, MockMode, MixedMode
} from "@/components/assessments/modes";
import type {
    QuizQuestion, CodeQuestion, MockQuestion, MixedQuestion
} from "@/components/assessments/modes";
import {
    submitPracticeSetAnswer, completePracticeSetAttempt,
    getPracticeAttemptResults
} from "@/actions/(main)/assessments/user-sets.action";
import {
    AssessmentMode, QuestionDifficulty
} from "@repo/prisma/client";
import { PracticeAttemptDetails, PracticeSetQuestion } from "@/types/assessment";

// Type for the API response data structure (matches what getPracticeAttemptResults returns)
interface AttemptApiData {
    id: string;
    userId: string;
    practiceSetId: string;
    mode: AssessmentMode;
    totalQuestions: number;
    answeredCount: number;
    correctCount: number;
    score: number | null;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    startedAt: Date;
    completedAt: Date | null;
    creditsEarned: number;
    practiceSet: {
        id: string;
        title: string;
        language: string;
        difficulty: QuestionDifficulty;
        timeLimit: number | null;
        questions: PracticeSetQuestion[];
        topic?: { name: string } | null;
        subModule?: { name: string } | null;
    };
    answers: unknown[];
}

export default function PracticeAttemptPage({
    params,
}: {
    params: Promise<{ attemptId: string }>;
}) {
    const { attemptId } = use(params);
    const router = useRouter();

    const [attemptData, setAttemptData] = useState<PracticeAttemptDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showExitDialog, setShowExitDialog] = useState(false);

    // Fetch attempt data
    useEffect(() => {
        async function fetchAttempt() {
            try {
                const result = await getPracticeAttemptResults(attemptId);
                if (result.success && result.data) {
                    // Transform the data from API response to PracticeAttemptDetails
                    const apiData = result.data as unknown as AttemptApiData;

                    const transformedData: PracticeAttemptDetails = {
                        id: apiData.id,
                        userId: apiData.userId,
                        practiceSetId: apiData.practiceSetId,
                        mode: apiData.mode,
                        totalQuestions: apiData.totalQuestions,
                        answeredCount: apiData.answeredCount,
                        correctCount: apiData.correctCount,
                        score: apiData.score,
                        status: apiData.status,
                        startedAt: apiData.startedAt,
                        completedAt: apiData.completedAt,
                        creditsEarned: apiData.creditsEarned,
                        practiceSet: {
                            id: apiData.practiceSet.id,
                            title: apiData.practiceSet.title,
                            language: apiData.practiceSet.language,
                            difficulty: apiData.practiceSet.difficulty,
                            timeLimit: apiData.practiceSet.timeLimit,
                            questions: apiData.practiceSet.questions || [],
                            topic: apiData.practiceSet.topic,
                            subModule: apiData.practiceSet.subModule,
                        },
                        answers: [],
                    };

                    setAttemptData(transformedData);
                } else {
                    toast.error(result.error || "Failed to load attempt");
                    router.push("/assessments/practice");
                }
            } catch (error) {
                console.error("Error fetching attempt:", error);
                toast.error("Failed to load attempt");
                router.push("/assessments/practice");
            } finally {
                setLoading(false);
            }
        }

        fetchAttempt();
    }, [attemptId, router]);

    // Submit quiz answer handler
    const handleSubmitQuizAnswer = useCallback(
        async (questionId: string, answer: string) => {
            const result = await submitPracticeSetAnswer(
                attemptId,
                questionId,
                answer,
                undefined,
                undefined
            );

            return {
                isCorrect: result.isCorrect || false,
                correctAnswer: result.correctAnswer || "",
                explanation: result.explanation || null,
            };
        },
        [attemptId]
    );

    // Submit code answer handler
    const handleSubmitCodeAnswer = useCallback(
        async (questionId: string, code: string) => {
            const result = await submitPracticeSetAnswer(
                attemptId,
                questionId,
                undefined,
                code,
                undefined
            );

            // Mock test results - in production, this would be actual test execution
            return {
                isCorrect: result.isCorrect || false,
                testResults: [
                    {
                        input: "test input",
                        expectedOutput: "expected",
                        actualOutput: result.isCorrect ? "expected" : "actual",
                        passed: result.isCorrect || false,
                    },
                ],
                explanation: result.explanation || null,
            };
        },
        [attemptId]
    );

    // Submit mock answer handler
    const handleSubmitMockAnswer = useCallback(
        async (questionId: string, answer: string) => {
            const result = await submitPracticeSetAnswer(
                attemptId,
                questionId,
                undefined, // selectedOption
                undefined, // codeAnswer
                answer // textAnswer
            );

            // Mock AI feedback - in production, this would come from AI evaluation
            return {
                feedback: {
                    score: result.isCorrect ? 85 : 45,
                    strengths: result.isCorrect
                        ? ["Clear explanation", "Good structure"]
                        : ["Attempted the question"],
                    improvements: result.isCorrect
                        ? []
                        : ["Add more detail", "Include examples"],
                    suggestedAnswer: result.explanation || undefined,
                },
            };
        },
        [attemptId]
    );

    // Complete practice handler
    const handleComplete = useCallback(
        async () => {
            setIsCompleting(true);
            try {
                const result = await completePracticeSetAttempt(attemptId);
                if (result.success) {
                    toast.success("Practice completed!");
                    router.push(`/assessments/practice/results/${attemptId}`);
                } else {
                    toast.error(result.error || "Failed to complete practice");
                }
            } catch (error) {
                console.error("Error completing practice:", error);
                toast.error("Failed to complete practice");
            } finally {
                setIsCompleting(false);
            }
        },
        [attemptId, router]
    );

    // Exit handler
    const handleExit = () => {
        setShowExitDialog(true);
    };

    const confirmExit = async () => {
        // Complete the attempt with current progress
        await completePracticeSetAttempt(attemptId);
        router.push("/assessments/practice");
    };

    // Transform questions based on mode
    const getQuizQuestions = (): QuizQuestion[] => {
        if (!attemptData) return [];
        return attemptData.practiceSet.questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            difficulty: attemptData.practiceSet.difficulty,
            options: (q.options as string[]) || [],
            codeSnippet: q.codeSnippet,
            points: q.points,
        }));
    };

    const getCodeQuestions = (): CodeQuestion[] => {
        if (!attemptData) return [];
        return attemptData.practiceSet.questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            difficulty: attemptData.practiceSet.difficulty,
            starterCode: q.starterCode,
            testCases: [], // Would come from question data
            language: attemptData.practiceSet.language.toLowerCase(),
            points: q.points,
        }));
    };

    const getMockQuestions = (): MockQuestion[] => {
        if (!attemptData) return [];
        return attemptData.practiceSet.questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            difficulty: attemptData.practiceSet.difficulty,
            points: q.points,
            category: "Technical",
        }));
    };

    const getMixedQuestions = (): MixedQuestion[] => {
        if (!attemptData) return [];
        return attemptData.practiceSet.questions.map((q) => ({
            id: q.id,
            question: q.question,
            type: q.type,
            difficulty: attemptData.practiceSet.difficulty,
            mode: q.type === "MCQ" ? "QUIZ" : q.type === "CODE_WRITE" ? "CODE" : "MOCK",
            options: (q.options as string[]) || [],
            starterCode: q.starterCode,
            testCases: [],
            language: attemptData.practiceSet.language.toLowerCase(),
            codeSnippet: q.codeSnippet,
            points: q.points,
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading practice...</p>
                </div>
            </div>
        );
    }

    if (!attemptData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Attempt not found</h2>
                        <p className="text-muted-foreground mb-4">
                            This practice attempt may have expired or doesn&apos;t exist.
                        </p>
                        <Link href="/assessments/practice">
                            <Button>Back to Practice</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isCompleting) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 animate-pulse" />
                    <p className="text-lg font-medium">Completing practice...</p>
                    <p className="text-muted-foreground">Calculating your results</p>
                </div>
            </div>
        );
    }

    const renderMode = () => {
        switch (attemptData.mode) {
            case "QUIZ":
                return (
                    <QuizMode
                        questions={getQuizQuestions()}
                        onSubmitAnswer={handleSubmitQuizAnswer}
                        onComplete={handleComplete}
                        onExit={handleExit}
                        showTimer={!!attemptData?.practiceSet?.timeLimit}
                        timeLimit={attemptData?.practiceSet?.timeLimit || undefined}
                        allowHints={true}
                        showProgress={true}
                        immediateResults={true}
                        context="practice"
                    />
                );
            case "CODE":
                return (
                    <CodeMode
                        questions={getCodeQuestions()}
                        onSubmitCode={handleSubmitCodeAnswer}
                        onComplete={handleComplete}
                        onExit={handleExit}
                        showTimer={!!attemptData?.practiceSet?.timeLimit}
                        timeLimit={attemptData?.practiceSet?.timeLimit || undefined}
                        allowHints={true}
                        showProgress={true}
                        context="practice"
                    />
                );
            case "MOCK":
                return (
                    <MockMode
                        questions={getMockQuestions()}
                        onSubmitAnswer={handleSubmitMockAnswer}
                        onComplete={handleComplete}
                        onExit={handleExit}
                        showTimer={!!attemptData?.practiceSet?.timeLimit}
                        timeLimit={attemptData?.practiceSet?.timeLimit || undefined}
                        allowHints={true}
                        showProgress={true}
                        context="practice"
                    />
                );
            case "MIXED":
                return (
                    <MixedMode
                        questions={getMixedQuestions()}
                        onSubmitQuizAnswer={handleSubmitQuizAnswer}
                        onSubmitCodeAnswer={handleSubmitCodeAnswer}
                        onSubmitMockAnswer={handleSubmitMockAnswer}
                        onComplete={handleComplete}
                        onExit={handleExit}
                        showTimer={!!attemptData?.practiceSet?.timeLimit}
                        timeLimit={attemptData?.practiceSet?.timeLimit || undefined}
                        allowHints={true}
                        showProgress={true}
                        context="practice"
                    />
                );
            default:
                return (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p>Unknown practice mode: {attemptData.mode}</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={handleExit}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold line-clamp-1">
                                {attemptData.practiceSet.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Practice Mode • {attemptData.totalQuestions} questions
                            </p>
                        </div>
                        {
                            attemptData?.practiceSet?.timeLimit && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>Timed</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            <div className="container py-8">{renderMode()}</div>

            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Exit Practice?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your current progress will be saved. You can resume later or start fresh.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continue Practice</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit}>
                            Exit & Save Progress
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}