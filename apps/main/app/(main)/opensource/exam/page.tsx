"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from '@repo/auth/client';
import {
    BookOpen, Brain, Trophy, Clock, CheckCircle2, XCircle, AlertTriangle,
    ChevronRight, ChevronLeft, Loader2, Shield, GitPullRequest, Terminal,
    FileCode, Lightbulb, Target, Award, Sparkles, ArrowRight, RotateCcw,
    Home, GraduationCap, RefreshCw
} from "lucide-react";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import {
    RadioGroup, RadioGroupItem
} from "@repo/ui/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import toast from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import {
    generateExamQuestions,
    validateExamSubmission,
    checkExamEligibility,
    saveExamResult,
    type ExamQuestion,
    type ExamValidationResult
} from "@/actions/(main)/opensource";

// Exam configuration
const EXAM_CONFIG = {
    timeLimit: 30 * 60, // 30 minutes in seconds
    passingScore: 70, // 70% to pass
    questionsPerExam: 10,
};

export default function CertificationExamPage() {
    const router = useRouter();
    const { status } = useSession();
    const [examState, setExamState] = useState<"intro" | "loading" | "in-progress" | "completed">("intro");
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [timeRemaining, setTimeRemaining] = useState(EXAM_CONFIG.timeLimit);
    const [examResult, setExamResult] = useState<{
        score: number;
        passed: boolean;
        results: ExamValidationResult[];
        certificateId?: string;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [eligibility, setEligibility] = useState<{
        eligible: boolean;
        message: string;
        modulesCompleted: number;
        totalModules: number;
        canRetakeAt?: Date;
    } | null>(null);
    const [showHint, setShowHint] = useState<Record<string, boolean>>({});
    const [isGenerating, setIsGenerating] = useState(false);

    // Check eligibility
    useEffect(() => {
        const fetchEligibility = async () => {
            if (status !== "authenticated") return;

            try {
                const result = await checkExamEligibility();
                setEligibility({
                    eligible: result.eligible,
                    message: result.message,
                    modulesCompleted: result.modulesCompleted,
                    totalModules: result.totalModules,
                    canRetakeAt: result.canRetakeAt
                });
            } catch (error) {
                console.error("Error checking eligibility:", error);
                setEligibility({
                    eligible: false,
                    message: "Unable to verify eligibility. Please try again.",
                    modulesCompleted: 0,
                    totalModules: 5
                });
            }
        };

        fetchEligibility();
    }, [status]);

    // Initialize exam with AI-generated questions
    const initializeExam = useCallback(async () => {
        setIsGenerating(true);
        setExamState("loading");

        try {
            const result = await generateExamQuestions(EXAM_CONFIG.questionsPerExam);
            
            if (!result.success || !result.questions) {
                throw new Error(result.error || "Failed to generate questions");
            }

            setQuestions(result.questions);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setTimeRemaining(EXAM_CONFIG.timeLimit);
            setExamResult(null);
            setShowHint({});
            setExamState("in-progress");
            
            toast.success("Exam started! Good luck!");
        } catch (error) {
            console.error("Error initializing exam:", error);
            toast.error("Failed to start exam. Please try again.");
            setExamState("intro");
        } finally {
            setIsGenerating(false);
        }
    }, []);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Handle answer selection
    const handleAnswer = (questionId: string, answer: string | number) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // Submit exam
    const handleSubmitExam = useCallback(async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Validate all answers using AI
            const validation = await validateExamSubmission(questions, answers);

            if (!validation.success) {
                throw new Error(validation.error || "Validation failed");
            }

            // Save result
            const saveResult = await saveExamResult({
                score: validation.score,
                passed: validation.passed,
                timeTaken: EXAM_CONFIG.timeLimit - timeRemaining,
                answers: validation.results.map(r => ({
                    questionId: r.questionId,
                    answer: String(r.userAnswer),
                    isCorrect: r.isCorrect
                }))
            });

            if (!saveResult.success) {
                console.error("Failed to save result:", saveResult.error);
            }

            setExamResult({
                score: validation.score,
                passed: validation.passed,
                results: validation.results,
                certificateId: saveResult.certificateId
            });

            setExamState("completed");

            if (validation.passed) {
                toast.success("🎉 Congratulations! You passed the exam!");
            } else {
                toast.error("Keep learning! You can retake the exam in 24 hours.");
            }
        } catch (error) {
            console.error("Error submitting exam:", error);
            toast.error("Failed to submit exam. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [answers, questions, timeRemaining, isSubmitting]);

    // Timer
    useEffect(() => {
        if (examState !== "in-progress") return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [examState, handleSubmitExam]);

    // Loading state
    if (status === "loading" || eligibility === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
                    <p className="text-white/70">Loading exam...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (status !== "authenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Card className="max-w-md bg-white/10 backdrop-blur-lg border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">Sign In Required</CardTitle>
                        <CardDescription className="text-white/70">
                            Please sign in to take the certification exam.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => router.push("/signin")} className="w-full">
                            Sign In
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.push("/opensource/learn")}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                        >
                            <Home className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-purple-400" />
                            <h1 className="text-xl font-bold text-white">Certification Exam</h1>
                        </div>
                    </div>
                    {examState === "in-progress" && (
                        <div className="flex items-center gap-4">
                            <Badge 
                                variant={timeRemaining < 300 ? "destructive" : "secondary"} 
                                className={cn(
                                    "text-lg px-4 py-2",
                                    timeRemaining < 300 ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white"
                                )}
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                {formatTime(timeRemaining)}
                            </Badge>
                            <Badge variant="outline" className="text-lg px-4 py-2 border-white/20 text-white">
                                {currentQuestionIndex + 1} / {questions.length}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            <div className="container py-8">
                <AnimatePresence mode="wait">
                    {/* Intro State */}
                    {examState === "intro" && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Card className="border-white/10 bg-white/5 backdrop-blur-lg">
                                <CardHeader className="text-center pb-2">
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full w-fit"
                                    >
                                        <Shield className="h-12 w-12 text-purple-400" />
                                    </motion.div>
                                    <CardTitle className="text-3xl text-white">
                                        Open Source Contribution Certification
                                    </CardTitle>
                                    <CardDescription className="text-lg mt-2 text-white/70">
                                        Prove your Git & GitHub knowledge to unlock contribution access
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-8">
                                    {/* Eligibility Status */}
                                    <div className={cn(
                                        "p-6 rounded-lg border",
                                        eligibility.eligible 
                                            ? "bg-green-500/10 border-green-500/30" 
                                            : "bg-yellow-500/10 border-yellow-500/30"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {eligibility.eligible ? (
                                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                                            ) : (
                                                <AlertTriangle className="h-6 w-6 text-yellow-400" />
                                            )}
                                            <p className={cn(
                                                "text-lg font-medium",
                                                eligibility.eligible ? "text-green-300" : "text-yellow-300"
                                            )}>
                                                {eligibility.message}
                                            </p>
                                        </div>
                                        
                                        {/* Progress bar */}
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm text-white/60 mb-2">
                                                <span>Modules Completed</span>
                                                <span>{eligibility.modulesCompleted}/{eligibility.totalModules}</span>
                                            </div>
                                            <Progress 
                                                value={(eligibility.modulesCompleted / eligibility.totalModules) * 100} 
                                                className="h-2 bg-white/10"
                                            />
                                        </div>

                                        {!eligibility.eligible && (
                                            <Button
                                                variant="outline"
                                                className="mt-4 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                                                onClick={() => router.push("/opensource/learn")}
                                            >
                                                Go to Learning Hub <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        )}

                                        {eligibility.canRetakeAt && (
                                            <p className="mt-3 text-sm text-white/50">
                                                You can retake the exam at: {eligibility.canRetakeAt.toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                                            <p className="font-medium text-white">30 Minutes</p>
                                            <p className="text-sm text-white/60">Time Limit</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                            <Target className="h-8 w-8 mx-auto mb-2 text-green-400" />
                                            <p className="font-medium text-white">{EXAM_CONFIG.questionsPerExam} Questions</p>
                                            <p className="text-sm text-white/60">AI-Generated</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                                            <Award className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                                            <p className="font-medium text-white">{EXAM_CONFIG.passingScore}% to Pass</p>
                                            <p className="text-sm text-white/60">Passing Score</p>
                                        </div>
                                    </div>

                                    {/* Question Types */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-white">What to Expect</h3>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Brain className="h-5 w-5 text-blue-400" />
                                                    <span className="font-medium text-white">Quiz Questions</span>
                                                </div>
                                                <p className="text-sm text-white/60">
                                                    Multiple choice questions testing Git & GitHub knowledge
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Terminal className="h-5 w-5 text-green-400" />
                                                    <span className="font-medium text-white">Code Challenges</span>
                                                </div>
                                                <p className="text-sm text-white/60">
                                                    Write actual Git commands for real-world scenarios
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                                                    <span className="font-medium text-white">Scenario Based</span>
                                                </div>
                                                <p className="text-sm text-white/60">
                                                    Problem-solving questions for collaboration situations
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rules */}
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-white">
                                            <FileCode className="h-5 w-5" />
                                            Exam Rules
                                        </h3>
                                        <ul className="text-sm text-white/60 space-y-1">
                                            <li>• Questions are uniquely generated using AI for each attempt</li>
                                            <li>• You must complete the exam in one sitting</li>
                                            <li>• The exam will auto-submit when time runs out</li>
                                            <li>• You can navigate between questions before submitting</li>
                                            <li>• If you fail, you can retake after 24 hours</li>
                                            <li>• Hints are available for code questions</li>
                                        </ul>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex justify-center pb-8">
                                    <Button
                                        size="lg"
                                        className="text-lg px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                        onClick={initializeExam}
                                        disabled={!eligibility.eligible || isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Generating Questions...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5" />
                                                Start Exam
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* Loading State */}
                    {examState === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-2xl mx-auto text-center py-20"
                        >
                            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
                                <RefreshCw className="h-16 w-16 animate-spin text-purple-400 mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Generating Your Exam
                                </h2>
                                <p className="text-white/60 mb-4">
                                    AI is creating unique questions based on your learning path...
                                </p>
                                <div className="flex justify-center gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-3 h-3 rounded-full bg-purple-400"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.8,
                                                delay: i * 0.2
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* In Progress State */}
                    {examState === "in-progress" && currentQuestion && (
                        <motion.div
                            key={`question-${currentQuestionIndex}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            {/* Progress */}
                            <div className="mb-6">
                                <Progress value={progress} className="h-2 bg-white/10" />
                                <p className="text-sm text-white/60 mt-2 text-center">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </p>
                            </div>

                            <Card className="border-white/10 bg-white/5 backdrop-blur-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="capitalize border-white/20 text-white/80">
                                            {currentQuestion.type === "quiz" && <Brain className="h-3 w-3 mr-1" />}
                                            {currentQuestion.type === "code" && <Terminal className="h-3 w-3 mr-1" />}
                                            {currentQuestion.type === "scenario" && <Lightbulb className="h-3 w-3 mr-1" />}
                                            {currentQuestion.type}
                                        </Badge>
                                        <Badge
                                            className={cn(
                                                currentQuestion.difficulty === "easy" && "bg-green-500/20 text-green-300",
                                                currentQuestion.difficulty === "medium" && "bg-yellow-500/20 text-yellow-300",
                                                currentQuestion.difficulty === "hard" && "bg-red-500/20 text-red-300"
                                            )}
                                        >
                                            {currentQuestion.difficulty}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Quiz Question */}
                                    {currentQuestion.type === "quiz" && (
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-medium text-white">
                                                {currentQuestion.question}
                                            </h2>
                                            <RadioGroup
                                                value={answers[currentQuestion.id]?.toString()}
                                                onValueChange={(v) => handleAnswer(currentQuestion.id, parseInt(v))}
                                                className="space-y-3"
                                            >
                                                {currentQuestion.options.map((option, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                                                            answers[currentQuestion.id] === idx
                                                                ? "border-purple-500 bg-purple-500/10"
                                                                : "border-white/10 hover:border-white/30 bg-white/5"
                                                        )}
                                                        onClick={() => handleAnswer(currentQuestion.id, idx)}
                                                    >
                                                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                                                        <Label 
                                                            htmlFor={`option-${idx}`} 
                                                            className="flex-1 cursor-pointer text-base text-white"
                                                        >
                                                            {option}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    )}

                                    {/* Code Question */}
                                    {currentQuestion.type === "code" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-medium mb-2 text-white">
                                                    {currentQuestion.title}
                                                </h2>
                                                <p className="text-white/70">{currentQuestion.description}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <p className="text-sm font-medium mb-1 text-white/80">Scenario:</p>
                                                <p className="text-white/60">{currentQuestion.scenario}</p>
                                            </div>
                                            <div>
                                                <Label htmlFor="code-answer" className="text-base mb-2 block text-white">
                                                    Your Command(s):
                                                </Label>
                                                <Textarea
                                                    id="code-answer"
                                                    value={(answers[currentQuestion.id] as string) || ""}
                                                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                                    placeholder="Enter your Git command(s) here..."
                                                    className="font-mono text-base min-h-[120px] bg-black/50 border-white/20 text-green-400 placeholder:text-white/30"
                                                />
                                            </div>
                                            <div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                                    onClick={() => setShowHint(prev => ({
                                                        ...prev,
                                                        [currentQuestion.id]: !prev[currentQuestion.id]
                                                    }))}
                                                >
                                                    <Lightbulb className="h-4 w-4 mr-2" />
                                                    {showHint[currentQuestion.id] ? "Hide Hints" : "Show Hints"}
                                                </Button>
                                                <AnimatePresence>
                                                    {showHint[currentQuestion.id] && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="mt-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                                                        >
                                                            <ul className="text-sm space-y-1">
                                                                {currentQuestion.hints.map((hint, idx) => (
                                                                    <li key={idx} className="flex items-start gap-2 text-yellow-200">
                                                                        <span>💡</span>
                                                                        {hint}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}

                                    {/* Scenario Question */}
                                    {currentQuestion.type === "scenario" && (
                                        <div className="space-y-6">
                                            <div>
                                                <h2 className="text-xl font-medium mb-2 text-white">
                                                    {currentQuestion.title}
                                                </h2>
                                            </div>
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <p className="text-white/70">{currentQuestion.scenario}</p>
                                            </div>
                                            <p className="font-medium text-white">{currentQuestion.question}</p>
                                            <RadioGroup
                                                value={answers[currentQuestion.id]?.toString()}
                                                onValueChange={(v) => handleAnswer(currentQuestion.id, parseInt(v))}
                                                className="space-y-3"
                                            >
                                                {currentQuestion.options.map((option, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer",
                                                            answers[currentQuestion.id] === idx
                                                                ? "border-purple-500 bg-purple-500/10"
                                                                : "border-white/10 hover:border-white/30 bg-white/5"
                                                        )}
                                                        onClick={() => handleAnswer(currentQuestion.id, idx)}
                                                    >
                                                        <RadioGroupItem value={idx.toString()} id={`scenario-${idx}`} />
                                                        <Label 
                                                            htmlFor={`scenario-${idx}`} 
                                                            className="flex-1 cursor-pointer text-base text-white"
                                                        >
                                                            {option}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="flex justify-between pt-6">
                                    <Button
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-white/10"
                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </Button>

                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <Button
                                            className="bg-gradient-to-r from-purple-500 to-blue-500"
                                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmitExam}
                                            disabled={isSubmitting}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Evaluating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Submit Exam
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>

                            {/* Question Navigation */}
                            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-sm font-medium mb-3 text-white/80">Question Navigation</p>
                                <div className="flex flex-wrap gap-2">
                                    {questions.map((q, idx) => (
                                        <Button
                                            key={q.id}
                                            variant={idx === currentQuestionIndex ? "default" : "outline"}
                                            size="sm"
                                            className={cn(
                                                "w-10 h-10",
                                                idx === currentQuestionIndex 
                                                    ? "bg-purple-500" 
                                                    : answers[q.id] !== undefined 
                                                        ? "bg-green-500/20 border-green-500/30 text-green-300"
                                                        : "border-white/20 text-white/60"
                                            )}
                                            onClick={() => setCurrentQuestionIndex(idx)}
                                        >
                                            {idx + 1}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-4 mt-3 text-xs text-white/50">
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-purple-500" /> Current
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-green-500/50" /> Answered
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded border border-white/30" /> Not Answered
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Completed State */}
                    {examState === "completed" && examResult && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Card className={cn(
                                "border-2 bg-white/5 backdrop-blur-lg",
                                examResult.passed ? "border-green-500/50" : "border-red-500/50"
                            )}>
                                <CardHeader className="text-center pb-2">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className={cn(
                                            "mx-auto mb-4 p-6 rounded-full w-fit",
                                            examResult.passed 
                                                ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20" 
                                                : "bg-gradient-to-br from-red-500/20 to-orange-500/20"
                                        )}
                                    >
                                        {examResult.passed ? (
                                            <Trophy className="h-16 w-16 text-green-400" />
                                        ) : (
                                            <XCircle className="h-16 w-16 text-red-400" />
                                        )}
                                    </motion.div>
                                    <CardTitle className="text-3xl text-white">
                                        {examResult.passed ? "🎉 Congratulations!" : "Keep Learning!"}
                                    </CardTitle>
                                    <CardDescription className="text-lg mt-2 text-white/70">
                                        {examResult.passed
                                            ? "You've earned your Open Source Contribution Certificate!"
                                            : "You didn't pass this time, but don't give up!"}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-8">
                                    {/* Score */}
                                    <div className="text-center">
                                        <div className={cn(
                                            "text-7xl font-bold mb-2",
                                            examResult.passed ? "text-green-400" : "text-red-400"
                                        )}>
                                            {examResult.score}%
                                        </div>
                                        <p className="text-white/60">
                                            {examResult.results.filter(r => r.isCorrect).length} out of {questions.length} correct
                                        </p>
                                        <Progress
                                            value={examResult.score}
                                            className={cn(
                                                "h-3 mt-4 max-w-md mx-auto bg-white/10",
                                                examResult.passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"
                                            )}
                                        />
                                        <p className="text-sm text-white/50 mt-2">
                                            Passing score: {EXAM_CONFIG.passingScore}%
                                        </p>
                                    </div>

                                    {/* Question Breakdown */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4 text-white">Question Breakdown</h3>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                            {questions.map((q, idx) => {
                                                const result = examResult.results.find(r => r.questionId === q.id);
                                                return (
                                                    <div
                                                        key={q.id}
                                                        className={cn(
                                                            "p-4 rounded-lg border",
                                                            result?.isCorrect
                                                                ? "bg-green-500/10 border-green-500/30"
                                                                : "bg-red-500/10 border-red-500/30"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge variant="outline" className="capitalize text-xs border-white/20 text-white/70">
                                                                        {q.type}
                                                                    </Badge>
                                                                    <span className="text-sm font-medium text-white">
                                                                        Question {idx + 1}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-white/60">
                                                                    {q.type === "quiz" || q.type === "scenario"
                                                                        ? q.question?.slice(0, 100) + (q.question?.length > 100 ? "..." : "")
                                                                        : q.title}
                                                                </p>
                                                                {!result?.isCorrect && (
                                                                    <p className="text-xs mt-2 text-white/50">
                                                                        💡 {result?.explanation}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                {result?.isCorrect ? (
                                                                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                                                                ) : (
                                                                    <XCircle className="h-6 w-6 text-red-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Certificate or Retry */}
                                    {examResult.passed ? (
                                        <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent border border-green-500/30 text-center">
                                            <Award className="h-12 w-12 mx-auto mb-4 text-green-400" />
                                            <h3 className="text-xl font-semibold text-green-300 mb-2">
                                                Certificate Earned!
                                            </h3>
                                            <p className="text-white/60 mb-2">
                                                You&apos;re now certified to contribute to open source projects.
                                            </p>
                                            {examResult.certificateId && (
                                                <p className="text-sm text-white/40 mb-4">
                                                    Certificate ID: {examResult.certificateId}
                                                </p>
                                            )}
                                            <div className="flex gap-4 justify-center">
                                                <Button 
                                                    onClick={() => router.push("/opensource")}
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                                                >
                                                    <GitPullRequest className="mr-2 h-4 w-4" />
                                                    Start Contributing
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 rounded-lg bg-white/5 border border-white/10 text-center">
                                            <RotateCcw className="h-12 w-12 mx-auto mb-4 text-white/40" />
                                            <h3 className="text-xl font-semibold mb-2 text-white">Don&apos;t Give Up!</h3>
                                            <p className="text-white/60 mb-4">
                                                Review the learning modules and try again in 24 hours.
                                            </p>
                                            <div className="flex gap-4 justify-center">
                                                <Button 
                                                    variant="outline" 
                                                    className="border-white/20 text-white"
                                                    onClick={() => router.push("/opensource/learn")}
                                                >
                                                    <BookOpen className="mr-2 h-4 w-4" />
                                                    Review Lessons
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    className="border-white/20 text-white"
                                                    onClick={() => router.push("/opensource")}
                                                >
                                                    <Home className="mr-2 h-4 w-4" />
                                                    Back to Hub
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
