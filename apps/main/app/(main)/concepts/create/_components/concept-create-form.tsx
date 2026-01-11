"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Plus, Trash2, Save, Eye, Check, Code2, FileText,
    BarChart3, HelpCircle, Zap, Lightbulb, Layers, Sparkles,
    Loader2, Terminal, Smartphone, Database, Globe, Cpu, Shield,
    Box, FilePlus2, X, FileEdit, Upload, Wand2
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { Separator } from "@repo/ui/components/ui/separator";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import toast from "@repo/ui/components/ui/sonner";
import CodeEditor from "@/components/main/code-editor";
import { cn } from "@repo/ui/lib/utils";
import Image from "next/image";

// --- Types ---
type ConceptCategory = "WEB_DEVELOPMENT" | "MOBILE_DEVELOPMENT" | "DATA_STRUCTURES" | "ALGORITHMS" | "SYSTEM_DESIGN" | "DATABASE" | "DEVOPS" | "PROGRAMMING_FUNDAMENTALS" | "ARTIFICIAL_INTELLIGENCE" | "CYBERSECURITY";
type ConceptDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
type ConceptStepType = "EXPLANATION" | "CODE" | "VISUALIZATION" | "COMPARISON" | "QUIZ" | "CHALLENGE" | "SUMMARY";

interface Step {
    id: string;
    title: string;
    type: ConceptStepType;
    content: string; // "Primary Content"
    codeBlocks: {
        id: string;
        title: string;
        language: string;
        code: string;
        explanation: string;
    }[];
    quizQuestion: string;
    quizOptions: { id: number; text: string; isCorrect: boolean }[];
    quizExplanation: string;
    challengeDescription: string;
    challengeStarterCode: string;
    challengeSolution: string;
    challengeHints: string[];
    tips: string[];
    comparisonTopics: string[];
    comparisonItems: { title: string; description: string; pros: string[]; cons: string[]; useCase: string }[];
    comparisonConclusion: string;
    visualizationImage: string;
    visualizationDescription: string;
    summaryKeyTakeaways: string[];
    assignment: { title: string; description: string; hints: string[] };
}

const categories: { value: ConceptCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "WEB_DEVELOPMENT", label: "Web Development", icon: Globe },
    { value: "MOBILE_DEVELOPMENT", label: "Mobile Dev", icon: Smartphone },
    { value: "DATA_STRUCTURES", label: "Data Structures", icon: Database },
    { value: "ALGORITHMS", label: "Algorithms", icon: Cpu },
    { value: "SYSTEM_DESIGN", label: "System Design", icon: Box },
    { value: "DEVOPS", label: "DevOps", icon: Terminal },
    { value: "PROGRAMMING_FUNDAMENTALS", label: "Fundamentals", icon: Code2 },
    { value: "ARTIFICIAL_INTELLIGENCE", label: "AI & ML", icon: Sparkles },
    { value: "CYBERSECURITY", label: "Security", icon: Shield },
];

