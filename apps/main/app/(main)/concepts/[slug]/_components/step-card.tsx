"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2, Code2, Eye, BarChart3, HelpCircle, Zap, Lightbulb,
    Copy, Check, Play, ChevronDown, ChevronUp, Video, Globe,
    ExternalLink, Loader2, Star, AlertCircle, Image as ImageIcon,
    Mic, FolderGit2, Plus
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import {
    RadioGroup, RadioGroupItem
} from "@repo/ui/components/ui/radio-group";
import { Label } from "@repo/ui/components/ui/label";
import {
    Collapsible, CollapsibleTrigger
} from "@repo/ui/components/ui/collapsible";
import { Progress } from "@repo/ui/components/ui/progress";
import toast from "@repo/ui/components/ui/sonner";
import { LucideIcon } from "lucide-react";
import { ConceptStepType } from "@repo/prisma/client";
import {
    submitQuizAnswer, submitChallengeCode
} from "@/actions/(main)/concepts/concept.action";
import { evaluateChallengeCode } from "@/actions/(main)/concepts/concept-ai.action";
import CodeEditor from "@/components/main/code-editor";
import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import Image from "next/image";
import { AddProjectSheet } from "@/components/profile/sheets/add-project-sheet";
import ProjectGenerateSheet from "@/components/projects/project-generate-sheet";
import { CreateMockSheet } from "@/app/(main)/mock/_components/create-mock-sheet";

// ==================== INTERFACES ====================

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
    stepData?: unknown;
    tips?: unknown;
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
    /** All steps for generating knowledge base for mock interviews */
    allSteps?: ConceptStep[];
    /** Concept title for mock interview context */
    conceptTitle?: string;
    /** User credits for mock interview */
    userCredits?: number;
}

const stepTypeConfig: Record<ConceptStepType, { icon: LucideIcon; label: string; color: string }> = {
    EXPLANATION: { icon: Eye, label: "Explanation", color: "text-blue-600" },
    CODE: { icon: Code2, label: "Code", color: "text-green-600" },
    VISUALIZATION: { icon: BarChart3, label: "Visualization", color: "text-purple-600" },
    COMPARISON: { icon: BarChart3, label: "Comparison", color: "text-orange-600" },
    QUIZ: { icon: HelpCircle, label: "Quiz", color: "text-pink-600" },
    CHALLENGE: { icon: Zap, label: "Challenge", color: "text-yellow-600" },
    INTERACTIVE: { icon: Play, label: "Interactive", color: "text-cyan-600" },
    SUMMARY: { icon: CheckCircle2, label: "Summary", color: "text-teal-600" },
    RESOURCE: { icon: Video, label: "Resources", color: "text-purple-600" },
    VISUAL: { icon: ImageIcon, label: "Visual", color: "text-cyan-600" },
    MOCK_INTERVIEW: { icon: Mic, label: "Mock Interview", color: "text-red-600" },
    PROJECT: { icon: FolderGit2, label: "Project", color: "text-indigo-600" },
};

// ==================== HELPERS ====================

function getStepData(step: ConceptStep) {
    if (!step.stepData) return {};
    if (typeof step.stepData === "string") {
        try { return JSON.parse(step.stepData); } catch { return {}; }
    }
    return step.stepData as Record<string, unknown>;
}

// ==================== COMPONENT ====================

