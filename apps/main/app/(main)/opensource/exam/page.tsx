"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from '@repo/auth';
import {
    BookOpen, Brain, Trophy, Clock, CheckCircle2, XCircle, AlertTriangle,
    ChevronRight, ChevronLeft, Loader2, Shield, GitPullRequest, Terminal,
    FileCode, Lightbulb, Target, Award, Sparkles, ArrowRight, RotateCcw,
    Home, GraduationCap
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
import toast from "repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import {
    getLearningProgress, recordExamResult
} from "@/actions/(main)/opensource";

// Exam question types
interface QuizQuestion {
    id: string;
    type: "quiz";
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: "git-basics" | "github" | "workflow" | "best-practices";
    difficulty: "easy" | "medium" | "hard";
}

interface CodeQuestion {
    id: string;
    type: "code";
    title: string;
    description: string;
    scenario: string;
    expectedAnswer: string;
    hints: string[];
    category: "commands" | "workflow" | "debugging";
    difficulty: "easy" | "medium" | "hard";
}

interface ScenarioQuestion {
    id: string;
    type: "scenario";
    title: string;
    scenario: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: "collaboration" | "conflict-resolution" | "code-review";
    difficulty: "easy" | "medium" | "hard";
}

type ExamQuestion = QuizQuestion | CodeQuestion | ScenarioQuestion;

