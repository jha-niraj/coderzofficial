"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/ui/radio-group";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Button } from "@repo/ui/components/ui/button";
import { Label } from "@repo/ui/components/ui/label";
import { Progress } from "@repo/ui/components/ui/progress";
import {
    Timer, ChevronLeft, ChevronRight, Menu, AlertCircle, Flag, AlertTriangle, Clock
} from "lucide-react";
import {
    Sheet, SheetContent, SheetTrigger
} from "@repo/ui/components/ui/sheet";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle
} from "@repo/ui/components/ui/dialog";
import { useRouter } from "next/navigation";

export type QuizOption = {
    id: string;
    text: string;
    isCorrect: boolean;
};

export type QuizQuestion = {
    id: string;
    text: string;
    type: "single" | "multiple";
    options: QuizOption[];
    explanation?: string;
    category?: string;
};

export type QuizProps = {
    quizId: string;
    questions: QuizQuestion[];
    quizTitle: string;
    onSubmit: (userAnswers: Record<string, string[]>, timeSpent: number) => void;
    timeLimit?: number;
    onTimerUpdate?: (timeSpent: number) => void;
};

export default function Quiz({ quizId, questions, quizTitle, onSubmit, timeLimit = 3600, onTimerUpdate }: QuizProps) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    // Initialize answers and load from localStorage
    useEffect(() => {
        if (!questions.length) {
            console.error("No questions provided");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const initialAnswers: Record<string, string[]> = {};
        questions.forEach((question) => {
            initialAnswers[question.id] = [];
        });

        const savedData = localStorage.getItem(`quiz-${quizId}`);
        if (savedData) {
            try {
                const { answers, flagged, timeSpent: savedTimeSpent, startTime } = JSON.parse(savedData);
                setUserAnswers({ ...initialAnswers, ...answers });
                setFlaggedQuestions(flagged || []);

                // Restore timer state
                if (savedTimeSpent && startTime) {
                    const currentTime = Date.now();
                    const additionalTime = Math.floor((currentTime - startTime) / 1000);
                    const totalTimeSpent = savedTimeSpent + additionalTime;
                    setTimeSpent(totalTimeSpent);
                    setTimeRemaining(Math.max(0, timeLimit - totalTimeSpent));
                    startTimeRef.current = currentTime - (totalTimeSpent * 1000);
                } else {
                    startTimeRef.current = Date.now();
                }
                setHasUnsavedChanges(Object.keys(answers || {}).some(key => answers[key]?.length > 0));
            } catch (error) {
                console.error("Failed to load saved data:", error);
                startTimeRef.current = Date.now();
            }
        } else {
            setUserAnswers(initialAnswers);
            startTimeRef.current = Date.now();
        }
        setIsLoading(false);
    }, [questions, quizId, timeLimit]);

    // Save answers and timer state to localStorage with debounce
    const saveToLocalStorage = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            const currentTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            localStorage.setItem(`quiz-${quizId}`, JSON.stringify({
                answers: userAnswers,
                flagged: flaggedQuestions,
                timeSpent: currentTimeSpent,
                startTime: Date.now()
            }));

            // Call timer update callback
            if (onTimerUpdate) {
                onTimerUpdate(currentTimeSpent);
            }
        }, 500);
    }, [userAnswers, flaggedQuestions, quizId, onTimerUpdate]);

    useEffect(() => {
        saveToLocalStorage();
    }, [userAnswers, flaggedQuestions, saveToLocalStorage]);

    // Timer implementation
    useEffect(() => {
        timerRef.current = setInterval(() => {
            const currentTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setTimeSpent(currentTimeSpent);
            setTimeRemaining(Math.max(0, timeLimit - currentTimeSpent));

            if (currentTimeSpent >= timeLimit) {
                // Auto-submit when time runs out
                const finalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
                onSubmit(userAnswers, finalTimeSpent);
                localStorage.removeItem(`quiz-${quizId}`);
                setHasUnsavedChanges(false);
            }
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [timeLimit, onSubmit, userAnswers, quizId]);

    // Handle page leave/refresh
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handlePopState = (e: PopStateEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                setShowLeaveDialog(true);
                // Push state back to prevent navigation
                window.history.pushState(null, '', window.location.pathname);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Push initial state to handle back button
        window.history.pushState(null, '', window.location.pathname);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges]);

    const handleSubmitConfirm = useCallback(() => {
        setShowConfirmDialog(false);
        const finalTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onSubmit(userAnswers, finalTimeSpent);
        localStorage.removeItem(`quiz-${quizId}`);
        setHasUnsavedChanges(false);
    }, [onSubmit, userAnswers, quizId]);

    const handleLeaveConfirm = useCallback(() => {
        // Save current progress before leaving
        const currentTimeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
        localStorage.setItem(`quiz-${quizId}`, JSON.stringify({
            answers: userAnswers,
            flagged: flaggedQuestions,
            timeSpent: currentTimeSpent,
            startTime: Date.now()
        }));

        if (onTimerUpdate) {
            onTimerUpdate(currentTimeSpent);
        }

        setHasUnsavedChanges(false);
        setShowLeaveDialog(false);
        router.back();
    }, [userAnswers, flaggedQuestions, quizId, onTimerUpdate, router]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    }, [currentQuestionIndex, questions.length]);

    const handlePreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    }, [currentQuestionIndex]);

    const handleQuestionSelect = useCallback((index: number) => {
        setCurrentQuestionIndex(index);
        setShowSidebar(false);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
                handlePreviousQuestion();
            } else if (e.key === "ArrowRight" && currentQuestionIndex < questions.length - 1) {
                handleNextQuestion();
            } else if (/^[1-9]$/.test(e.key)) {
                const index = parseInt(e.key) - 1;
                if (index < questions.length) {
                    handleQuestionSelect(index);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentQuestionIndex, questions.length, handlePreviousQuestion, handleNextQuestion, handleQuestionSelect]);

    const answeredQuestionsCount = Object.values(userAnswers).filter((answers) => answers.length > 0).length;

    const handleSingleChoiceChange = useCallback(
        (value: string) => {
            setUserAnswers((prev) => ({
                ...prev,
                [questions[currentQuestionIndex]?.id || ""]: [value],
            }));
            setHasUnsavedChanges(true);
        },
        [currentQuestionIndex, questions]
    );

    const handleMultipleChoiceChange = useCallback(
        (optionId: string, checked: boolean) => {
            setUserAnswers((prev) => {
                const currentAnswers = [...(prev[questions[currentQuestionIndex]?.id || ""] || [])];
                if (checked) {
                    if (!currentAnswers.includes(optionId)) {
                        currentAnswers.push(optionId);
                    }
                } else {
                    const index = currentAnswers.indexOf(optionId);
                    if (index !== -1) {
                        currentAnswers.splice(index, 1);
                    }
                }
                return {
                    ...prev,
                    [questions[currentQuestionIndex]?.id || ""]: currentAnswers,
                };
            });
            setHasUnsavedChanges(true);
        },
        [currentQuestionIndex, questions]
    );

    const handleFlagQuestion = useCallback(() => {
        setFlaggedQuestions((prev) => {
            const questionId = questions[currentQuestionIndex]?.id || "";
            if (prev.includes(questionId)) {
                return prev.filter((id) => id !== questionId);
            }
            return [...prev, questionId];
        });
    }, [currentQuestionIndex, questions]);

    const handleSubmitClick = useCallback(() => {
        setShowConfirmDialog(true);
    }, []);

    const isQuestionAnswered = useCallback((questionId: string) => {
        const answers = userAnswers[questionId || ""];
        return answers && answers.length > 0;
    }, [userAnswers]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No questions available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{quizTitle}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Time Spent: {formatTime(timeSpent)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Timer className="h-4 w-4" />
                            <span className={timeRemaining < 300 ? "text-red-500 font-medium" : ""}>
                                {formatTime(timeRemaining)} remaining
                            </span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span>{answeredQuestionsCount} answered</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                </div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                {currentQuestionIndex + 1}
                            </span>
                            {
                                currentQuestion.category && (
                                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                                        {currentQuestion.category}
                                    </span>
                                )
                            }
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-6 leading-relaxed">
                            {currentQuestion.text}
                        </h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFlagQuestion}
                        className={flaggedQuestions.includes(currentQuestion.id) ? "text-orange-500" : ""}
                    >
                        <Flag className="h-4 w-4" />
                    </Button>
                </div>
                <div className="space-y-3">
                    {
                        currentQuestion.type === "single" ? (
                            <RadioGroup
                                value={userAnswers[currentQuestion.id]?.[0] || ""}
                                onValueChange={handleSingleChoiceChange}
                            >
                                {
                                    currentQuestion.options.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value={option.id} id={option.id} />
                                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))
                                }
                            </RadioGroup>
                        ) : (
                            <div className="space-y-3">
                                {
                                    currentQuestion.options.map((option) => (
                                        <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id={option.id}
                                                checked={userAnswers[currentQuestion.id]?.includes(option.id) || false}
                                                onCheckedChange={(checked: boolean) =>
                                                    handleMultipleChoiceChange(option.id, checked)
                                                }
                                            />
                                            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))
                                }
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Menu className="h-4 w-4 mr-2" />
                                    Questions
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-80">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Question Navigator</h3>
                                    <div className="grid grid-cols-5 gap-2">
                                        {
                                            questions.map((question, index) => (
                                                <Button
                                                    key={question.id}
                                                    variant={index === currentQuestionIndex ? "default" : "outline"}
                                                    size="sm"
                                                    className={`relative ${isQuestionAnswered(question.id) ? "bg-green-100 border-green-300 text-green-800" : ""
                                                        } ${flaggedQuestions.includes(question.id) ? "ring-2 ring-orange-300" : ""
                                                        }`}
                                                    onClick={() => handleQuestionSelect(index)}
                                                >
                                                    {index + 1}
                                                    {
                                                        flaggedQuestions.includes(question.id) && (
                                                            <Flag className="h-3 w-3 absolute -top-1 -right-1 text-orange-500" />
                                                        )
                                                    }
                                                </Button>
                                            ))
                                        }
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                                            <span>Answered</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-orange-300 rounded"></div>
                                            <span>Flagged</span>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        {
                            currentQuestionIndex === questions.length - 1 ? (
                                <Button onClick={handleSubmitClick} className="bg-green-600 hover:bg-green-700">
                                    Submit Quiz
                                </Button>
                            ) : (
                                <Button onClick={handleNextQuestion}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )
                        }
                    </div>
                </div>
            </div>
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Quiz?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to submit your quiz? You have answered {answeredQuestionsCount} out of {questions.length} questions.
                            {
                                answeredQuestionsCount < questions.length && (
                                    <span className="block mt-2 text-amber-600">
                                        You still have {questions.length - answeredQuestionsCount} unanswered questions.
                                    </span>
                                )
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Continue Quiz
                        </Button>
                        <Button onClick={handleSubmitConfirm} className="bg-green-600 hover:bg-green-700">
                            Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Leave Quiz?
                        </DialogTitle>
                        <DialogDescription>
                            Your progress will be saved and you can continue later. Time spent: {formatTime(timeSpent)}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                            Stay
                        </Button>
                        <Button onClick={handleLeaveConfirm} variant="destructive">
                            Save & Leave
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}