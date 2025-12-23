"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Trophy,
    Clock,
    Coins,
    Target,
    BarChart3,
    RefreshCw,
    Home,
    Share2,
    Loader2,
    AlertCircle,
    PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { getPracticeAttemptResults } from "@/actions/(main)/assessments/user-sets.action";
import { DIFFICULTY_CONFIG, LANGUAGE_CONFIG } from "@/types/assessment";

// ==================== TYPES ====================

interface AnswerData {
    id: string;
    questionId: string;
    selectedOption: string | null;
    codeAnswer: string | null;
    textAnswer: string | null;
    isCorrect: boolean;
    pointsEarned: number;
    question: {
        id: string;
        question: string;
        type: string;
        options: unknown;
        correctAnswer: string | null;
        answerExplanation: string | null;
        codeSnippet: string | null;
        orderIndex: number;
        points: number;
    };
}

interface AttemptResult {
    id: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    answeredCount: number;
    status: string;
    creditsEarned: number;
    startedAt: string;
    completedAt: string | null;
    practiceSet: {
        id: string;
        title: string;
        slug: string;
        language: string;
        mode: string;
        difficulty: string;
        topic?: { name: string } | null;
        subModule?: { name: string } | null;
    };
    answers: AnswerData[];
}

// ==================== PAGE COMPONENT ====================