// Comprehensive exam questions
const examQuestions: ExamQuestion[] = [
    // Git Basics - Quiz
    {
        id: "q1",
        type: "quiz",
        question: "What does 'git init' do?",
        options: [
            "Initializes a new Git repository in the current directory",
            "Installs Git on your computer",
            "Creates a new branch called 'init'",
            "Downloads a repository from GitHub"
        ],
        correctAnswer: 0,
        explanation: "git init creates a new .git directory in your current folder, initializing a new Git repository. It's the first step to start version controlling your project.",
        category: "git-basics",
        difficulty: "easy"
    },
    {
        id: "q2",
        type: "quiz",
        question: "What is the correct order of commands to push changes to a remote repository?",
        options: [
            "git push → git add → git commit",
            "git commit → git add → git push",
            "git add → git commit → git push",
            "git add → git push → git commit"
        ],
        correctAnswer: 2,
        explanation: "The correct workflow is: 1) git add (stage changes), 2) git commit (save changes locally), 3) git push (upload to remote). Like packing a box before shipping it!",
        category: "git-basics",
        difficulty: "easy"
    },
    {
        id: "q3",
        type: "quiz",
        question: "What does 'HEAD' refer to in Git?",
        options: [
            "The first commit in the repository",
            "The currently checked-out branch/commit",
            "The main branch only",
            "The GitHub username of the repository owner"
        ],
        correctAnswer: 1,
        explanation: "HEAD is a pointer to the currently checked-out commit. It's like a 'You Are Here' marker on a map of your commit history.",
        category: "git-basics",
        difficulty: "medium"
    },
    // GitHub Workflow - Quiz
    {
        id: "q4",
        type: "quiz",
        question: "What's the purpose of forking a repository on GitHub?",
        options: [
            "To delete the original repository",
            "To create your own copy for experimentation and contributions",
            "To merge two repositories together",
            "To rename the repository"
        ],
        correctAnswer: 1,
        explanation: "Forking creates a personal copy of someone else's project. You can experiment freely without affecting the original, then submit a PR to contribute back.",
        category: "github",
        difficulty: "easy"
    },
    {
        id: "q5",
        type: "quiz",
        question: "What is a Pull Request (PR)?",
        options: [
            "A request to download code from GitHub",
            "A proposal to merge your changes into another branch",
            "A way to delete branches",
            "A request for someone to write code for you"
        ],
        correctAnswer: 1,
        explanation: "A Pull Request is a proposal to merge your changes. It's called 'pull' because you're asking maintainers to 'pull' your changes into their codebase.",
        category: "github",
        difficulty: "easy"
    },
    // Code Questions
    {
        id: "c1",
        type: "code",
        title: "Create a Feature Branch",
        description: "Write the Git command to create a new branch called 'feature/user-auth' and switch to it in one command.",
        scenario: "You're starting work on a new user authentication feature. You need to create a branch and start working on it immediately.",
        expectedAnswer: "git checkout -b feature/user-auth",
        hints: [
            "The -b flag creates a new branch",
            "You can combine branch creation and checkout",
            "The branch name should follow the naming convention given"
        ],
        category: "commands",
        difficulty: "easy"
    },
    {
        id: "c2",
        type: "code",
        title: "Undo Last Commit (Keep Changes)",
        description: "Write the Git command to undo your last commit but keep the changes staged.",
        scenario: "You just committed with the wrong message. You want to undo the commit but keep your changes ready to commit again.",
        expectedAnswer: "git reset --soft HEAD~1",
        hints: [
            "--soft keeps changes staged",
            "HEAD~1 refers to the commit before HEAD",
            "This is different from --hard which discards changes"
        ],
        category: "commands",
        difficulty: "medium"
    },
    {
        id: "c3",
        type: "code",
        title: "Sync Fork with Upstream",
        description: "Write the Git commands to fetch and merge changes from the original (upstream) repository into your fork's main branch.",
        scenario: "Your fork is behind the original repository. You need to sync it before starting new work.",
        expectedAnswer: "git fetch upstream\ngit merge upstream/main",
        hints: [
            "First fetch the upstream changes",
            "Then merge them into your current branch",
            "upstream is the conventional name for the original repo"
        ],
        category: "workflow",
        difficulty: "medium"
    },
    {
        id: "c4",
        type: "code",
        title: "Interactive Rebase",
        description: "Write the command to start an interactive rebase for the last 3 commits.",
        scenario: "You've made 3 commits that should really be squashed into one clean commit before creating a PR.",
        expectedAnswer: "git rebase -i HEAD~3",
        hints: [
            "-i flag starts interactive mode",
            "HEAD~3 means the last 3 commits",
            "You can squash, reorder, or edit commits"
        ],
        category: "commands",
        difficulty: "hard"
    },
    // Scenario Questions
    {
        id: "s1",
        type: "scenario",
        title: "Merge Conflict Resolution",
        scenario: "You've submitted a PR, but GitHub shows a merge conflict. The conflict is in a config file where both you and the main branch added different settings.",
        question: "What's the best approach to resolve this conflict?",
        options: [
            "Delete the conflicting file and recreate it",
            "Force push your changes to overwrite the main branch",
            "Pull the latest changes, manually resolve the conflict keeping both changes if needed, commit, and push",
            "Close the PR and create a new one"
        ],
        correctAnswer: 2,
        explanation: "The professional approach is to pull the latest changes, carefully review and merge both sets of changes (keeping what's needed from both sides), then commit and push the resolution.",
        category: "conflict-resolution",
        difficulty: "medium"
    },
    {
        id: "s2",
        type: "scenario",
        title: "Code Review Feedback",
        scenario: "A maintainer reviewed your PR and left comments requesting changes. They asked you to split one large function into smaller ones and add error handling.",
        question: "What should you do?",
        options: [
            "Close the PR and create a new one with the changes",
            "Make the requested changes in new commits, push, and reply to the comments",
            "Argue that your approach is better",
            "Wait for other maintainers to approve without changes"
        ],
        correctAnswer: 1,
        explanation: "Best practice is to make the requested changes, push new commits to the same PR, and respond to comments explaining what you changed. This maintains the review conversation context.",
        category: "code-review",
        difficulty: "medium"
    },
    {
        id: "s3",
        type: "scenario",
        title: "Accidental Secret Commit",
        scenario: "Oh no! You accidentally committed an API key in your code and pushed it to GitHub. The commit is now in your PR.",
        question: "What's the FIRST thing you should do?",
        options: [
            "Delete the file and make a new commit",
            "Immediately revoke/rotate the exposed API key",
            "Force push to remove the commit",
            "Edit the file to remove the key and push"
        ],
        correctAnswer: 1,
        explanation: "The FIRST priority is always to revoke/rotate the exposed secret! Even if you remove it from Git, it's likely already been scraped by bots. Only after securing the key should you clean up the Git history.",
        category: "collaboration",
        difficulty: "hard"
    },
    {
        id: "s4",
        type: "scenario",
        title: "Branch Protection",
        scenario: "You're working on an open-source project where the main branch has protection rules. You can't push directly to main.",
        question: "How should you contribute your changes?",
        options: [
            "Ask the maintainer to disable branch protection temporarily",
            "Create a feature branch, push your changes, and open a PR",
            "Force push to bypass the protection",
            "Commit directly to main using GitHub's web interface"
        ],
        correctAnswer: 1,
        explanation: "Branch protection exists for good reasons! Create a feature branch, push your work there, and open a PR. This ensures code review and CI checks before merging.",
        category: "collaboration",
        difficulty: "easy"
    },
    // More Quiz Questions
    {
        id: "q6",
        type: "quiz",
        question: "What does 'git stash' do?",
        options: [
            "Permanently deletes uncommitted changes",
            "Temporarily shelves changes so you can work on something else",
            "Creates a new branch with current changes",
            "Pushes changes to a remote stash"
        ],
        correctAnswer: 1,
        explanation: "git stash temporarily saves your uncommitted changes so you can switch branches or work on something urgent. Use 'git stash pop' to restore them.",
        category: "git-basics",
        difficulty: "medium"
    },
    {
        id: "q7",
        type: "quiz",
        question: "What's the difference between 'git merge' and 'git rebase'?",
        options: [
            "There is no difference, they're aliases",
            "Merge combines branches; rebase moves commits to a new base",
            "Merge is for local changes; rebase is for remote",
            "Merge is faster; rebase is slower"
        ],
        correctAnswer: 1,
        explanation: "Merge creates a merge commit combining two branches. Rebase re-applies your commits on top of another branch, creating a linear history. Both have their use cases!",
        category: "workflow",
        difficulty: "hard"
    },
    {
        id: "q8",
        type: "quiz",
        question: "What should a good commit message include?",
        options: [
            "Just the date and time",
            "Your name and email",
            "A clear, concise description of what changed and why",
            "The entire diff of changes"
        ],
        correctAnswer: 2,
        explanation: "Good commit messages explain WHAT changed and WHY. They help future you (and others) understand the project history. 'Fixed bug' is bad; 'Fix null pointer in user authentication flow' is good!",
        category: "best-practices",
        difficulty: "easy"
    }
];