export default function StepCard({ 
    step, 
    stepNumber, 
    totalSteps, 
    isCompleted, 
    onComplete, 
    conceptId, 
    isLoggedIn,
    allSteps = [],
    conceptTitle = "",
    userCredits = 0
}: StepCardProps) {
    const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizCorrect, setQuizCorrect] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [showHints, setShowHints] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Challenge evaluation state
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<{
        score: number;
        feedback: string;
        isCorrect: boolean;
        suggestions?: string[];
    } | null>(null);

    // Project step state
    const [addProjectOpen, setAddProjectOpen] = useState(false);
    const [generateProjectOpen, setGenerateProjectOpen] = useState(false);

    // Mock interview step state
    const [createMockOpen, setCreateMockOpen] = useState(false);

    const data = getStepData(step);
    const TypeIcon = stepTypeConfig[step.type]?.icon || Eye;

    // Generate knowledge base for mock interview from all concept steps
    const generateMockKnowledgeBase = () => {
        if (!allSteps.length) return "";
        
        let knowledgeBase = `# Learning Content from: ${conceptTitle}\n\n`;
        knowledgeBase += `This mock interview is based on the following learning content:\n\n`;
        
        allSteps.forEach((s, index) => {
            const stepData = getStepData(s);
            knowledgeBase += `## Step ${index + 1}: ${s.title} (${s.type})\n`;
            knowledgeBase += `${s.content}\n\n`;
            
            // Include code blocks
            if (s.codeBlocks && s.codeBlocks.length > 0) {
                s.codeBlocks.forEach((block) => {
                    knowledgeBase += `### Code Example (${block.language}):\n`;
                    knowledgeBase += `\`\`\`${block.language}\n${block.code}\n\`\`\`\n`;
                    if (block.explanation) {
                        knowledgeBase += `Explanation: ${block.explanation}\n\n`;
                    }
                });
            }
            
            // Include quiz questions
            if (s.type === "QUIZ" && stepData.options) {
                knowledgeBase += `### Quiz Question:\n`;
                const options = stepData.options as { text: string; isCorrect: boolean }[];
                options.forEach((opt, i) => {
                    knowledgeBase += `${i + 1}. ${opt.text}${opt.isCorrect ? ' (Correct)' : ''}\n`;
                });
                knowledgeBase += '\n';
            }
            
            // Include challenge details
            if (s.type === "CHALLENGE" && stepData.solution) {
                knowledgeBase += `### Challenge Solution:\n`;
                knowledgeBase += `\`\`\`${stepData.language || 'javascript'}\n${stepData.solution}\n\`\`\`\n\n`;
            }
            
            knowledgeBase += '---\n\n';
        });
        
        knowledgeBase += `\n## Interview Guidelines:\n`;
        knowledgeBase += `- Ask questions based on the above learning content\n`;
        knowledgeBase += `- Test understanding of key concepts covered in each step\n`;
        knowledgeBase += `- Include both theoretical and practical questions\n`;
        knowledgeBase += `- Verify code understanding if code examples are present\n`;
        
        return knowledgeBase;
    };

    // Challenge code state – pull from stepData
    const [challengeCode, setChallengeCode] = useState(
        (data.starterCode as string) || ""
    );

    const copyCode = async (code: string, id: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Quiz
    const handleQuizSubmit = async () => {
        if (selectedQuizOption === null) return;
        const options = (data.options || []) as { id: string; text: string; isCorrect: boolean }[];
        const isCorrect = options[selectedQuizOption]?.isCorrect || false;
        setQuizSubmitted(true);
        setQuizCorrect(isCorrect);
        if (isLoggedIn) await submitQuizAnswer(conceptId, step.id, selectedQuizOption, isCorrect);
        if (isCorrect) { toast.success("Correct! 🎉"); onComplete(); }
        else { toast.error("Not quite right. Try again!"); }
    };

    // Challenge - AI Evaluation
    const handleChallengeSubmit = async () => {
        if (!challengeCode.trim() || challengeCode === data.starterCode) {
            toast.error("Please write some code first!");
            return;
        }

        setIsEvaluating(true);
        setEvaluationResult(null);

        try {
            // Call AI to evaluate the code
            const result = await evaluateChallengeCode(
                step.content || (data.description as string) || "",
                (data.starterCode as string) || "",
                (data.solution as string) || "",
                challengeCode,
                (data.language as string) || "javascript"
            );

            if (result.error) {
                toast.error(result.error);
                setIsEvaluating(false);
                return;
            }

            setEvaluationResult(result);

            // Save progress
            if (isLoggedIn) {
                await submitChallengeCode(conceptId, step.id, challengeCode, result.isCorrect);
            }

            if (result.isCorrect && result.score >= 70) {
                toast.success(`🎉 Great job! Score: ${result.score}/100`);
                onComplete();
            } else if (result.score >= 50) {
                toast.info(`Good attempt! Score: ${result.score}/100. Check the feedback below.`);
            } else {
                toast.error(`Score: ${result.score}/100. Keep trying! Check the hints.`);
            }
        } catch (error) {
            console.error("Challenge evaluation error:", error);
            toast.error("Failed to evaluate code");
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white dark:bg-neutral-800 ${stepTypeConfig[step.type]?.color}`}>
                            <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <Badge variant="outline" className="mb-1">{stepTypeConfig[step.type]?.label}</Badge>
                            <CardTitle className="text-lg">{step.title}</CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{stepNumber} / {totalSteps}</span>
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="w-full">
                    <MarkdownRenderer content={step.content} />
                </div>

                {
                    step.codeBlocks.length > 0 && (
                        <div className="space-y-4">
                            {
                                step.codeBlocks.map((block) => (
                                    <div key={block.id} className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 dark:bg-neutral-950">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-neutral-400">{block.title || block.language}</span>
                                                <Badge variant="secondary" className="text-xs">{block.language}</Badge>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 text-neutral-400 hover:text-white" onClick={() => copyCode(block.code, block.id)}>
                                                {copiedId === block.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                        <CodeEditor code={block.code} language={block.language} height="auto" readOnly showRunButton={block.isRunnable} showLanguageSelector={false} />
                                        {
                                            block.explanation && (
                                                <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800/50 text-sm text-muted-foreground border-t border-neutral-200 dark:border-neutral-800">
                                                    <MarkdownRenderer content={block.explanation} />
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
                    step.type === "QUIZ" && data.question && (
                        <div className="space-y-4 p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-pink-600" />
                                {data.question as string}
                            </h4>
                            <RadioGroup
                                value={selectedQuizOption?.toString()}
                                onValueChange={(val) => setSelectedQuizOption(parseInt(val))}
                                disabled={quizSubmitted && quizCorrect}
                            >
                                {
                                    ((data.options || []) as { id: string; text: string; isCorrect: boolean }[]).map((option, index) => (
                                        <div key={option.id || index}
                                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${quizSubmitted
                                                ? option.isCorrect ? "bg-green-100 dark:bg-green-900/30 border-green-300"
                                                    : selectedQuizOption === index ? "bg-red-100 dark:bg-red-900/30 border-red-300"
                                                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700"
                                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-pink-300"
                                                }`}
                                        >
                                            <RadioGroupItem value={index.toString()} id={`option-${step.id}-${index}`} />
                                            <Label htmlFor={`option-${step.id}-${index}`} className="flex-1 cursor-pointer">{option.text}</Label>
                                            {quizSubmitted && option.isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                        </div>
                                    ))
                                }
                            </RadioGroup>
                            {
                                (!quizSubmitted || !quizCorrect) && (
                                    <Button onClick={handleQuizSubmit} disabled={selectedQuizOption === null} className="w-full">Submit Answer</Button>
                                )
                            }
                            {
                                quizSubmitted && data.explanation && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                        className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-sm">
                                        <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">Explanation:</p>
                                        <MarkdownRenderer content={data.explanation as string} />
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
                                <Zap className="w-5 h-5 text-yellow-600" /> Challenge
                            </h4>

                            <CodeEditor
                                code={challengeCode}
                                language={(data.language as string) || "javascript"}
                                height="300px"
                                showRunButton
                                showLanguageSelector={false}
                                onChange={(code) => setChallengeCode(code)}
                            />

                            {
                                evaluationResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-lg border ${evaluationResult.isCorrect
                                            ? "bg-green-50 dark:bg-green-950/20 border-green-300"
                                            : evaluationResult.score >= 50
                                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300"
                                                : "bg-red-50 dark:bg-red-950/20 border-red-300"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {
                                                    evaluationResult.isCorrect ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    ) : evaluationResult.score >= 50 ? (
                                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                                    )
                                                }
                                                <span className="font-semibold">
                                                    {evaluationResult.isCorrect ? "Correct!" : "Feedback"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span className="font-bold text-lg">{evaluationResult.score}/100</span>
                                            </div>
                                        </div>
                                        <Progress value={evaluationResult.score} className="h-2 mb-3" />
                                        <div className="text-sm">
                                            <MarkdownRenderer content={evaluationResult.feedback} />
                                        </div>
                                        {
                                            evaluationResult.suggestions && evaluationResult.suggestions.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-2">Suggestions:</p>
                                                    <ul className="space-y-1">
                                                        {
                                                            evaluationResult.suggestions.map((s, i) => (
                                                                <li key={i} className="text-xs flex items-start gap-1">
                                                                    <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                                    {s}
                                                                </li>
                                                            ))
                                                        }
                                                    </ul>
                                                </div>
                                            )
                                        }
                                    </motion.div>
                                )
                            }

                            <div className="flex items-center gap-2">
                                <Button onClick={handleChallengeSubmit} className="flex-1" disabled={isEvaluating}>
                                    {
                                        isEvaluating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" /> Run & Evaluate
                                            </>
                                        )
                                    }
                                </Button>
                                {
                                    Array.isArray(data.hints) && (data.hints as string[]).length > 0 && (
                                        <Collapsible open={showHints} onOpenChange={setShowHints}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline">
                                                    <Lightbulb className="w-4 h-4 mr-1" /> Hints
                                                    {showHints ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    )
                                }
                                {
                                    data.solution && (
                                        <Collapsible open={showSolution} onOpenChange={setShowSolution}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline">
                                                    Solution {showSolution ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    )
                                }
                            </div>
                            {
                                showHints && Array.isArray(data.hints) && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                        {
                                            (data.hints as string[]).map((hint, i) => (
                                                <div key={i} className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-sm flex items-start gap-2">
                                                    <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                    <span>{hint}</span>
                                                </div>
                                            ))
                                        }
                                    </motion.div>
                                )
                            }
                            {
                                showSolution && data.solution && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <CodeEditor
                                            code={data.solution as string}
                                            language={(data.language as string) || "javascript"}
                                            height="200px"
                                            readOnly
                                            showRunButton={false}
                                            showLanguageSelector={false}
                                        />
                                    </motion.div>
                                )
                            }
                        </div>
                    )
                }
                {
                    step.type === "COMPARISON" && Array.isArray(data.items) && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {
                                    (data.items as { title: string; description: string; pros?: string[]; cons?: string[]; useCase?: string }[]).map((item, i) => (
                                        <Card key={i}>
                                            <CardHeader className="pb-3"><CardTitle className="text-base">{item.title}</CardTitle></CardHeader>
                                            <CardContent className="space-y-3">
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                                {
                                                    item.pros && (
                                                        <div>
                                                            <p className="text-xs font-medium text-green-600 mb-1">Pros:</p>
                                                            <ul className="text-xs text-muted-foreground space-y-1">
                                                                {
                                                                    item.pros.map((pro, j) => (
                                                                        <li key={j} className="flex items-start gap-1">
                                                                            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" /> {pro}
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
                                                                    item.cons.map((con, j) => (
                                                                        <li key={j} className="flex items-start gap-1"><span className="text-red-500">•</span> {con}</li>
                                                                    ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    item.useCase && (
                                                        <p className="text-xs italic text-muted-foreground">Best for: {item.useCase}</p>
                                                    )
                                                }
                                            </CardContent>
                                        </Card>
                                    ))
                                }
                            </div>
                            {
                                data.conclusion && (
                                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-sm">
                                        <MarkdownRenderer content={data.conclusion as string} />
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    step.type === "RESOURCE" && (
                        <div className="space-y-6">
                            {
                                Array.isArray(data.videos) && (data.videos as { url: string; title?: string; duration?: string; description?: string }[]).length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center gap-2"><Video className="w-4 h-4 text-red-500" /> Video Resources</h4>
                                        <div className="space-y-4">
                                            {
                                                (data.videos as { url: string; title?: string; duration?: string; description?: string }[]).map((v, i) => {
                                                    const youtubeMatch = v.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                                                    const videoId = youtubeMatch?.[1];

                                                    return (
                                                        <div key={i} className="rounded-lg border overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                                                            {
                                                                videoId ? (
                                                                    <>
                                                                        <div className="aspect-video w-full">
                                                                            <iframe
                                                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                                                title={v.title || "Video"}
                                                                                className="w-full h-full"
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                                allowFullScreen
                                                                            />
                                                                        </div>
                                                                        <div className="p-3 border-t">
                                                                            <div className="flex items-center justify-between">
                                                                                <div>
                                                                                    <p className="font-medium text-sm">{v.title || "Watch Video"}</p>
                                                                                    {v.duration && <p className="text-xs text-muted-foreground">{v.duration}</p>}
                                                                                    {v.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.description}</p>}
                                                                                </div>
                                                                                <a
                                                                                    href={v.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                                                                                >
                                                                                    <ExternalLink className="w-3 h-3" />
                                                                                    Open on YouTube
                                                                                </a>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <a href={v.url} target="_blank" rel="noopener noreferrer"
                                                                        className="flex items-start gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors group">
                                                                        <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                                                            <Play className="w-5 h-5 text-red-600" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate group-hover:text-red-600">{v.title || "Watch Video"}</p>
                                                                            {v.duration && <p className="text-xs text-muted-foreground">{v.duration}</p>}
                                                                            {v.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.description}</p>}
                                                                        </div>
                                                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-red-600 flex-shrink-0" />
                                                                    </a>
                                                                )
                                                            }
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                )
                            }
                            {
                                Array.isArray(data.docs) && (data.docs as { url: string; title?: string; type?: string; description?: string }[]).length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /> Documentation</h4>
                                        <div className="space-y-2">
                                            {
                                                (data.docs as { url: string; title?: string; type?: string; description?: string }[]).map((d, i) => (
                                                    <a key={i} href={d.url} target="_blank" rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-950/10 transition-colors group">
                                                        <Globe className="w-5 h-5 text-blue-500" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate group-hover:text-blue-600">{d.title || d.url}</p>
                                                            {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                                                        </div>
                                                        {d.type && <Badge variant="outline" className="text-xs">{d.type}</Badge>}
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                    </a>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    step.type === "VISUAL" && (
                        <div className="space-y-4">
                            {
                                Array.isArray(data.images) && (data.images as { url: string; caption?: string; alt?: string }[]).length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {
                                            (data.images as { url: string; caption?: string; alt?: string }[]).map((img, i) => (
                                                <div key={i} className="rounded-lg overflow-hidden border bg-neutral-50 dark:bg-neutral-900">
                                                    <Image
                                                        src={img.url}
                                                        alt={img.alt || ""}
                                                        className="w-full h-auto object-cover"
                                                        fill
                                                    />
                                                    {
                                                        img.caption && (
                                                            <p className="p-3 text-sm text-muted-foreground text-center">{img.caption}</p>
                                                        )
                                                    }
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    step.type === "MOCK_INTERVIEW" && (
                        <div className="space-y-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <Mic className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-700 dark:text-red-400">Mock Interview Practice</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {data.interviewType ? `${(data.interviewType as string).charAt(0).toUpperCase() + (data.interviewType as string).slice(1)} Interview` : "Interview"}
                                        {data.duration ? ` • ${data.duration} minutes` : ""}
                                    </p>
                                </div>
                            </div>
                            {
                                Array.isArray(data.topics) && (data.topics as string[]).length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Topics Covered:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {
                                                (data.topics as string[]).map((topic, i) => (
                                                    <Badge key={i} variant="secondary">{topic}</Badge>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            }
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                                <Mic className="w-4 h-4 mr-2" /> Start Mock Interview
                            </Button>
                        </div>
                    )
                }
                {
                    step.type === "PROJECT" && (
                        <div className="space-y-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <FolderGit2 className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">
                                            {data.projectType === "major" ? "Major Project" : "Mini Project"}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {data.estimatedHours ? `~${data.estimatedHours} hours` : ""}
                                            {data.difficulty ? ` • ${data.difficulty}` : ""}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={data.projectType === "major" ? "default" : "secondary"}>
                                    {data.projectType === "major" ? "Portfolio Worthy" : "Practice"}
                                </Badge>
                            </div>
                            {
                                Array.isArray(data.technologies) && (data.technologies as string[]).length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Technologies:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {
                                                (data.technologies as string[]).map((tech, i) => (
                                                    <Badge key={i} variant="outline">{tech}</Badge>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            }
                            {
                                Array.isArray(data.requirements) && (data.requirements as string[]).length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Requirements:</p>
                                        <ul className="space-y-1">
                                            {
                                                (data.requirements as string[]).map((req, i) => (
                                                    <li key={i} className="text-sm flex items-start gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                                                        {req}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                )
                            }

                            {
                                data.projectType === "major" ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Generate a full AI-guided project with tasks, concepts, and assessments.
                                        </p>
                                        <ProjectGenerateSheet
                                            trigger={
                                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    <FolderGit2 className="w-4 h-4 mr-2" /> Generate Major Project
                                                </Button>
                                            }
                                            defaultValues={{
                                                title: step.title,
                                                description: step.content,
                                                difficulty: data.difficulty as string,
                                            }}
                                            isOpen={generateProjectOpen}
                                            onOpenChange={setGenerateProjectOpen}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Add this mini project to your portfolio to track your progress.
                                        </p>
                                        <Button
                                            onClick={() => setAddProjectOpen(true)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-2" /> Add to Portfolio
                                        </Button>
                                        <AddProjectSheet
                                            open={addProjectOpen}
                                            onOpenChange={setAddProjectOpen}
                                            onSuccess={() => {
                                                toast.success("Project added to your portfolio!");
                                                onComplete();
                                            }}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    step.type === "MOCK_INTERVIEW" && (
                        <div className="space-y-4 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                        <Mic className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-rose-700 dark:text-rose-400">
                                            Mock Interview Practice
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {data.interviewType ? `${data.interviewType} Interview` : "Technical Interview"}
                                            {data.duration ? ` • ~${data.duration} mins` : ""}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-400">
                                    {data.difficulty || "Intermediate"}
                                </Badge>
                            </div>

                            {
                                data.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {data.description as string}
                                    </p>
                                )
                            }

                            {
                                Array.isArray(data.topics) && (data.topics as string[]).length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Topics Covered:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {
                                                (data.topics as string[]).map((topic, i) => (
                                                    <Badge key={i} variant="outline" className="border-rose-200 dark:border-rose-800">
                                                        {topic}
                                                    </Badge>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            }

                            {
                                Array.isArray(data.sampleQuestions) && (data.sampleQuestions as string[]).length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">Sample Questions:</p>
                                        <ul className="space-y-1">
                                            {
                                                (data.sampleQuestions as string[]).slice(0, 3).map((q, i) => (
                                                    <li key={i} className="text-sm flex items-start gap-2">
                                                        <HelpCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                                        {q}
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                )
                            }

                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    Practice your interview skills with our AI-powered mock interviewer based on what you&apos;ve learned.
                                </p>
                                <Button
                                    onClick={() => setCreateMockOpen(true)}
                                    className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                    <Mic className="w-4 h-4 mr-2" /> Create Mock Interview
                                </Button>
                                <CreateMockSheet
                                    open={createMockOpen}
                                    onOpenChange={setCreateMockOpen}
                                    userCredits={userCredits}
                                    saveOnly={true}
                                    conceptStepId={step.id}
                                    defaultValues={{
                                        title: `${conceptTitle} - Interview Practice`,
                                        description: step.content || (data.description as string) || `Mock interview based on ${conceptTitle}`,
                                        knowledgeBase: generateMockKnowledgeBase(),
                                        category: (data.interviewCategory as any) || "TECHNICAL",
                                        level: (data.difficulty as string) || "INTERMEDIATE"
                                    }}
                                    onSuccess={(_mockId) => {
                                        toast.success("Mock interview created and linked to this concept!");
                                        onComplete();
                                    }}
                                />
                            </div>
                        </div>
                    )
                }

                {
                    step.type === "VISUAL" && (
                        <div className="space-y-4 p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-cyan-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-400">Visual Learning</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {data.visualType ? `${data.visualType}` : "Diagram / Illustration"}
                                    </p>
                                </div>
                            </div>

                            {
                                data.imageUrl && (
                                    <div className="rounded-lg overflow-hidden border border-cyan-200 dark:border-cyan-800">
                                        <Image
                                            src={data.imageUrl as string}
                                            alt={step.title || "Visual content"}
                                            width={800}
                                            height={450}
                                            className="w-full h-auto object-contain bg-white dark:bg-neutral-900"
                                        />
                                    </div>
                                )
                            }
                            {
                                data.caption && (
                                    <p className="text-sm text-center text-muted-foreground italic">
                                        {data.caption as string}
                                    </p>
                                )
                            }
                            {
                                Array.isArray(data.annotations) && (data.annotations as { label: string; description: string }[]).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground">Key Points:</p>
                                        <div className="grid gap-2">
                                            {
                                                (data.annotations as { label: string; description: string }[]).map((ann, i) => (
                                                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-cyan-100/50 dark:bg-cyan-900/20">
                                                        <Badge variant="outline" className="shrink-0 border-cyan-300 text-cyan-700 dark:border-cyan-800 dark:text-cyan-400">
                                                            {ann.label}
                                                        </Badge>
                                                        <p className="text-sm">{ann.description}</p>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )
                            }

                            {
                                data.interactiveUrl && (
                                    <Button
                                        variant="outline"
                                        className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-800 dark:text-cyan-400"
                                        onClick={() => window.open(data.interactiveUrl as string, '_blank')}
                                    >
                                        <ExternalLink className="w-4 h-4 mr-2" /> Open Interactive Version
                                    </Button>
                                )
                            }
                        </div>
                    )
                }
                {
                    Array.isArray(step.tips) && (step.tips as string[]).length > 0 && (
                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                            <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Tips
                            </h4>
                            <ul className="space-y-2">
                                {
                                    (step.tips as string[]).map((tip, index) => (
                                        <li key={index} className="text-sm text-blue-600 dark:text-blue-300 flex items-start gap-2">
                                            <span className="text-blue-400 mt-1">•</span>
                                            <MarkdownRenderer content={tip} />
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
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
                        </Button>
                    )
                }
            </CardContent>
        </Card>
    );
}