const difficulties: { value: ConceptDifficulty; label: string; color: string }[] = [
    { value: "BEGINNER", label: "Beginner", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
    { value: "INTERMEDIATE", label: "Intermediate", color: "bg-amber-500/10 text-amber-700 border-amber-200" },
    { value: "ADVANCED", label: "Advanced", color: "bg-orange-500/10 text-orange-700 border-orange-200" },
    { value: "EXPERT", label: "Expert", color: "bg-rose-500/10 text-rose-700 border-rose-200" },
];

const stepTypes: { value: ConceptStepType; label: string; icon: React.ComponentType<{ className?: string }>; }[] = [
    { value: "EXPLANATION", label: "Explanation", icon: FileText },
    { value: "CODE", label: "Code Analysis", icon: Code2 },
    { value: "VISUALIZATION", label: "Visuals", icon: BarChart3 },
    { value: "COMPARISON", label: "Comparison", icon: Layers },
    { value: "QUIZ", label: "Knowledge Check", icon: HelpCircle },
    { value: "CHALLENGE", label: "Coding Lab", icon: Zap },
    { value: "SUMMARY", label: "Conclusion", icon: Lightbulb },
];

export default function ConceptCreateForm() {
    const router = useRouter();
    const [isSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [, setGeneratingFor] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<ConceptCategory>("PROGRAMMING_FUNDAMENTALS");
    const [difficulty, setDifficulty] = useState<ConceptDifficulty>("BEGINNER");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    // Steps State
    const [steps, setSteps] = useState<Step[]>([
        {
            id: "1", title: "Introduction", type: "EXPLANATION", content: "", codeBlocks: [],
            quizQuestion: "", quizOptions: Array(4).fill(null).map((_, i) => ({ id: i, text: "", isCorrect: false })), quizExplanation: "",
            challengeDescription: "", challengeStarterCode: "", challengeSolution: "", challengeHints: [],
            tips: [], comparisonTopics: [], comparisonItems: [], comparisonConclusion: "",
            visualizationImage: "", visualizationDescription: "", summaryKeyTakeaways: [], assignment: { title: "", description: "", hints: [] },
        },
    ]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    const activeStep = steps[activeStepIndex] ?? steps[0]!;

    const [showContextBox, setShowContextBox] = useState(false);

    const [visMode, setVisMode] = useState<"upload" | "generate">("upload");
    const [imagePrompt, setImagePrompt] = useState("");

    useEffect(() => {
        const currentContent = activeStep?.content || "";
        setShowContextBox(currentContent.length > 0);
    }, [activeStepIndex, steps, activeStep?.content]);

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };
    const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

    const addStep = () => {
        const newStep: Step = {
            id: Date.now().toString(), title: `Step ${steps.length + 1}`, type: "EXPLANATION", content: "",
            codeBlocks: [], quizQuestion: "", quizOptions: Array(4).fill(null).map((_, i) => ({ id: i, text: "", isCorrect: false })), quizExplanation: "",
            challengeDescription: "", challengeStarterCode: "", challengeSolution: "", challengeHints: [],
            tips: [], comparisonTopics: [], comparisonItems: [], comparisonConclusion: "",
            visualizationImage: "", visualizationDescription: "", summaryKeyTakeaways: [], assignment: { title: "", description: "", hints: [] },
        };
        setSteps([...steps, newStep]);
        setActiveStepIndex(steps.length);
    };

    const removeStep = (index: number) => {
        if (steps.length > 1) {
            const newSteps = steps.filter((_, i) => i !== index);
            setSteps(newSteps);
            if (activeStepIndex >= newSteps.length) setActiveStepIndex(newSteps.length - 1);
        } else toast.error("At least one step is required.");
    };

    const updateStep = (index: number, updates: Partial<Step>) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], ...updates } as Step;
        setSteps(newSteps);
    };

    const addCodeBlock = (stepIndex: number) => {
        const newSteps = [...steps];
        const step = newSteps[stepIndex];
        if (step) {
            step.codeBlocks.push({
                id: Date.now().toString(), title: "", language: "javascript", code: "", explanation: "",
            });
            setSteps(newSteps);
        }
    };

    const removeCodeBlock = (stepIndex: number, blockIndex: number) => {
        const newSteps = [...steps];
        const step = newSteps[stepIndex];
        if (step) {
            step.codeBlocks.splice(blockIndex, 1);
            setSteps(newSteps);
        }
    };

    // --- AI Handlers (Mocked) ---
    const handleGenerate = async (type: string) => {
        if (!title) return toast.error("Please add a System Title first");
        setIsGenerating(true);
        setGeneratingFor(type);

        setTimeout(() => {
            if (type === 'quiz') {
                updateStep(activeStepIndex, {
                    quizQuestion: "What happens to the execution context when an asynchronous function is called?",
                    quizOptions: [
                        { id: 0, text: "It is popped off the call stack immediately", isCorrect: true },
                        { id: 1, text: "It blocks the thread until completion", isCorrect: false },
                        { id: 2, text: "It is deleted from memory", isCorrect: false },
                        { id: 3, text: "It remains on the stack indefinitely", isCorrect: false },
                    ],
                    quizExplanation: "Async functions delegate work to Web APIs and return immediately, allowing the call stack to continue processing."
                });
            }
            if (type === 'challenge') {
                updateStep(activeStepIndex, {
                    challengeDescription: "Implement a debounce function that limits the rate at which a function can fire.",
                    challengeStarterCode: "function debounce(func, wait) {\n  // Your code here\n}",
                    challengeSolution: "function debounce(func, wait) {\n  let timeout;\n  return function executedFunction(...args) {\n    const later = () => {\n      clearTimeout(timeout);\n      func(...args);\n    };\n    clearTimeout(timeout);\n    timeout = setTimeout(later, wait);\n  };\n}",
                });
            }
            if (type === 'comparison') {
                updateStep(activeStepIndex, {
                    comparisonItems: [
                        { title: "React", description: "A library for building UIs", pros: ["Component-based", "Virtual DOM"], cons: ["Boilerplate", "Steep curve"], useCase: "SPA" },
                        { title: "Vue", description: "The Progressive JavaScript Framework", pros: ["Easy to learn", "Two-way binding"], cons: ["Smaller ecosystem"], useCase: "Rapid prototyping" }
                    ]
                });
            }
            if (type === 'content') {
                updateStep(activeStepIndex, { content: "Here is a detailed breakdown of the concept..." });
                setShowContextBox(true);
            }
            setIsGenerating(false);
            setGeneratingFor(null);
            toast.success("Generated successfully");
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-neutral-200 dark:selection:bg-neutral-800 font-sans">

            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-neutral-50 to-transparent dark:from-neutral-900 dark:to-transparent pointer-events-none z-0" />

            <div className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col h-full min-h-screen gap-6">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Concept Designer</h1>
                            <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Engineering Intelligence V2</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="rounded-full text-xs font-medium text-neutral-600 dark:text-neutral-400" disabled={isSubmitting}>
                            <Save className="w-4 h-4 mr-2" /> Save Draft
                        </Button>
                        <Button className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 px-6 h-9 text-xs font-bold" disabled={isSubmitting}>
                            <Eye className="w-4 h-4 mr-2" /> Publish System
                        </Button>
                    </div>
                </div>
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-8 space-y-5">
                            <div className="space-y-1.5">
                                <Label className="font-mono text-xs font-medium uppercase text-neutral-500 pl-1">System Title</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Asynchronous Javascript Patterns"
                                    className="text-2xl md:text-3xl font-bold h-14 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-transparent px-4 focus-visible:ring-2 focus-visible:ring-neutral-900 placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-mono text-xs font-medium uppercase text-neutral-500 pl-1">Core Description</Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Define the technical scope and learning objectives..."
                                    className="min-h-[90px] text-base font-light leading-relaxed resize-none border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl p-4 focus-visible:ring-2 focus-visible:ring-neutral-900"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-4">
                            <Card className="rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                                <CardContent className="p-5 space-y-5">
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="font-mono text-xs font-medium uppercase text-neutral-500">Domain</Label>
                                            <Select value={category} onValueChange={(v) => setCategory(v as ConceptCategory)}>
                                                <SelectTrigger className="h-10 rounded-lg text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        categories.map((cat) => (
                                                            <SelectItem key={cat.value} value={cat.value} className="text-sm">{cat.label}</SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="font-mono text-xs font-medium uppercase text-neutral-500">Level</Label>
                                            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as ConceptDifficulty)}>
                                                <SelectTrigger className="h-10 rounded-lg text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {
                                                        difficulties.map((diff) => (
                                                            <SelectItem key={diff.value} value={diff.value} className="text-sm">
                                                                <Badge variant="outline" className={cn("rounded-sm px-1.5 py-0.5 text-xs font-normal", diff.color)}>{diff.label}</Badge>
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-mono text-xs font-medium uppercase text-neutral-500">Tags</Label>
                                        <div className="flex flex-wrap gap-2 p-2 min-h-[3rem] bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 focus-within:ring-2 focus-within:ring-neutral-900 transition-all">
                                            {
                                                tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="rounded-md text-xs h-6 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 font-normal text-neutral-700 dark:text-neutral-300">
                                                        {tag} <button onClick={() => removeTag(tag)} className="ml-1.5 hover:text-red-500">×</button>
                                                    </Badge>
                                                ))
                                            }
                                            <input
                                                className="bg-transparent text-sm outline-none flex-1 min-w-[60px] px-1 placeholder:text-neutral-400"
                                                placeholder="Add tag..."
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && addTag()}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <Separator className="bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />

                <section className="space-y-6 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between flex-shrink-0">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-neutral-900 dark:text-white">
                            <Layers className="w-5 h-5 text-neutral-400" />
                            Learning Architecture
                        </h2>
                        <Button onClick={addStep} variant="outline" size="sm" className="rounded-full text-xs h-9 font-medium border-neutral-300 dark:border-neutral-700">
                            <Plus className="w-4 h-4 mr-1.5" /> Add Step
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">

                        <div className="lg:col-span-3 h-full overflow-hidden">
                            <ScrollArea className="h-full pr-3">
                                <div className="flex flex-col gap-3 pb-4">
                                    {
                                        steps.map((step, index) => {
                                            const isActive = activeStepIndex === index;
                                            const TypeIcon = stepTypes.find(t => t.value === step.type)?.icon || FileText;
                                            return (
                                                <div
                                                    key={step.id}
                                                    onClick={() => setActiveStepIndex(index)}
                                                    className={cn(
                                                        "group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none",
                                                        isActive
                                                            ? "bg-neutral-900 text-white border-neutral-900 shadow-lg dark:bg-white dark:text-neutral-900"
                                                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge variant="outline" className={cn("font-mono text-[10px] tracking-wider border-current/20 px-1.5 py-0.5", isActive ? "text-white/80 dark:text-neutral-900/80" : "text-neutral-500")}>
                                                            STEP {index + 1}
                                                        </Badge>
                                                        {
                                                            steps.length > 1 && (
                                                                <button onClick={(e) => { e.stopPropagation(); removeStep(index); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
                                                                </button>
                                                            )
                                                        }
                                                    </div>
                                                    <h4 className={cn("font-semibold text-sm truncate pr-2", isActive ? "text-white dark:text-neutral-900" : "text-neutral-700 dark:text-neutral-200")}>{step.title || "Untitled Step"}</h4>
                                                    <div className={cn("flex items-center gap-1.5 mt-2 opacity-80", isActive ? "text-white/90 dark:text-neutral-900/90" : "text-neutral-500")}>
                                                        <TypeIcon className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] uppercase font-semibold">{stepTypes.find(t => t.value === step.type)?.label}</span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="lg:col-span-9 h-full">
                            <Card className="h-full border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/50 dark:shadow-black/50 rounded-3xl overflow-hidden flex flex-col bg-white dark:bg-neutral-950">
                                <div className="px-8 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm flex-shrink-0 z-10">
                                    <Input
                                        value={activeStep?.title}
                                        onChange={(e) => updateStep(activeStepIndex, { title: e.target.value })}
                                        className="text-xl font-bold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 placeholder:text-neutral-300 w-full text-neutral-900 dark:text-white"
                                        placeholder={`Title for Step ${activeStepIndex + 1}`}
                                    />
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                                        {isGenerating && <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />}
                                        <Badge className="font-mono text-xs font-medium px-2 py-1 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-0">
                                            {stepTypes.find(t => t.value === activeStep?.type)?.label}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0 relative">
                                    <ScrollArea className="h-full w-full">
                                        <div className="p-8 space-y-8 max-w-4xl mx-auto pb-20">

                                            <div className="space-y-3">
                                                <Label className="font-mono text-xs font-medium uppercase text-neutral-500 pl-1">Module Type</Label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                                    {
                                                        stepTypes.map((type) => {
                                                            const isSelected = activeStep?.type === type.value;
                                                            return (
                                                                <button
                                                                    key={type.value}
                                                                    onClick={() => updateStep(activeStepIndex, { type: type.value })}
                                                                    className={cn(
                                                                        "flex flex-col items-center justify-center gap-2.5 p-3 rounded-xl border transition-all duration-200 h-24",
                                                                        isSelected
                                                                            ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 shadow-md"
                                                                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                                                    )}
                                                                >
                                                                    <type.icon className={cn("w-5 h-5", isSelected ? "text-inherit" : "text-neutral-400")} />
                                                                    <span className="text-[10px] font-bold text-center leading-tight tracking-wide">{type.label}</span>
                                                                </button>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>

                                            <Separator className="bg-neutral-100 dark:bg-neutral-800" />

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="font-mono text-xs font-medium uppercase text-neutral-500">Context / Primary Content</Label>
                                                    </div>
                                                    {
                                                        !showContextBox && (
                                                            <Button
                                                                size="sm" variant="outline" className="h-8 text-xs font-medium border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                                                onClick={() => setShowContextBox(true)}
                                                            >
                                                                <FilePlus2 className="w-3.5 h-3.5 mr-1.5" /> Add Context
                                                            </Button>
                                                        )
                                                    }
                                                </div>

                                                {
                                                    showContextBox && (
                                                        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                                            <div className="relative">
                                                                <Textarea
                                                                    value={activeStep?.content}
                                                                    onChange={(e) => updateStep(activeStepIndex, { content: e.target.value })}
                                                                    className="min-h-[140px] text-sm font-normal leading-relaxed rounded-xl border-neutral-200 dark:border-neutral-800 resize-y focus-visible:ring-1 pr-10"
                                                                    placeholder="Provide context, explanation, or instructions for this step..."
                                                                />
                                                                <Button
                                                                    variant="ghost" size="icon"
                                                                    className="absolute top-2 right-2 h-6 w-6 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                                                    onClick={() => {
                                                                        updateStep(activeStepIndex, { content: "" });
                                                                        setShowContextBox(false);
                                                                    }}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <Button
                                                                    size="sm" variant="ghost" className="h-6 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                                                                    onClick={() => handleGenerate('content')}
                                                                    disabled={isGenerating}
                                                                >
                                                                    <Sparkles className="w-3 h-3 mr-1" /> AI Generate Content
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>

                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeStep?.type}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-6 pt-2"
                                                >
                                                    {
                                                        activeStep?.type === "VISUALIZATION" && (
                                                            <div className="space-y-4">
                                                                <div className="bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50 space-y-6">
                                                                    <div className="flex items-center justify-center p-1 bg-white dark:bg-neutral-950 rounded-lg w-fit mx-auto border border-neutral-200 dark:border-neutral-800">
                                                                        <button
                                                                            onClick={() => setVisMode("upload")}
                                                                            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all", visMode === "upload" ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white" : "text-neutral-500 hover:text-neutral-900")}
                                                                        >
                                                                            Upload Image
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setVisMode("generate")}
                                                                            className={cn("px-4 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", visMode === "generate" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" : "text-neutral-500 hover:text-neutral-900")}
                                                                        >
                                                                            <Wand2 className="w-3 h-3" /> AI Generate
                                                                        </button>
                                                                    </div>

                                                                    {
                                                                        visMode === "generate" && (
                                                                            <div className="space-y-3 animate-in fade-in zoom-in-95">
                                                                                <div className="space-y-2">
                                                                                    <Label className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Image Prompt</Label>
                                                                                    <div className="flex gap-2">
                                                                                        <Input
                                                                                            value={imagePrompt}
                                                                                            onChange={(e) => setImagePrompt(e.target.value)}
                                                                                            placeholder="Describe the diagram or chart you need..."
                                                                                            className="bg-white dark:bg-neutral-950 border-blue-200 dark:border-blue-800"
                                                                                        />
                                                                                        <Button onClick={() => handleGenerate('image')} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white">
                                                                                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    }

                                                                    {
                                                                        visMode === "upload" && (
                                                                            <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-neutral-950/50 animate-in fade-in zoom-in-95 cursor-pointer hover:bg-blue-50/50 transition-colors">
                                                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                                                                    <Upload className="w-5 h-5" />
                                                                                </div>
                                                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">Click to upload or drag and drop</p>
                                                                                <p className="text-xs text-neutral-500 mt-1">SVG, PNG, JPG (Max 2MB)</p>
                                                                            </div>
                                                                        )
                                                                    }

                                                                    {
                                                                        activeStep?.visualizationImage && (
                                                                            <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 group">
                                                                                <Image
                                                                                    src={activeStep?.visualizationImage}
                                                                                    alt="Visualization"
                                                                                    className="w-full h-64 object-cover bg-neutral-100 dark:bg-neutral-900"
                                                                                    height={256}
                                                                                    width={512}
                                                                                />
                                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                    <Button variant="destructive" size="sm" onClick={() => updateStep(activeStepIndex, { visualizationImage: "" })}>Remove Image</Button>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        activeStep.type === "QUIZ" && (
                                                            <div className="space-y-4">
                                                                {
                                                                    !activeStep.quizQuestion ? (
                                                                        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-neutral-50/50 dark:bg-neutral-900/50">
                                                                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                                                                <HelpCircle className="w-6 h-6" />
                                                                            </div>
                                                                            <h3 className="font-semibold text-sm mb-1 text-neutral-900 dark:text-white">No Questions Yet</h3>
                                                                            <p className="text-xs text-neutral-500 max-w-xs mb-6">Generate a quiz question based on your system context.</p>
                                                                            <Button
                                                                                onClick={() => handleGenerate('quiz')}
                                                                                disabled={isGenerating}
                                                                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full text-xs h-9 px-6 font-medium"
                                                                            >
                                                                                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
                                                                                Generate Question
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-purple-50/50 dark:bg-purple-950/10 rounded-2xl p-6 border border-purple-100 dark:border-purple-900 space-y-6 animate-in fade-in zoom-in-95">
                                                                            <div className="space-y-2 relative">
                                                                                <Label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Question</Label>
                                                                                <Input
                                                                                    className="bg-white dark:bg-neutral-950 border-purple-200 dark:border-purple-800 text-sm font-medium h-10"
                                                                                    value={activeStep.quizQuestion}
                                                                                    onChange={(e) => updateStep(activeStepIndex, { quizQuestion: e.target.value })}
                                                                                />
                                                                                <Button size="icon" variant="ghost" className="absolute right-2 top-7 h-7 w-7 text-neutral-400 hover:text-red-500" onClick={() => updateStep(activeStepIndex, { quizQuestion: "" })}>
                                                                                    <X className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                            <div className="space-y-3">
                                                                                <Label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Options</Label>
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                    {
                                                                                        activeStep.quizOptions.map((opt, i) => (
                                                                                            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-colors bg-white dark:bg-neutral-950", opt.isCorrect ? "border-green-500 ring-1 ring-green-500/20" : "border-neutral-200 dark:border-neutral-800")}>
                                                                                                <div
                                                                                                    className={cn("w-5 h-5 rounded-full border flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors", opt.isCorrect ? "bg-green-500 border-green-500 text-white" : "border-neutral-300 hover:border-neutral-400")}
                                                                                                    onClick={() => {
                                                                                                        const newOpts = activeStep.quizOptions.map((o, idx) => ({ ...o, isCorrect: idx === i }));
                                                                                                        updateStep(activeStepIndex, { quizOptions: newOpts });
                                                                                                    }}
                                                                                                >
                                                                                                    {opt.isCorrect && <Check className="w-3 h-3" />}
                                                                                                </div>
                                                                                                <Input
                                                                                                    className="border-0 h-auto py-1 px-0 focus-visible:ring-0 bg-transparent text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
                                                                                                    placeholder={`Option ${i + 1}`}
                                                                                                    value={opt.text}
                                                                                                    onChange={(e) => {
                                                                                                        const newOpts = [...activeStep.quizOptions];
                                                                                                        const opt = newOpts[i];
                                                                                                        if (opt) {
                                                                                                            opt.text = e.target.value;
                                                                                                            updateStep(activeStepIndex, { quizOptions: newOpts });
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                            </div>
                                                                                        ))
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <Label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Explanation</Label>
                                                                                <Textarea
                                                                                    className="bg-white dark:bg-neutral-950 border-purple-200 dark:border-purple-800 text-sm min-h-[80px]"
                                                                                    value={activeStep.quizExplanation}
                                                                                    onChange={(e) => updateStep(activeStepIndex, { quizExplanation: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        activeStep.type === "CHALLENGE" && (
                                                            <div className="space-y-4">
                                                                {
                                                                    !activeStep.challengeDescription ? (
                                                                        <div className="border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-neutral-50/50 dark:bg-neutral-900/50">
                                                                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mb-4">
                                                                                <Zap className="w-6 h-6" />
                                                                            </div>
                                                                            <h3 className="font-semibold text-sm mb-1 text-neutral-900 dark:text-white">Empty Coding Lab</h3>
                                                                            <Button
                                                                                onClick={() => handleGenerate('challenge')}
                                                                                disabled={isGenerating}
                                                                                className="bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs h-9 px-6 mt-4 font-medium"
                                                                            >
                                                                                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Sparkles className="w-3.5 h-3.5 mr-2" />}
                                                                                Generate Challenge
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-900/50 space-y-6 animate-in fade-in zoom-in-95">
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="space-y-2 w-full">
                                                                                    <Label className="text-xs uppercase font-bold text-amber-700 dark:text-amber-500 tracking-wide">Task Requirement</Label>
                                                                                    <Textarea
                                                                                        value={activeStep.challengeDescription}
                                                                                        onChange={(e) => updateStep(activeStepIndex, { challengeDescription: e.target.value })}
                                                                                        className="bg-white dark:bg-neutral-950 border-amber-100 dark:border-amber-900 min-h-[80px] text-sm"
                                                                                    />
                                                                                </div>
                                                                                <Button size="icon" variant="ghost" className="h-6 w-6 ml-2 text-neutral-400 hover:text-red-500" onClick={() => updateStep(activeStepIndex, { challengeDescription: "" })}>
                                                                                    <X className="w-4 h-4" />
                                                                                </Button>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div className="space-y-2">
                                                                                    <Label className="text-xs uppercase font-bold text-amber-700 dark:text-amber-500 tracking-wide">Starter Code</Label>
                                                                                    <div className="rounded-xl overflow-hidden border border-amber-100 dark:border-amber-900 bg-white dark:bg-neutral-950 shadow-sm">
                                                                                        <CodeEditor
                                                                                            code={activeStep.challengeStarterCode}
                                                                                            onChange={(c) => updateStep(activeStepIndex, { challengeStarterCode: c })}
                                                                                            height="160px"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <Label className="text-xs uppercase font-bold text-amber-700 dark:text-amber-500 tracking-wide">Solution Code</Label>
                                                                                    <div className="rounded-xl overflow-hidden border border-amber-100 dark:border-amber-900 bg-white dark:bg-neutral-950 shadow-sm">
                                                                                        <CodeEditor
                                                                                            code={activeStep.challengeSolution}
                                                                                            onChange={(c) => updateStep(activeStepIndex, { challengeSolution: c })}
                                                                                            height="160px"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        activeStep.type === "CODE" && (
                                                            <div className="space-y-6">
                                                                <div className="flex items-center justify-between">
                                                                    <Label className="font-mono text-xs font-medium uppercase text-neutral-500">Code Blocks</Label>
                                                                    <Button size="sm" onClick={() => addCodeBlock(activeStepIndex)} className="rounded-full h-8 text-xs px-4 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 font-medium">
                                                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Code Block
                                                                    </Button>
                                                                </div>
                                                                <div className="space-y-6">
                                                                    {
                                                                        activeStep.codeBlocks.map((block, idx) => (
                                                                            <div key={block.id} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-neutral-900 text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
                                                                                <div className="flex items-center justify-between p-3 bg-neutral-800 border-b border-neutral-700">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <Terminal className="w-4 h-4 text-neutral-400" />
                                                                                        <Input
                                                                                            value={block.title}
                                                                                            onChange={(e) => {
                                                                                                const newSteps = [...steps];
                                                                                                const step = newSteps[activeStepIndex];
                                                                                                const block = step?.codeBlocks[idx];
                                                                                                if (block) {
                                                                                                    block.title = e.target.value;
                                                                                                    setSteps(newSteps);
                                                                                                }
                                                                                            }}
                                                                                            placeholder="Filename.js"
                                                                                            className="bg-transparent border-0 text-white h-7 w-48 focus-visible:ring-0 placeholder:text-neutral-500 text-xs font-mono"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-red-500/20 hover:text-red-500 rounded-md" onClick={() => removeCodeBlock(activeStepIndex, idx)}>
                                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                                <CodeEditor
                                                                                    code={block.code}
                                                                                    onChange={(c) => {
                                                                                        const newSteps = [...steps];
                                                                                        const step = newSteps[activeStepIndex];
                                                                                        const codeBlock = step?.codeBlocks[idx];
                                                                                        if (codeBlock) {
                                                                                            codeBlock.code = c;
                                                                                            setSteps(newSteps);
                                                                                        }
                                                                                    }}
                                                                                    allowedLanguages={["javascript", "typescript", "python", "java", "c", "cpp"]}
                                                                                    height="220px"
                                                                                />
                                                                                <div className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 p-3">
                                                                                    <div className="flex gap-3 items-start">
                                                                                        <FileEdit className="w-4 h-4 text-neutral-400 mt-2" />
                                                                                        <Textarea
                                                                                            className="border-0 bg-transparent text-sm text-neutral-600 dark:text-neutral-400 min-h-[40px] resize-none focus-visible:ring-0 p-1"
                                                                                            placeholder="Add a brief caption or explanation for this specific snippet..."
                                                                                            value={block.explanation}
                                                                                            onChange={(e) => {
                                                                                                const newSteps = [...steps];
                                                                                                const step = newSteps[activeStepIndex];
                                                                                                const codeBlock = step?.codeBlocks[idx];
                                                                                                if (codeBlock) {
                                                                                                    codeBlock.explanation = e.target.value;
                                                                                                    setSteps(newSteps);
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                    {
                                                                        activeStep.codeBlocks.length === 0 && (
                                                                            <div className="text-center p-12 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50">
                                                                                <Code2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                                                                <p className="text-sm font-medium mb-1">No Code Blocks</p>
                                                                                <p className="text-xs text-neutral-400 mb-4">Add snippets to illustrate your concept.</p>
                                                                                <Button size="sm" variant="outline" onClick={() => addCodeBlock(activeStepIndex)}>Add First Block</Button>
                                                                            </div>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        activeStep.type === "COMPARISON" && (
                                                            <div className="space-y-4">
                                                                <div className="bg-neutral-50/80 dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <Label className="font-mono text-xs font-bold uppercase text-neutral-500">Topics to Compare</Label>
                                                                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleGenerate('comparison')} disabled={isGenerating}>
                                                                            <Sparkles className="w-3 h-3 mr-1.5" /> AI Table
                                                                        </Button>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2 items-center">
                                                                        {
                                                                            activeStep.comparisonTopics.map((t, i) => (
                                                                                <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1 h-8 text-sm bg-white border border-neutral-200 shadow-sm">
                                                                                    {t}
                                                                                    <button className="ml-2 p-0.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-red-500" onClick={() => {
                                                                                        const newTopics = activeStep.comparisonTopics.filter((_, idx) => idx !== i);
                                                                                        updateStep(activeStepIndex, { comparisonTopics: newTopics });
                                                                                    }}>
                                                                                        <X className="w-3 h-3" />
                                                                                    </button>
                                                                                </Badge>
                                                                            ))
                                                                        }
                                                                        <Input
                                                                            className="w-48 h-8 bg-white dark:bg-neutral-950 text-sm border-neutral-200 dark:border-neutral-800"
                                                                            placeholder="Add topic (Press Enter)"
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") {
                                                                                    const val = (e.currentTarget as HTMLInputElement).value.trim();
                                                                                    if (val) {
                                                                                        updateStep(activeStepIndex, { comparisonTopics: [...activeStep.comparisonTopics, val] });
                                                                                        (e.currentTarget as HTMLInputElement).value = "";
                                                                                    }
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {
                                                                    activeStep.comparisonItems.length > 0 && (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                                                                            {
                                                                                activeStep.comparisonItems.map((item, i) => (
                                                                                    <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-950">
                                                                                        <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                                                                                        <p className="text-xs text-neutral-500 mb-3">{item.description}</p>
                                                                                        <div className="space-y-1">
                                                                                            {item.pros.map((p, idx) => <div key={idx} className="flex gap-2 text-xs text-green-700"><Check className="w-3 h-3 mt-0.5" /> {p}</div>)}
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}