// Exam configuration
const EXAM_CONFIG = {
    timeLimit: 30 * 60, // 30 minutes in seconds
    passingScore: 70, // 70% to pass
    questionsPerExam: 10,
    retakeDelay: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

export default function CertificationExamPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [examState, setExamState] = useState<"intro" | "in-progress" | "completed">("intro");
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number>>({});
    const [timeRemaining, setTimeRemaining] = useState(EXAM_CONFIG.timeLimit);
    const [examResult, setExamResult] = useState<{
        score: number;
        passed: boolean;
        correctAnswers: number;
        totalQuestions: number;
        feedback: Record<string, { correct: boolean; explanation: string }>;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEligible, setIsEligible] = useState<boolean | null>(null);
    const [eligibilityMessage, setEligibilityMessage] = useState("");
    const [showHint, setShowHint] = useState<Record<string, boolean>>({});

    // Check eligibility (completed all learning modules)
    useEffect(() => {
        const checkEligibility = async () => {
            if (status !== "authenticated") return;

            try {
                const progress = await getLearningProgress();

                if (!progress.success) {
                    setIsEligible(false);
                    setEligibilityMessage("Unable to verify your learning progress. Please try again.");
                    return;
                }

                // Check if all modules are completed
                const modules = (progress.data || []) as Array<{ status: string; moduleId: string }>;
                const allCompleted = modules.length >= 5 && modules.every((m) => m.status === "COMPLETED");

                if (allCompleted) {
                    setIsEligible(true);
                    setEligibilityMessage("You've completed all learning modules! You're ready to take the exam.");
                } else {
                    const completedCount = modules.filter((m) => m.status === "COMPLETED").length;
                    setIsEligible(false);
                    setEligibilityMessage(`Complete all 5 learning modules first. Progress: ${completedCount}/5 completed.`);
                }
            } catch (error) {
                console.error("Error checking eligibility:", error);
                setIsEligible(false);
                setEligibilityMessage("Unable to verify eligibility. Please try again.");
            }
        };

        checkEligibility();
    }, [status]);

    // Shuffle and select questions
    const initializeExam = useCallback(() => {
        const shuffled = [...examQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, EXAM_CONFIG.questionsPerExam);
        setQuestions(selected);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setTimeRemaining(EXAM_CONFIG.timeLimit);
        setExamResult(null);
        setShowHint({});
        setExamState("in-progress");
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

    // Calculate score and submit
    const handleSubmitExam = useCallback(async () => {
        setIsSubmitting(true);

        try {
            let correctCount = 0;
            const feedback: Record<string, { correct: boolean; explanation: string }> = {};

            questions.forEach(q => {
                const userAnswer = answers[q.id];
                let isCorrect = false;
                let explanation = "";

                if (q.type === "quiz" || q.type === "scenario") {
                    isCorrect = userAnswer === q.correctAnswer;
                    explanation = q.explanation;
                } else if (q.type === "code") {
                    // Flexible code comparison (normalize whitespace, case-insensitive for commands)
                    const normalizedUser = String(userAnswer || "").toLowerCase().trim().replace(/\s+/g, " ");
                    const normalizedExpected = q.expectedAnswer.toLowerCase().trim().replace(/\s+/g, " ");

                    // Check for equivalent commands
                    isCorrect = normalizedUser === normalizedExpected ||
                        // Allow git switch -c as alternative to git checkout -b
                        (normalizedExpected.includes("checkout -b") && normalizedUser.includes("switch -c")) ||
                        // Allow variations in ordering
                        normalizedUser.split("\n").sort().join("\n") === normalizedExpected.split("\n").sort().join("\n");

                    explanation = `Expected: ${q.expectedAnswer}`;
                }

                if (isCorrect) correctCount++;
                feedback[q.id] = { correct: isCorrect, explanation };
            });

            const score = Math.round((correctCount / questions.length) * 100);
            const passed = score >= EXAM_CONFIG.passingScore;

            // Submit to server
            const result = await recordExamResult({
                answers: Object.entries(answers).map(([questionId, answer]) => ({
                    questionId,
                    answer: String(answer),
                    isCorrect: feedback[questionId].correct,
                })),
                score,
                passed,
                timeTaken: EXAM_CONFIG.timeLimit - timeRemaining,
            });

            if (!result.success) {
                toast.error(result.error || "Failed to submit exam");
                return;
            }

            setExamResult({
                score,
                passed,
                correctAnswers: correctCount,
                totalQuestions: questions.length,
                feedback,
            });

            setExamState("completed");

            if (passed) {
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
    }, [answers, questions, timeRemaining]);

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
    if (status === "loading" || isEligible === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Not authenticated
    if (status !== "authenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Sign In Required</CardTitle>
                        <CardDescription>Please sign in to take the certification exam.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/opensource/learn")}>
                            <Home className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <h1 className="text-xl font-bold">Contribution Certification Exam</h1>
                        </div>
                    </div>
                    {
                        examState === "in-progress" && (
                            <div className="flex items-center gap-4">
                                <Badge variant={timeRemaining < 300 ? "destructive" : "secondary"} className="text-lg px-4 py-2">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {formatTime(timeRemaining)}
                                </Badge>
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                    {currentQuestionIndex + 1} / {questions.length}
                                </Badge>
                            </div>
                        )
                    }
                </div>
            </div>
            <div className="container py-8">
                <AnimatePresence mode="wait">
                    {
                        examState === "intro" && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto"
                            >
                                <Card className="border-2">
                                    <CardHeader className="text-center pb-2">
                                        <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                                            <Shield className="h-12 w-12 text-primary" />
                                        </div>
                                        <CardTitle className="text-3xl">Open Source Contribution Certification</CardTitle>
                                        <CardDescription className="text-lg mt-2">
                                            Prove your Git & GitHub knowledge to unlock contribution access
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className={cn(
                                            "p-6 rounded-lg border-2",
                                            isEligible ? "bg-green-500/10 border-green-500/30" : "bg-yellow-500/10 border-yellow-500/30"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                {
                                                    isEligible ? (
                                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                    ) : (
                                                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                                    )
                                                }
                                                <p className={cn(
                                                    "text-lg font-medium",
                                                    isEligible ? "text-green-700 dark:text-green-300" : "text-yellow-700 dark:text-yellow-300"
                                                )}>
                                                    {eligibilityMessage}
                                                </p>
                                            </div>
                                            {
                                                !isEligible && (
                                                    <Button
                                                        variant="outline"
                                                        className="mt-4"
                                                        onClick={() => router.push("/opensource/learn")}
                                                    >
                                                        Go to Learning Hub <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                )
                                            }
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="font-medium">30 Minutes</p>
                                                <p className="text-sm text-muted-foreground">Time Limit</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                                <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="font-medium">{EXAM_CONFIG.questionsPerExam} Questions</p>
                                                <p className="text-sm text-muted-foreground">Quiz, Code & Scenarios</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-muted/50 text-center">
                                                <Award className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="font-medium">{EXAM_CONFIG.passingScore}% to Pass</p>
                                                <p className="text-sm text-muted-foreground">Passing Score</p>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">What to Expect</h3>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="p-4 rounded-lg border">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Brain className="h-5 w-5 text-blue-500" />
                                                        <span className="font-medium">Quiz Questions</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Multiple choice questions testing your Git & GitHub knowledge
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-lg border">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Terminal className="h-5 w-5 text-green-500" />
                                                        <span className="font-medium">Code Challenges</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Write actual Git commands for real-world scenarios
                                                    </p>
                                                </div>
                                                <div className="p-4 rounded-lg border">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                                                        <span className="font-medium">Scenario Based</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Problem-solving questions for real collaboration situations
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/30 border">
                                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                <FileCode className="h-5 w-5" />
                                                Exam Rules
                                            </h3>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                <li>• You must complete the exam in one sitting</li>
                                                <li>• The exam will auto-submit when time runs out</li>
                                                <li>• You can navigate between questions before submitting</li>
                                                <li>• If you fail, you can retake after 24 hours</li>
                                                <li>• Hints are available for code questions (won't affect your score)</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-center pb-8">
                                        <Button
                                            size="lg"
                                            className="text-lg px-8"
                                            onClick={initializeExam}
                                            disabled={!isEligible}
                                        >
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            Start Exam
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )
                    }
                    {
                        examState === "in-progress" && currentQuestion && (
                            <motion.div
                                key={`question-${currentQuestionIndex}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-4xl mx-auto"
                            >
                                <div className="mb-6">
                                    <Progress value={progress} className="h-2" />
                                    <p className="text-sm text-muted-foreground mt-2 text-center">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </p>
                                </div>
                                <Card className="border-2">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className="capitalize">
                                                {currentQuestion.type === "quiz" && <Brain className="h-3 w-3 mr-1" />}
                                                {currentQuestion.type === "code" && <Terminal className="h-3 w-3 mr-1" />}
                                                {currentQuestion.type === "scenario" && <Lightbulb className="h-3 w-3 mr-1" />}
                                                {currentQuestion.type}
                                            </Badge>
                                            <Badge
                                                variant={
                                                    currentQuestion.difficulty === "easy" ? "secondary" :
                                                        currentQuestion.difficulty === "medium" ? "default" : "destructive"
                                                }
                                            >
                                                {currentQuestion.difficulty}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {
                                            currentQuestion.type === "quiz" && (
                                                <div className="space-y-6">
                                                    <h2 className="text-xl font-medium">{currentQuestion.question}</h2>

                                                    <RadioGroup
                                                        value={answers[currentQuestion.id]?.toString()}
                                                        onValueChange={(v) => handleAnswer(currentQuestion.id, parseInt(v))}
                                                        className="space-y-3"
                                                    >
                                                        {
                                                            currentQuestion.options.map((option, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={cn(
                                                                        "flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer",
                                                                        answers[currentQuestion.id] === idx
                                                                            ? "border-primary bg-primary/5"
                                                                            : "border-muted hover:border-muted-foreground/50"
                                                                    )}
                                                                    onClick={() => handleAnswer(currentQuestion.id, idx)}
                                                                >
                                                                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                                                                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer text-base">
                                                                        {option}
                                                                    </Label>
                                                                </div>
                                                            ))
                                                        }
                                                    </RadioGroup>
                                                </div>
                                            )
                                        }
                                        {
                                            currentQuestion.type === "code" && (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-xl font-medium mb-2">{currentQuestion.title}</h2>
                                                        <p className="text-muted-foreground">{currentQuestion.description}</p>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-muted/50 border">
                                                        <p className="text-sm font-medium mb-1">Scenario:</p>
                                                        <p className="text-muted-foreground">{currentQuestion.scenario}</p>
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="code-answer" className="text-base mb-2 block">
                                                            Your Command(s):
                                                        </Label>
                                                        <Textarea
                                                            id="code-answer"
                                                            value={(answers[currentQuestion.id] as string) || ""}
                                                            onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                                                            placeholder="Enter your Git command(s) here..."
                                                            className="font-mono text-base min-h-[120px] bg-black text-green-400"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowHint(prev => ({
                                                                ...prev,
                                                                [currentQuestion.id]: !prev[currentQuestion.id]
                                                            }))}
                                                        >
                                                            <Lightbulb className="h-4 w-4 mr-2" />
                                                            {showHint[currentQuestion.id] ? "Hide Hints" : "Show Hints"}
                                                        </Button>
                                                        <AnimatePresence>
                                                            {
                                                                showHint[currentQuestion.id] && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: "auto" }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="mt-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                                                                    >
                                                                        <ul className="text-sm space-y-1">
                                                                            {
                                                                                currentQuestion.hints.map((hint, idx) => (
                                                                                    <li key={idx} className="flex items-start gap-2">
                                                                                        <span className="text-yellow-500">💡</span>
                                                                                        {hint}
                                                                                    </li>
                                                                                ))
                                                                            }
                                                                        </ul>
                                                                    </motion.div>
                                                                )
                                                            }
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            )
                                        }
                                        {
                                            currentQuestion.type === "scenario" && (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-xl font-medium mb-2">{currentQuestion.title}</h2>
                                                    </div>
                                                    <div className="p-4 rounded-lg bg-muted/50 border">
                                                        <p className="text-muted-foreground">{currentQuestion.scenario}</p>
                                                    </div>
                                                    <p className="font-medium">{currentQuestion.question}</p>
                                                    <RadioGroup
                                                        value={answers[currentQuestion.id]?.toString()}
                                                        onValueChange={(v) => handleAnswer(currentQuestion.id, parseInt(v))}
                                                        className="space-y-3"
                                                    >
                                                        {
                                                            currentQuestion.options.map((option, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={cn(
                                                                        "flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer",
                                                                        answers[currentQuestion.id] === idx
                                                                            ? "border-primary bg-primary/5"
                                                                            : "border-muted hover:border-muted-foreground/50"
                                                                    )}
                                                                    onClick={() => handleAnswer(currentQuestion.id, idx)}
                                                                >
                                                                    <RadioGroupItem value={idx.toString()} id={`scenario-${idx}`} />
                                                                    <Label htmlFor={`scenario-${idx}`} className="flex-1 cursor-pointer text-base">
                                                                        {option}
                                                                    </Label>
                                                                </div>
                                                            ))
                                                        }
                                                    </RadioGroup>
                                                </div>
                                            )
                                        }
                                    </CardContent>
                                    <CardFooter className="flex justify-between pt-6">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                            disabled={currentQuestionIndex === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-2" />
                                            Previous
                                        </Button>

                                        {
                                            currentQuestionIndex < questions.length - 1 ? (
                                                <Button
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
                                                    {
                                                        isSubmitting ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                Submit Exam
                                                            </>
                                                        )
                                                    }
                                                </Button>
                                            )
                                        }
                                    </CardFooter>
                                </Card>
                                <div className="mt-6 p-4 rounded-lg bg-muted/30 border">
                                    <p className="text-sm font-medium mb-3">Question Navigation</p>
                                    <div className="flex flex-wrap gap-2">
                                        {
                                            questions.map((q, idx) => (
                                                <Button
                                                    key={q.id}
                                                    variant={
                                                        idx === currentQuestionIndex ? "default" :
                                                            answers[q.id] !== undefined ? "secondary" : "outline"
                                                    }
                                                    size="sm"
                                                    className="w-10 h-10"
                                                    onClick={() => setCurrentQuestionIndex(idx)}
                                                >
                                                    {idx + 1}
                                                </Button>
                                            ))
                                        }
                                    </div>
                                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-primary" /> Current
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded bg-secondary" /> Answered
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-3 h-3 rounded border" /> Not Answered
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                    {
                        examState === "completed" && examResult && (
                            <motion.div
                                key="completed"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-4xl mx-auto"
                            >
                                <Card className={cn(
                                    "border-2",
                                    examResult.passed ? "border-green-500/50" : "border-red-500/50"
                                )}>
                                    <CardHeader className="text-center pb-2">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", delay: 0.2 }}
                                            className={cn(
                                                "mx-auto mb-4 p-6 rounded-full w-fit",
                                                examResult.passed ? "bg-green-500/10" : "bg-red-500/10"
                                            )}
                                        >
                                            {
                                                examResult.passed ? (
                                                    <Trophy className="h-16 w-16 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-16 w-16 text-red-500" />
                                                )
                                            }
                                        </motion.div>
                                        <CardTitle className="text-3xl">
                                            {examResult.passed ? "🎉 Congratulations!" : "Keep Learning!"}
                                        </CardTitle>
                                        <CardDescription className="text-lg mt-2">
                                            {examResult.passed
                                                ? "You've earned your Open Source Contribution Certificate!"
                                                : "You didn't pass this time, but don't give up!"}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="text-center">
                                            <div className={cn(
                                                "text-7xl font-bold mb-2",
                                                examResult.passed ? "text-green-500" : "text-red-500"
                                            )}>
                                                {examResult.score}%
                                            </div>
                                            <p className="text-muted-foreground">
                                                {examResult.correctAnswers} out of {examResult.totalQuestions} correct
                                            </p>
                                            <Progress
                                                value={examResult.score}
                                                className={cn(
                                                    "h-3 mt-4 max-w-md mx-auto",
                                                    examResult.passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"
                                                )}
                                            />
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Passing score: {EXAM_CONFIG.passingScore}%
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Question Breakdown</h3>
                                            <div className="space-y-3">
                                                {
                                                    questions.map((q, idx) => (
                                                        <div
                                                            key={q.id}
                                                            className={cn(
                                                                "p-4 rounded-lg border",
                                                                examResult?.feedback[q.id].correct
                                                                    ? "bg-green-500/5 border-green-500/30"
                                                                    : "bg-red-500/5 border-red-500/30"
                                                            )}
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Badge variant="outline" className="capitalize text-xs">
                                                                            {q.type}
                                                                        </Badge>
                                                                        <span className="text-sm font-medium">
                                                                            Question {idx + 1}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            q.type === "quiz" || q.type === "scenario"
                                                                                ? (q as QuizQuestion | ScenarioQuestion).question.slice(0, 100) + "..."
                                                                                : (q as CodeQuestion).title
                                                                        }
                                                                    </p>
                                                                    {
                                                                        !examResult.feedback[q.id].correct && (
                                                                            <p className="text-xs mt-2 text-muted-foreground">
                                                                                💡 {examResult.feedback[q.id].explanation}
                                                                            </p>
                                                                        )
                                                                    }
                                                                </div>
                                                                <div>
                                                                    {
                                                                        examResult.feedback[q.id].correct ? (
                                                                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                                        ) : (
                                                                            <XCircle className="h-6 w-6 text-red-500" />
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        {
                                            examResult.passed ? (
                                                <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/30 text-center">
                                                    <Award className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                                    <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">
                                                        Certificate Earned!
                                                    </h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        You're now certified to contribute to open source projects on our platform.
                                                    </p>
                                                    <div className="flex gap-4 justify-center">
                                                        <Button onClick={() => router.push("/opensource")}>
                                                            <GitPullRequest className="mr-2 h-4 w-4" />
                                                            Start Contributing
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-6 rounded-lg bg-muted/30 border text-center">
                                                    <RotateCcw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <h3 className="text-xl font-semibold mb-2">Don't Give Up!</h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Review the learning modules and try again in 24 hours.
                                                        Practice makes perfect!
                                                    </p>
                                                    <div className="flex gap-4 justify-center">
                                                        <Button variant="outline" onClick={() => router.push("/opensource/learn")}>
                                                            <BookOpen className="mr-2 h-4 w-4" />
                                                            Review Lessons
                                                        </Button>
                                                        <Button variant="outline" onClick={() => router.push("/opensource")}>
                                                            <Home className="mr-2 h-4 w-4" />
                                                            Back to Hub
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    }
                </AnimatePresence>
            </div>
        </div>
    );
}