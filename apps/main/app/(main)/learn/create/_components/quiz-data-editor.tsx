
import { useState } from "react";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { Card } from "@repo/ui/components/ui/card";
import {
    HelpCircle, Loader2, Sparkles, Trash2, ChevronDown, CheckCircle2
} from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { StepBlock } from "./types";
import { generateQuizQuestions } from "@/actions/(main)/learn/learn-ai.action";
import type { GeneratedQuiz } from "@/actions/(main)/learn/learn-ai.action";

export function QuizDataEditor({ block, updateBlock, LearnTitle, LearnDescription }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void; LearnTitle: string; LearnDescription: string }) {
    const data = (block.stepData || {}) as {
        questions?: GeneratedQuiz[];
        questionCount?: number;
        // Legacy single question support
        question?: string;
        options?: { id: string; text: string; isCorrect: boolean }[];
        explanation?: string;
    };

    const update = (field: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...block.stepData, [field]: value } });
    };

    const [generating, setGenerating] = useState(false);
    const [questionCount, setQuestionCount] = useState(data.questionCount || 3);
    const [expandedQ, setExpandedQ] = useState<number | null>(null);

    // Merge legacy single question into questions array
    const questions: GeneratedQuiz[] = (() => {
        const qs = data.questions || [];
        if (data.question && qs.length === 0) {
            return [{ question: data.question, options: data.options || [], explanation: data.explanation || "" }];
        }
        return qs;
    })();

    const handleGenerateQuestions = async () => {
        if (!LearnTitle && !block.title) {
            toast.error("Please add a Learn title and step title first");
            return;
        }
        setGenerating(true);
        try {
            const result = await generateQuizQuestions(
                LearnTitle || block.title,
                LearnDescription || "",
                block.title || "Quiz Step",
                block.content || "",
                questionCount
            );

            // Check if result.questions exists and is an array (even if empty) to valid response
            if (result.error) {
                toast.error(result.error);
            } else if (result.questions) {
                const newQuestions = result.questions;
                if (!Array.isArray(newQuestions)) {
                    throw new Error("Invalid response format from AI");
                }

                // APPEND to existing questions, don't replace
                const merged = [...questions, ...newQuestions];
                update("questions", merged);
                update("questionCount", questionCount);
                // Clear legacy fields
                update("question", undefined);
                update("options", undefined);
                update("explanation", undefined);
                toast.success(`Generated ${newQuestions.length} questions! Total: ${merged.length}`);
            } else {
                toast.error("No questions were generated");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate quiz questions");
        } finally {
            setGenerating(false);
        }
    };

    const removeQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        update("questions", updated);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900">
                <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold text-pink-700 dark:text-pink-400">Quiz Configuration</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Generate quiz questions with AI. New questions are appended to existing ones.
                </p>
            </div>

            {/* Generation Controls */}
            <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                    <Label className="text-xs font-medium">Number of Questions</Label>
                    <Select value={String(questionCount)} onValueChange={v => setQuestionCount(parseInt(v))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                                <SelectItem key={n} value={String(n)}>{n} Question{n > 1 ? "s" : ""}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 pt-5">
                    <Button
                        onClick={handleGenerateQuestions}
                        disabled={generating}
                        size="sm"
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white h-9"
                    >
                        {generating ? (
                            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate {questionCount} Question{questionCount > 1 ? "s" : ""}</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Generated Questions */}
            {questions.length > 0 ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider">
                            Questions ({questions.length})
                        </Label>
                    </div>
                    {questions.map((q, i) => (
                        <Card key={i} className="overflow-hidden border-pink-100 dark:border-pink-900/50">
                            <div
                                className="p-3 cursor-pointer hover:bg-pink-50/50 dark:hover:bg-pink-950/20 transition-colors"
                                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-xs font-bold text-pink-600 shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {q.options.length} options • {q.options.find(o => o.isCorrect)?.text ? "Answer set" : "No answer"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <ChevronDown className={cn(
                                            "w-4 h-4 text-muted-foreground transition-transform",
                                            expandedQ === i && "rotate-180"
                                        )} />
                                    </div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {expandedQ === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t px-4 py-3 space-y-3 bg-pink-50/30 dark:bg-pink-950/10">
                                            <div className="space-y-1.5">
                                                {q.options.map((opt, j) => (
                                                    <div key={opt.id || j} className={cn(
                                                        "flex items-center gap-2 p-2 rounded-lg text-xs",
                                                        opt.isCorrect
                                                            ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800"
                                                            : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                                    )}>
                                                        {opt.isCorrect ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                                        ) : (
                                                            <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 shrink-0" />
                                                        )}
                                                        <span className={opt.isCorrect ? "font-medium text-green-700 dark:text-green-400" : ""}>{opt.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {q.explanation && (
                                                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                                                    <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">Explanation</p>
                                                    <div className="text-xs text-muted-foreground">
                                                        <MarkdownRenderer content={q.explanation} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 border-2 border-dashed border-pink-200 dark:border-pink-900 rounded-2xl bg-pink-50/30 dark:bg-pink-950/10">
                    <HelpCircle className="w-8 h-8 mx-auto mb-3 text-pink-400 opacity-50" />
                    <p className="text-sm font-medium mb-1">No Quiz Questions Yet</p>
                    <p className="text-xs text-muted-foreground">Click &ldquo;Generate Questions&rdquo; above to create quiz questions with AI.</p>
                </div>
            )}
        </div>
    );
}
