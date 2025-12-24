"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2, Code2, Eye, BarChart3, HelpCircle, Zap, Lightbulb, Copy,
    Check, Play, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
    Collapsible, CollapsibleTrigger
} from "@repo/ui/components/ui/collapsible";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";
import { ConceptStepType } from "@prisma/client";
import {
    submitQuizAnswer, submitChallengeCode
} from "@/actions/(main)/concepts/concept.action";

interface CodeBlock {
    id: string;
    order: number;
    title?: string | null;
    language: string;
    code: string;
    explanation?: string | null;
    highlightLines: number[];
    showLineNumbers: boolean;
    isRunnable: boolean;
}

interface ConceptStep {
    id: string;
    order: number;
    title: string;
    type: ConceptStepType;
    content: string;
    language?: string | null;
    visualizationType?: string | null;
    visualizationData?: any;
    comparisonItems?: any;
    quizQuestion?: string | null;
    quizOptions?: any;
    quizExplanation?: string | null;
    challengeDescription?: string | null;
    challengeStarterCode?: string | null;
    challengeSolution?: string | null;
    challengeHints?: string[];
    challengeTestCases?: any;
    tips?: string[];
    codeBlocks: CodeBlock[];
}

interface StepCardProps {
    step: ConceptStep;
    stepNumber: number;
    totalSteps: number;
    isCompleted: boolean;
    onComplete: () => void;
    conceptId: string;
    isLoggedIn: boolean;
}

const stepTypeConfig: Record<
    ConceptStepType,
    { icon: LucideIcon; label: string; color: string }
> = {
    EXPLANATION: { icon: Eye, label: "Explanation", color: "text-blue-600" },
    CODE: { icon: Code2, label: "Code", color: "text-green-600" },
    VISUALIZATION: { icon: BarChart3, label: "Visualization", color: "text-purple-600" },
    COMPARISON: { icon: BarChart3, label: "Comparison", color: "text-orange-600" },
    QUIZ: { icon: HelpCircle, label: "Quiz", color: "text-pink-600" },
    CHALLENGE: { icon: Zap, label: "Challenge", color: "text-yellow-600" },
    INTERACTIVE: { icon: Play, label: "Interactive", color: "text-cyan-600" },
    SUMMARY: { icon: CheckCircle2, label: "Summary", color: "text-teal-600" },
};