export default function PracticeResultsPage({
    params,
}: {
    params: Promise<{ attemptId: string }>;
}) {
    const { attemptId } = use(params);
    const router = useRouter();
    
    const [result, setResult] = useState<AttemptResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        async function fetchResults() {
            try {
                const response = await getPracticeAttemptResults(attemptId);
                if (response.success && response.data) {
                    setResult(response.data as unknown as AttemptResult);
                    
                    // Show celebration for good scores
                    if ((response.data as any).score >= 70) {
                        setShowCelebration(true);
                        setTimeout(() => setShowCelebration(false), 5000);
                    }
                } else {
                    toast.error(response.error || "Failed to load results");
                }
            } catch (error) {
                console.error("Error fetching results:", error);
                toast.error("Failed to load results");
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [attemptId]);

    const handleShare = async () => {
        const text = result
            ? `I scored ${result.score}% on "${result.practiceSet.title}" practice set! 🎉`
            : "Check out this practice set!";
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Practice Results",
                    text,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
                toast.success("Copied to clipboard!");
            }
        } catch {
            // User cancelled or error
        }
    };

    const handleRetry = () => {
        if (result) {
            router.push(`/assessments/practice/set/${result.practiceSet.id}`);
        }
    };

    // Calculate time taken
    const getTimeTaken = () => {
        if (!result?.startedAt || !result?.completedAt) return "N/A";
        const start = new Date(result.startedAt);
        const end = new Date(result.completedAt);
        const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}m ${secs}s`;
    };

    // Get performance message
    const getPerformanceMessage = (score: number) => {
        if (score >= 90) return { text: "Outstanding! 🏆", color: "text-green-500" };
        if (score >= 80) return { text: "Excellent! 🌟", color: "text-green-500" };
        if (score >= 70) return { text: "Great Job! 👏", color: "text-blue-500" };
        if (score >= 60) return { text: "Good Effort! 💪", color: "text-yellow-500" };
        if (score >= 50) return { text: "Keep Practicing! 📚", color: "text-orange-500" };
        return { text: "Don't Give Up! 🔥", color: "text-red-500" };
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading results...</p>
                </div>
            </div>
        );
    }

    // No result state
    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">Results not found</h2>
                        <p className="text-muted-foreground mb-4">
                            This attempt may not exist or hasn&apos;t been completed yet.
                        </p>
                        <Link href="/assessments/practice">
                            <Button>Back to Practice</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const performance = getPerformanceMessage(result.score);
    const langConfig = LANGUAGE_CONFIG[result.practiceSet.language as keyof typeof LANGUAGE_CONFIG];
    const diffConfig = DIFFICULTY_CONFIG[result.practiceSet.difficulty as keyof typeof DIFFICULTY_CONFIG];

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Celebration animation for high scores */}
            {showCelebration && (
                <motion.div
                    className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 3, delay: 2 }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.5, 1] }}
                        transition={{ duration: 0.5 }}
                    >
                        <PartyPopper className="w-24 h-24 text-yellow-500" />
                    </motion.div>
                </motion.div>
            )}

            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/assessments/practice">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-semibold">Practice Results</h1>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {result.practiceSet.title}
                            </p>
                        </div>
                        <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container py-8 space-y-8">
                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Score Circle */}
                                <div className="relative">
                                    <svg className="w-40 h-40 transform -rotate-90">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-muted"
                                        />
                                        <motion.circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            className={cn(
                                                result.score >= 70 ? "text-green-500" :
                                                result.score >= 50 ? "text-yellow-500" :
                                                "text-red-500"
                                            )}
                                            initial={{ strokeDasharray: "0 440" }}
                                            animate={{
                                                strokeDasharray: `${(result.score / 100) * 440} 440`,
                                            }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <motion.span
                                            className="text-4xl font-bold"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            {result.score}%
                                        </motion.span>
                                        <span className="text-sm text-muted-foreground">Score</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h2 className={cn("text-2xl font-bold", performance.color)}>
                                            {performance.text}
                                        </h2>
                                        <p className="text-muted-foreground">
                                            You answered {result.correctCount} out of {result.totalQuestions} questions correctly
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {langConfig && (
                                            <Badge variant="outline">
                                                {langConfig.icon} {langConfig.label}
                                            </Badge>
                                        )}
                                        {diffConfig && (
                                            <Badge className={cn(diffConfig.bg, diffConfig.text)}>
                                                {diffConfig.label}
                                            </Badge>
                                        )}
                                        <Badge variant="secondary">
                                            {result.practiceSet.mode}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <Target className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                                            <p className="text-lg font-semibold">{result.correctCount}/{result.totalQuestions}</p>
                                            <p className="text-xs text-muted-foreground">Correct</p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <Clock className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                                            <p className="text-lg font-semibold">{getTimeTaken()}</p>
                                            <p className="text-xs text-muted-foreground">Time</p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <BarChart3 className="w-5 h-5 mx-auto mb-1 text-green-500" />
                                            <p className="text-lg font-semibold">{result.answeredCount}</p>
                                            <p className="text-xs text-muted-foreground">Attempted</p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <Coins className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                                            <p className="text-lg font-semibold">+{result.creditsEarned}</p>
                                            <p className="text-xs text-muted-foreground">Credits</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Button onClick={handleRetry} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <Link href="/assessments/practice">
                        <Button variant="outline" className="gap-2">
                            <Home className="w-4 h-4" />
                            More Practice
                        </Button>
                    </Link>
                    <Link href={`/assessments/practice/set/${result.practiceSet.id}`}>
                        <Button variant="outline" className="gap-2">
                            View Set
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {/* Question Review */}
                <Card>
                    <CardHeader>
                        <CardTitle>Question Review</CardTitle>
                        <CardDescription>
                            Review your answers and learn from explanations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="space-y-2">
                            {result.answers
                                .sort((a, b) => a.question.orderIndex - b.question.orderIndex)
                                .map((answer, index) => (
                                    <AccordionItem
                                        key={answer.id}
                                        value={answer.id}
                                        className={cn(
                                            "border rounded-lg px-4",
                                            answer.isCorrect
                                                ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                                                : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                                        )}
                                    >
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3 text-left">
                                                <div
                                                    className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                        answer.isCorrect
                                                            ? "bg-green-500 text-white"
                                                            : "bg-red-500 text-white"
                                                    )}
                                                >
                                                    {answer.isCorrect ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium line-clamp-1">
                                                        Q{index + 1}: {answer.question.question}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {answer.pointsEarned}/{answer.question.points} points
                                                    </p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4 space-y-4">
                                            {/* Question */}
                                            <div>
                                                <p className="font-medium mb-2">{answer.question.question}</p>
                                                {answer.question.codeSnippet && (
                                                    <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-lg text-sm overflow-x-auto">
                                                        <code>{answer.question.codeSnippet}</code>
                                                    </pre>
                                                )}
                                            </div>

                                            <div className="border-t my-4" />

                                            {/* Options (for MCQ) */}
                                            {answer.question.options && Array.isArray(answer.question.options) ? (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Options:</p>
                                                    {(answer.question.options as string[]).map((opt, idx) => {
                                                        const letter = String.fromCharCode(65 + idx);
                                                        const isSelected = answer.selectedOption === opt;
                                                        const isCorrectAnswer = answer.question.correctAnswer === opt;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={cn(
                                                                    "p-3 rounded-lg border flex items-center gap-3",
                                                                    isCorrectAnswer && "bg-green-50 dark:bg-green-900/20 border-green-500",
                                                                    isSelected && !isCorrectAnswer && "bg-red-50 dark:bg-red-900/20 border-red-500",
                                                                    !isSelected && !isCorrectAnswer && "bg-muted border-transparent"
                                                                )}
                                                            >
                                                                <span
                                                                    className={cn(
                                                                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                                                        isCorrectAnswer && "bg-green-500 text-white",
                                                                        isSelected && !isCorrectAnswer && "bg-red-500 text-white",
                                                                        !isSelected && !isCorrectAnswer && "bg-muted-foreground/20"
                                                                    )}
                                                                >
                                                                    {letter}
                                                                </span>
                                                                <span className="flex-1">{opt}</span>
                                                                {isCorrectAnswer && (
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                )}
                                                                {isSelected && !isCorrectAnswer && (
                                                                    <XCircle className="w-4 h-4 text-red-500" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : null}

                                            {/* Code Answer */}
                                            {answer.codeAnswer && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Your Code:</p>
                                                    <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-lg text-sm overflow-x-auto">
                                                        <code>{answer.codeAnswer}</code>
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Text Answer */}
                                            {answer.textAnswer && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Your Answer:</p>
                                                    <p className="p-3 bg-muted rounded-lg">{answer.textAnswer}</p>
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            {answer.question.answerExplanation && (
                                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                                                        📚 Explanation
                                                    </p>
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        {answer.question.answerExplanation}
                                                    </p>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                        </Accordion>
                    </CardContent>
                </Card>

                {/* Topic Info */}
                {(result.practiceSet.topic || result.practiceSet.subModule) && (
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Topic</p>
                                    <p className="font-medium">
                                        {result.practiceSet.topic?.name || "General"}
                                        {result.practiceSet.subModule && ` → ${result.practiceSet.subModule.name}`}
                                    </p>
                                </div>
                                <Link href="/assessments/practice">
                                    <Button variant="outline" size="sm">
                                        Explore More Topics
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