export default function StepCard({
    step,
    stepNumber,
    totalSteps,
    isCompleted,
    onComplete,
    conceptId,
    isLoggedIn,
}: StepCardProps) {
    const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizCorrect, setQuizCorrect] = useState(false);
    const [challengeCode, setChallengeCode] = useState(step.challengeStarterCode || "");
    const [showSolution, setShowSolution] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const TypeIcon = stepTypeConfig[step.type].icon;

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleQuizSubmit = async () => {
        if (selectedQuizOption === null) return;

        const options = step.quizOptions as { id: number; text: string; isCorrect: boolean }[];
        const isCorrect = options[selectedQuizOption]?.isCorrect || false;

        setQuizSubmitted(true);
        setQuizCorrect(isCorrect);

        if (isLoggedIn) {
            await submitQuizAnswer(conceptId, step.id, selectedQuizOption, isCorrect);
        }

        if (isCorrect) {
            toast.success("Correct! 🎉");
            onComplete();
        } else {
            toast.error("Not quite right. Try again!");
        }
    };

    const handleChallengeSubmit = async () => {
        // Simplified challenge check - in production, you'd run actual tests
        const passed = challengeCode.trim().length > 10;

        if (isLoggedIn) {
            await submitChallengeCode(conceptId, step.id, challengeCode, passed);
        }

        if (passed) {
            toast.success("Challenge completed! 🎉");
            onComplete();
        } else {
            toast.error("Keep trying! Check the hints.");
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg bg-white dark:bg-neutral-800 ${stepTypeConfig[step.type].color}`}
                        >
                            <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <Badge variant="outline" className="mb-1">
                                {stepTypeConfig[step.type].label}
                            </Badge>
                            <CardTitle className="text-lg">{step.title}</CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {stepNumber} / {totalSteps}
                        </span>
                        {
                            isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )
                        }
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: step.content }} />
                </div>
                {
                    step.codeBlocks.length > 0 && (
                        <div className="space-y-4">
                            {
                                step.codeBlocks.map((block) => (
                                    <div
                                        key={block.id}
                                        className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800"
                                    >
                                        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 dark:bg-neutral-950">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-neutral-400">
                                                    {block.title || block.language}
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {block.language}
                                                </Badge>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-neutral-400 hover:text-white"
                                                onClick={() => copyCode(block.code, block.id)}
                                            >
                                                {
                                                    copiedId === block.id ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )
                                                }
                                            </Button>
                                        </div>
                                        <pre className="p-4 overflow-x-auto bg-neutral-900 dark:bg-neutral-950 text-neutral-100 text-sm">
                                            <code>{block.code}</code>
                                        </pre>
                                        {
                                            block.explanation && (
                                                <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800/50 text-sm text-muted-foreground border-t border-neutral-200 dark:border-neutral-800">
                                                    {block.explanation}
                                                </div>
                                            )
                                        }
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
                {
                    step.type === "QUIZ" && step.quizQuestion && (
                        <div className="space-y-4 p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-pink-600" />
                                {step.quizQuestion}
                            </h4>
                            <RadioGroup
                                value={selectedQuizOption?.toString()}
                                onValueChange={(val) => setSelectedQuizOption(parseInt(val))}
                                disabled={quizSubmitted && quizCorrect}
                            >
                                {
                                    (step.quizOptions as any[])?.map((option: any, index: number) => (
                                        <div
                                            key={option.id || index}
                                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${quizSubmitted
                                                    ? option.isCorrect
                                                        ? "bg-green-100 dark:bg-green-900/30 border-green-300"
                                                        : selectedQuizOption === index
                                                            ? "bg-red-100 dark:bg-red-900/30 border-red-300"
                                                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                                                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-pink-300"
                                                }`}
                                        >
                                            <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                                {option.text}
                                            </Label>
                                            {
                                                quizSubmitted && option.isCorrect && (
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                )
                                            }
                                        </div>
                                    ))
                                }
                            </RadioGroup>
                            {
                                !quizSubmitted || !quizCorrect ? (
                                    <Button
                                        onClick={handleQuizSubmit}
                                        disabled={selectedQuizOption === null}
                                        className="w-full"
                                    >
                                        Submit Answer
                                    </Button>
                                ) : null
                            }
                            {
                                quizSubmitted && step.quizExplanation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm"
                                    >
                                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                                            Explanation:
                                        </p>
                                        <p className="text-blue-600 dark:text-blue-300">
                                            {step.quizExplanation}
                                        </p>
                                    </motion.div>
                                )
                            }
                        </div>
                    )
                }
                {
                    step.type === "CHALLENGE" && (
                        <div className="space-y-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-600" />
                                Challenge
                            </h4>

                            {
                                step.challengeDescription && (
                                    <p className="text-sm text-muted-foreground">
                                        {step.challengeDescription}
                                    </p>
                                )
                            }

                            <Textarea
                                value={challengeCode}
                                onChange={(e) => setChallengeCode(e.target.value)}
                                placeholder="Write your code here..."
                                className="font-mono min-h-[200px]"
                            />

                            <div className="flex items-center gap-2">
                                <Button onClick={handleChallengeSubmit} className="flex-1">
                                    <Play className="w-4 h-4 mr-2" />
                                    Run Challenge
                                </Button>

                                {
                                    step.challengeHints && step.challengeHints.length > 0 && (
                                        <Collapsible open={showHints} onOpenChange={setShowHints}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline">
                                                    <Lightbulb className="w-4 h-4 mr-1" />
                                                    Hints
                                                    {
                                                        showHints ? (
                                                            <ChevronUp className="w-4 h-4 ml-1" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 ml-1" />
                                                        )
                                                    }
                                                </Button>
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    )
                                }

                                {
                                    step.challengeSolution && (
                                        <Collapsible open={showSolution} onOpenChange={setShowSolution}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline">
                                                    Solution
                                                    {
                                                        showSolution ? (
                                                            <ChevronUp className="w-4 h-4 ml-1" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 ml-1" />
                                                        )
                                                    }
                                                </Button>
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    )
                                }
                            </div>

                            {
                                showHints && step.challengeHints && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-2"
                                    >
                                        {
                                            step.challengeHints.map((hint, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-sm flex items-start gap-2"
                                                >
                                                    <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                    <span>{hint}</span>
                                                </div>
                                            ))
                                        }
                                    </motion.div>
                                )
                            }

                            {
                                showSolution && step.challengeSolution && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                                    >
                                        <div className="px-4 py-2 bg-neutral-900 text-neutral-400 text-xs">
                                            Solution
                                        </div>
                                        <pre className="p-4 overflow-x-auto bg-neutral-900 text-neutral-100 text-sm">
                                            <code>{step.challengeSolution}</code>
                                        </pre>
                                    </motion.div>
                                )
                            }
                        </div>
                    )
                }

                {
                    step.type === "COMPARISON" && step.comparisonItems && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {
                                (step.comparisonItems as any[]).map((item: any, index: number) => (
                                    <Card key={index}>
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">{item.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground">{item.content}</p>
                                            {
                                                item.pros && (
                                                    <div>
                                                        <p className="text-xs font-medium text-green-600 mb-1">Pros:</p>
                                                        <ul className="text-xs text-muted-foreground space-y-1">
                                                            {
                                                                item.pros.map((pro: string, i: number) => (
                                                                    <li key={i} className="flex items-start gap-1">
                                                                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" />
                                                                        {pro}
                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>
                                                    </div>
                                                )
                                            }
                                            {
                                                item.cons && (
                                                    <div>
                                                        <p className="text-xs font-medium text-red-600 mb-1">Cons:</p>
                                                        <ul className="text-xs text-muted-foreground space-y-1">
                                                            {
                                                                item.cons.map((con: string, i: number) => (
                                                                    <li key={i} className="flex items-start gap-1">
                                                                        <span className="text-red-500">•</span>
                                                                        {con}
                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>
                                                    </div>
                                                )
                                            }
                                        </CardContent>
                                    </Card>
                                ))
                            }
                        </div>
                    )
                }
                {
                    step.tips && step.tips.length > 0 && (
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Tips
                            </h4>
                            <ul className="space-y-2">
                                {
                                    step.tips.map((tip, index) => (
                                        <li key={index} className="text-sm text-blue-600 dark:text-blue-300 flex items-start gap-2">
                                            <span className="text-blue-400">•</span>
                                            {tip}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    )
                }
                {
                    !isCompleted && step.type !== "QUIZ" && step.type !== "CHALLENGE" && (
                        <Button onClick={onComplete} variant="outline" className="w-full">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Mark as Complete
                        </Button>
                    )
                }
            </CardContent>
        </Card>
    );
}