"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    Plus, Trash2, Save, Eye, ArrowLeft, Sparkles, Loader2, BookOpen,
    Code2, HelpCircle, Zap, BarChart3, CheckCircle2, FileText, Video,
    Send, FileEdit, X, Link2, Search, FileStack, ChevronRight,
    Image as ImageIcon, Mic, FolderGit2
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@repo/ui/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@repo/ui/components/ui/sheet";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import toast from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import {
    LearnDifficulty, LearnStepType
} from "@repo/prisma/client";
import {
    createLearn, addLearnStep, updateLearnStep, deleteLearnStep,
    updateLearn, publishLearn, addCodeBlock, searchLearns,
    addPrerequisiteLearn, removePrerequisiteLearn, getUserDraftLearns,
    getLearnForEditing,
} from "@/actions/(main)/learn/learn.action";
import {
    generateStepContent, generateQuizQuestion, generateChallenge,
    generateResources, generateComparison
} from "@/actions/(main)/learn/learn-ai.action";
import { formatDistanceToNow } from "date-fns";
import { StepBlock } from "./types";
import { ContentEditor } from "./content-editor";
import { CodeBlockEditor } from "./code-block-editor";
import { QuizDataEditor } from "./quiz-data-editor";
import { ChallengeDataEditor } from "./challenge-data-editor";
import { ComparisonDataViewer } from "./comparison-data-viewer";
import { ResourceEditor } from "./resource-editor";
import { VisualDataEditor } from "./visual-data-editor";
import { MockInterviewEditor } from "./mock-interview-editor";
import { ProjectEditor } from "./project-editor";
import type { LearnCategory, LearnSubCategory, LearnSearchResult } from "@/types/learn";

interface LearnBlockEditorProps {
    initialMainCategoryId?: string;
    initialSubCategoryId?: string;
    initialLearnId?: string;
    categories?: LearnCategory[];
}


// ==================== TYPES ====================

interface DraftLearn {
    id: string;
    slug: string;
    title: string;
    description: string;
    iconEmoji: string | null;
    status: string;
    updatedAt: Date;
    _count: { steps: number };
}



const STEP_TYPES: { value: LearnStepType; label: string; icon: LucideIcon; color: string; bgColor: string; description: string }[] = [
    { value: "EXPLANATION", label: "Explanation", icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/20", description: "Teach a Learn with markdown" },
    { value: "CODE", label: "Code", icon: Code2, color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/20", description: "Code examples with editor" },
    { value: "QUIZ", label: "Quiz", icon: HelpCircle, color: "text-pink-500", bgColor: "bg-pink-500/10 border-pink-500/20", description: "Test understanding" },
    { value: "CHALLENGE", label: "Challenge", icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-500/10 border-yellow-500/20", description: "Hands-on coding challenge" },
    { value: "COMPARISON", label: "Comparison", icon: BarChart3, color: "text-orange-500", bgColor: "bg-orange-500/10 border-orange-500/20", description: "Compare approaches" },
    { value: "SUMMARY", label: "Summary", icon: CheckCircle2, color: "text-teal-500", bgColor: "bg-teal-500/10 border-teal-500/20", description: "Key takeaways" },
    { value: "RESOURCE", label: "Resources", icon: Video, color: "text-purple-500", bgColor: "bg-purple-500/10 border-purple-500/20", description: "Videos & docs" },
    { value: "VISUAL", label: "Visual", icon: ImageIcon, color: "text-cyan-500", bgColor: "bg-cyan-500/10 border-cyan-500/20", description: "Images & diagrams" },
    { value: "MOCK_INTERVIEW", label: "Mock Interview", icon: Mic, color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20", description: "Practice interviews" },
    { value: "PROJECT", label: "Project", icon: FolderGit2, color: "text-indigo-500", bgColor: "bg-indigo-500/10 border-indigo-500/20", description: "Build projects" },
];

const DIFFICULTIES = Object.values(LearnDifficulty);

function createEmptyBlock(order: number, type: LearnStepType = "EXPLANATION"): StepBlock {
    return {
        id: "", localId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        order, title: "", type, content: "", stepData: undefined, tips: [],
        codeBlocks: [], isExpanded: true, isSaved: false, isSaving: false, isGenerating: false,
    };
}

// ==================== COMPONENT ====================

export default function LearnBlockEditor({
    initialMainCategoryId,
    initialSubCategoryId,
    categories = []
}: LearnBlockEditorProps = {}) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    // Drafts state
    const [drafts, setDrafts] = useState<DraftLearn[]>([]);
    const [draftsOpen, setDraftsOpen] = useState(false);
    const [loadingDrafts, setLoadingDrafts] = useState(false);

    // Learn metadata
    const [LearnId, setLearnId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Hierarchical Categories State
    const [hMainId, setHMainId] = useState(initialMainCategoryId || "");
    const [hSubId, setHSubId] = useState(initialSubCategoryId || "");
    const [difficulty, setDifficulty] = useState<LearnDifficulty>("BEGINNER");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [iconEmoji, setIconEmoji] = useState("📚");
    const [estimatedTime, setEstimatedTime] = useState(10);
    const [prerequisites, setPrerequisites] = useState<string[]>([]);


    // Steps (blocks)
    const [blocks, setBlocks] = useState<StepBlock[]>([createEmptyBlock(0)]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [isSavingLearn, setIsSavingLearn] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // AI prompt state
    const [aiPrompt, setAiPrompt] = useState("");

    // Prerequisite Learns state
    const [prereqSearch, setPrereqSearch] = useState("");
    const [prereqResults, setPrereqResults] = useState<{ id: string; title: string; iconEmoji: string | null; slug: string; difficulty: string; category: string }[]>([]);
    const [linkedPrereqs, setLinkedPrereqs] = useState<{ id: string; title: string; iconEmoji: string | null; slug: string }[]>([]);
    const [isSearchingPrereqs, setIsSearchingPrereqs] = useState(false);


    // Determine current category names for breadcrumbs
    const mainCategoryName = useMemo(() => {
        if (!hMainId || !categories || categories.length === 0) return null;
        return categories.find((c: LearnCategory) => c.id === hMainId)?.name;
    }, [hMainId, categories]);

    const subCategoryName = useMemo(() => {
        if (!hMainId || !hSubId || !categories || categories.length === 0) return null;
        const main = categories.find((c: LearnCategory) => c.id === hMainId);
        if (!main) return null;
        return main.subCategories.find((s: LearnSubCategory) => s.id === hSubId)?.name;
    }, [hMainId, hSubId, categories]);

    // Load drafts on mount
    useEffect(() => {
        loadDrafts();
    }, []);

    // Load Learn for editing if editId is present
    useEffect(() => {
        if (editId) {
            loadLearnForEditing(editId);
        }
    }, [editId]);

    const loadDrafts = async () => {
        setLoadingDrafts(true);
        try {
            const result = await getUserDraftLearns();
            if (result.drafts) {
                setDrafts(result.drafts as DraftLearn[]);
            }
        } catch (error) {
            console.error("Failed to load drafts:", error);
        } finally {
            setLoadingDrafts(false);
        }
    };

    const loadLearnForEditing = async (id: string) => {
        try {
            const result = await getLearnForEditing(id);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            if (result.learn) {
                const c = result.learn;
                setLearnId(c.id);
                setTitle(c.title);
                setDescription(c.description);
                setDifficulty(c.difficulty);
                setTags(c.tags);
                setIconEmoji(c.iconEmoji || "📚");
                setEstimatedTime(c.estimatedTime || 10);
                setPrerequisites(c.prerequisites);

                // Set hierarchical categories
                if (c.mainCategoryId) setHMainId(c.mainCategoryId);
                if (c.subCategoryId) setHSubId(c.subCategoryId);

                // Load steps
                if (c.steps && c.steps.length > 0) {
                    setBlocks(c.steps.map((step, idx) => ({
                        id: step.id,
                        localId: `loaded-${step.id}`,
                        order: step.order,
                        title: step.title,
                        type: step.type,
                        content: step.content,
                        stepData: (step.stepData as Record<string, unknown> | null) || undefined,
                        tips: (step.tips as string[] | null) || [],
                        codeBlocks: step.codeBlocks?.map((cb) => ({
                            id: cb.id,
                            order: cb.order,
                            title: cb.title || "",
                            language: cb.language,
                            code: cb.code,
                            explanation: cb.explanation || "",
                            isRunnable: cb.isRunnable,
                        })) || [],
                        isExpanded: idx === 0,
                        isSaved: true,
                        isSaving: false,
                        isGenerating: false,
                    })));
                }
                toast.success("Learn loaded for editing");
            }
        } catch (error) {
            console.error("Failed to load learn:", error);
            toast.error("Failed to load Learn");
        }
    };

    const handleDraftClick = (draft: DraftLearn) => {
        setDraftsOpen(false);
        router.push(`/Learns/create?edit=${draft.id}`);
    };

    // Search prerequisites
    const handlePrereqSearch = useCallback(async (query: string) => {
        setPrereqSearch(query);
        if (query.length < 2) { setPrereqResults([]); return; }
        setIsSearchingPrereqs(true);
        try {
            const result = await searchLearns(query, LearnId || undefined);
            if (result.learns) {
                const mappedLearns = result.learns.map((l: LearnSearchResult) => ({
                    ...l,
                    category: l.mainCategory?.name || "Uncategorized"
                }));
                setPrereqResults(mappedLearns.filter((c) => !linkedPrereqs.some(l => l.id === c.id)));
            }
        } catch { setPrereqResults([]); }
        finally { setIsSearchingPrereqs(false); }
    }, [LearnId, linkedPrereqs]);

    const addPrereq = useCallback(async (prereq: { id: string; title: string; iconEmoji: string | null; slug: string }) => {
        if (!LearnId) { toast.error("Save the Learn first before adding prerequisites"); return; }
        const result = await addPrerequisiteLearn(LearnId, prereq.id);
        if (result.error) { toast.error(result.error); return; }
        setLinkedPrereqs(prev => [...prev, prereq]);
        setPrereqSearch("");
        setPrereqResults([]);
        toast.success(`Linked "${prereq.title}" as prerequisite`);
    }, [LearnId]);

    const removePrereq = useCallback(async (prereqId: string) => {
        if (!LearnId) return;
        const result = await removePrerequisiteLearn(LearnId, prereqId);
        if (result.error) { toast.error(result.error); return; }
        setLinkedPrereqs(prev => prev.filter(p => p.id !== prereqId));
        toast.success("Prerequisite removed");
    }, [LearnId]);

    const activeBlock = blocks[activeStepIndex] ?? blocks[0]!;

    // ==================== Learn SAVE ====================

    const saveLearn = useCallback(async () => {
        if (!title.trim()) { toast.error("Title is required"); return null; }
        if (!description.trim()) { toast.error("Description is required"); return null; }
        setIsSavingLearn(true);
        setIsSavingLearn(true);
        // Determine the customCategory value from subCategory selection
        try {
            if (LearnId) {
                const result = await updateLearn(LearnId, {
                    title, description, difficulty, tags,
                    iconEmoji, estimatedTime, prerequisites,
                    mainCategoryId: hMainId || undefined,
                    subCategoryId: hSubId || undefined,
                });
                if (result.error) { toast.error(result.error); return null; }
                toast.success("Learn updated!");
                loadDrafts(); // Refresh drafts
                return LearnId;
            } else {
                const result = await createLearn({
                    title, description, difficulty, tags,
                    iconEmoji, estimatedTime, prerequisites,
                    mainCategoryId: hMainId,
                    subCategoryId: hSubId,
                });
                if (result.error) { toast.error(result.error); return null; }
                setLearnId(result.learn!.id);
                toast.success("Learn created!");
                loadDrafts(); // Refresh drafts
                return result.learn!.id;
            }
        } catch { toast.error("Failed to save Learn"); return null; }
        finally { setIsSavingLearn(false); }
    }, [LearnId, title, description, difficulty, tags, iconEmoji, estimatedTime, prerequisites, hMainId, hSubId]);

    // ==================== BLOCK SAVE ====================

    const saveBlock = useCallback(async (block: StepBlock) => {
        let cId = LearnId;
        if (!cId) { cId = await saveLearn(); if (!cId) return; }
        setBlocks(prev => prev.map(b => b.localId === block.localId ? { ...b, isSaving: true } : b));
        try {
            if (block.id) {
                const result = await updateLearnStep(block.id, {
                    title: block.title, type: block.type, content: block.content,
                    stepData: block.stepData, tips: block.tips, order: block.order,
                });
                if (result.error) { toast.error(result.error); return; }
                setBlocks(prev => prev.map(b => b.localId === block.localId ? { ...b, isSaved: true, isSaving: false } : b));
            } else {
                const result = await addLearnStep(cId, {
                    order: block.order, title: block.title, type: block.type,
                    content: block.content, stepData: block.stepData, tips: block.tips,
                });
                if (result.error) { toast.error(result.error); return; }
                const newId = result.step!.id;
                for (const cb of block.codeBlocks) {
                    await addCodeBlock(newId, {
                        order: cb.order, title: cb.title, language: cb.language,
                        code: cb.code, explanation: cb.explanation, isRunnable: cb.isRunnable,
                    });
                }
                setBlocks(prev => prev.map(b => b.localId === block.localId ? { ...b, id: newId, isSaved: true, isSaving: false } : b));
            }
            toast.success(`Step "${block.title || 'Untitled'}" saved!`);
        } catch { toast.error("Failed to save step"); }
        finally { setBlocks(prev => prev.map(b => b.localId === block.localId ? { ...b, isSaving: false } : b)); }
    }, [LearnId, saveLearn]);

    // ==================== BLOCK OPERATIONS ====================

    const addBlock = (type: LearnStepType) => {
        const newOrder = blocks.length;
        setBlocks(prev => [...prev, createEmptyBlock(newOrder, type)]);
        setActiveStepIndex(newOrder);
    };

    const removeBlock = async (localId: string) => {
        const block = blocks.find(b => b.localId === localId);
        if (block?.id) { await deleteLearnStep(block.id); }
        const newBlocks = blocks.filter(b => b.localId !== localId).map((b, i) => ({ ...b, order: i }));
        setBlocks(newBlocks);
        if (activeStepIndex >= newBlocks.length) setActiveStepIndex(Math.max(0, newBlocks.length - 1));
    };

    const updateBlock = (localId: string, updates: Partial<StepBlock>) => {
        setBlocks(prev => prev.map(b => b.localId === localId ? { ...b, ...updates, isSaved: false } : b));
    };

    const handleAiGenerate = async (prompt: string) => {
        const block = activeBlock;
        if (!block || !prompt.trim()) return;
        if (!title.trim()) { toast.error("Please set a Learn title first"); return; }

        updateBlock(block.localId, { isGenerating: true });
        setAiPrompt("");

        try {
            if (block.type === "QUIZ") {
                const result = await generateQuizQuestion(title, description, block.title || prompt, block.content || prompt);
                if (result.quiz) {
                    // APPEND quiz data - if stepData already has options, merge them
                    const existingData = (block.stepData || {}) as { options?: unknown[] };
                    const existingOptions = existingData.options || [];

                    // If there's already quiz content, append the new question info to content
                    const mergedContent = block.content
                        ? `${block.content}\n\n## ${result.quiz.question}`
                        : `## ${block.title || "Quiz"}\n\n${result.quiz.question}`;

                    updateBlock(block.localId, {
                        content: mergedContent,
                        stepData: {
                            question: result.quiz.question,
                            options: existingOptions.length > 0
                                ? [...existingOptions, ...result.quiz.options]
                                : result.quiz.options,
                            explanation: result.quiz.explanation
                        },
                        isGenerating: false,
                    });
                    toast.success("Quiz generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else if (block.type === "CHALLENGE") {
                const result = await generateChallenge(title, description, block.title || prompt, block.content || prompt);
                if (result.challenge) {
                    // For challenge, we want to update but keep any existing content as context
                    const mergedContent = block.content
                        ? `${block.content}\n\n---\n\n${result.challenge.description}`
                        : result.challenge.description;

                    updateBlock(block.localId, {
                        content: mergedContent,
                        stepData: {
                            starterCode: result.challenge.starterCode,
                            solution: result.challenge.solution,
                            hints: result.challenge.hints,
                            testCases: result.challenge.testCases,
                            language: result.challenge.language,
                        },
                        isGenerating: false,
                    });
                    toast.success("Challenge generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else if (block.type === "RESOURCE") {
                const result = await generateResources(title, block.title || prompt, mainCategoryName || "General", difficulty);
                if (result.resources) {
                    // APPEND resources instead of replacing
                    const existingData = (block.stepData || {}) as { videos?: unknown[]; docs?: unknown[] };
                    const existingVideos = existingData.videos || [];
                    const existingDocs = existingData.docs || [];

                    const mergedContent = block.content
                        ? `${block.content}\n\n## Additional Resources for ${block.title || title}`
                        : `## Resources for ${block.title || title}`;

                    updateBlock(block.localId, {
                        content: mergedContent,
                        stepData: {
                            videos: [...existingVideos, ...result.resources.videos],
                            docs: [...existingDocs, ...result.resources.docs]
                        },
                        isGenerating: false,
                    });
                    toast.success("Resources found!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else if (block.type === "COMPARISON") {
                const topics = (block.title || prompt).split(/\s+vs\.?\s+/i);
                const result = await generateComparison(title, description, block.title || prompt, topics.length > 1 ? topics : [block.title || prompt]);
                if (result.comparison) {
                    // APPEND comparison items
                    const existingData = (block.stepData || {}) as { items?: unknown[] };
                    const existingItems = existingData.items || [];

                    const mergedContent = block.content
                        ? `${block.content}\n\n## ${block.title}`
                        : `## ${block.title}`;

                    updateBlock(block.localId, {
                        content: mergedContent,
                        stepData: {
                            items: [...existingItems, ...result.comparison.items],
                            conclusion: result.comparison.conclusion
                        },
                        isGenerating: false,
                    });
                    toast.success("Comparison generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else {
                // EXPLANATION, CODE, SUMMARY — generate markdown content
                const result = await generateStepContent(title, description, block.title || prompt, block.type);
                if (result.content) {
                    if (block.type === "CODE") {
                        // For CODE type, extract code blocks with their explanations
                        // Pattern: Match code block followed by explanation text until next code block or end
                        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```(?:\s*\n*([\s\S]*?)(?=```|\n##|$))?/g;
                        const newCodeBlocks: StepBlock["codeBlocks"] = [];
                        let match;
                        let idx = block.codeBlocks.length; // Start from existing count to append
                        while ((match = codeBlockRegex.exec(result.content)) !== null) {
                            const language = match[1] || "javascript";
                            const code = match[2]?.trim() || "";
                            // Extract explanation text after the code block (before next code block)
                            let explanation = match[3]?.trim() || "";
                            // Clean up explanation - remove leading markdown headers from next section
                            explanation = explanation.split(/\n##/)[0]?.trim() || "";

                            newCodeBlocks.push({
                                order: idx,
                                title: `Example ${idx + 1}`,
                                language,
                                code,
                                explanation, // Put explanation in code block's explanation field
                                isRunnable: false,
                            });
                            idx++;
                        }

                        // Get intro text (content before first code block) for the main content field
                        const introMatch = result.content.match(/^([\s\S]*?)(?=```)/);
                        const introText = introMatch ? introMatch[1]?.trim() : "";

                        // APPEND new code blocks to existing ones instead of replacing
                        const mergedCodeBlocks = [...block.codeBlocks, ...newCodeBlocks];

                        // APPEND intro text to existing content
                        const mergedContent = block.content
                            ? `${block.content}\n\n${introText}`
                            : introText;

                        updateBlock(block.localId, {
                            content: mergedContent,
                            codeBlocks: mergedCodeBlocks,
                            isGenerating: false,
                        });
                    } else {
                        // For other types, APPEND content instead of replacing
                        const mergedContent = block.content
                            ? `${block.content}\n\n${result.content}`
                            : result.content;
                        updateBlock(block.localId, { content: mergedContent, isGenerating: false });
                    }
                    toast.success("Content generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            }
        } catch { toast.error("AI generation failed"); updateBlock(block.localId, { isGenerating: false }); }
    };

    // ==================== PUBLISH ====================

    const handlePublish = async () => {
        if (!LearnId) { toast.error("Save Learn first"); return; }
        const unsaved = blocks.filter(b => !b.isSaved && b.title);
        for (const b of unsaved) { await saveBlock(b); }
        setIsPublishing(true);
        try {
            const result = await publishLearn(LearnId);
            if (result.error) { toast.error(result.error); return; }
            toast.success("Learn published! 🎉");
            router.push("/learn/home");
        } catch { toast.error("Failed to publish"); }
        finally { setIsPublishing(false); }
    };

    // ==================== RENDER ====================

    const stepTypeInfo = STEP_TYPES.find(s => s.value === activeBlock?.type);
    const StepIcon = stepTypeInfo?.icon || FileText;

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">{LearnId ? "Edit Learn" : "Create Learn"}</h1>
                        <p className="text-xs text-muted-foreground">Build step-by-step learning content</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDraftsOpen(true)}
                        className="rounded-full relative"
                    >
                        <FileStack className="w-4 h-4 mr-1" />
                        Drafts
                        {
                            drafts.length > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-blue-600">
                                    {drafts.length}
                                </Badge>
                            )
                        }
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveLearn} disabled={isSavingLearn} className="rounded-full">
                        {isSavingLearn ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                        Save Draft
                    </Button>
                    <Button size="sm" onClick={handlePublish} disabled={isPublishing || !LearnId}
                        className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                        {isPublishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                        Publish
                    </Button>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-12 gap-0 min-h-0 overflow-hidden">
                <div className="col-span-4 border-r border-neutral-200 dark:border-neutral-800 flex flex-col min-h-0">
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <CardHeader className="pb-3 pt-4 px-4">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <span className="text-xl cursor-pointer">{iconEmoji}</span>
                                        Learn Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 space-y-3 w-full">
                                    {(mainCategoryName || subCategoryName) && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                            {mainCategoryName && <span className="font-medium text-primary">{mainCategoryName}</span>}
                                            {subCategoryName && (
                                                <>
                                                    <ChevronRight className="w-3 h-3" />
                                                    <span className="font-medium text-primary">{subCategoryName}</span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <div className="w-full flex flex-col">
                                        <Label className="text-left text-xs font-medium text-muted-foreground">Title *</Label>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Understanding React Hooks" className="mt-1 text-sm h-9" />
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <Label className="text-left text-xs font-medium text-muted-foreground">Description *</Label>
                                        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={1} className="mt-1 text-sm" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="w-full flex flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Difficulty</Label>
                                            <Select value={difficulty} onValueChange={v => setDifficulty(v as LearnDifficulty)}>
                                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex w-full flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Time (min)</Label>
                                            <Input type="number" value={estimatedTime} onChange={e => setEstimatedTime(Number(e.target.value))} className="mt-1 h-8 text-xs" />
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <Label className="text-left text-xs font-medium text-muted-foreground">Tags</Label>
                                        <div className="flex flex-wrap gap-1 mt-1 mb-1">
                                            {
                                                tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-[10px] cursor-pointer h-5" onClick={() => setTags(tags.filter(t => t !== tag))}>
                                                        {tag} ×
                                                    </Badge>
                                                ))
                                            }
                                        </div>
                                        <Input value={tagInput} onChange={e => setTagInput(e.target.value)} className="h-8 text-xs"
                                            onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { e.preventDefault(); setTags([...tags, tagInput.trim().toLowerCase()]); setTagInput(""); } }}
                                            placeholder="Type a tag, press Enter" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-xs flex items-center gap-1.5">
                                        <Link2 className="w-3.5 h-3.5 text-blue-500" />
                                        Prerequisite Learns
                                    </CardTitle>
                                    <p className="text-[10px] text-muted-foreground">Link previous Learns users should learn first</p>
                                </CardHeader>
                                <CardContent className="px-4 pb-3 space-y-2">
                                    {
                                        linkedPrereqs.length > 0 && (
                                            <div className="space-y-1">
                                                {
                                                    linkedPrereqs.map(prereq => (
                                                        <div key={prereq.id} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <span className="text-sm flex-shrink-0">{prereq.iconEmoji || "📚"}</span>
                                                                <span className="text-xs font-medium truncate">{prereq.title}</span>
                                                            </div>
                                                            <button onClick={() => removePrereq(prereq.id)} className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 flex-shrink-0">
                                                                <X className="w-3 h-3 text-red-500" />
                                                            </button>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }

                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                        <Input
                                            value={prereqSearch}
                                            onChange={e => handlePrereqSearch(e.target.value)}
                                            placeholder={LearnId ? "Search Learns..." : "Save Learn first to link"}
                                            className="h-7 text-xs pl-7"
                                            disabled={!LearnId}
                                        />
                                        {isSearchingPrereqs && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin" />}
                                    </div>

                                    {
                                        prereqResults.length > 0 && (
                                            <div className="border rounded-lg divide-y divide-neutral-100 dark:divide-neutral-800 max-h-40 overflow-y-auto">
                                                {
                                                    prereqResults.map(learn => (
                                                        <button key={learn.id} onClick={() => addPrereq(learn)}
                                                            className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5">
                                                            <span className="text-sm">{learn.iconEmoji || "📚"}</span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium truncate">{learn.title}</p>
                                                                <p className="text-[10px] text-muted-foreground">{learn.category} · {learn.difficulty}</p>
                                                            </div>
                                                            <Plus className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )
                                    }
                                </CardContent>
                            </Card>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" /> Steps ({blocks.length})
                                    </h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
                                                <Plus className="w-3 h-3 mr-1" /> Add
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            {
                                                STEP_TYPES.map(t => {
                                                    const Icon = t.icon;
                                                    return (
                                                        <DropdownMenuItem key={t.value} onClick={() => addBlock(t.value)} className="flex items-center gap-2 py-2">
                                                            <Icon className={`w-4 h-4 ${t.color}`} />
                                                            <div>
                                                                <p className="text-xs font-medium">{t.label}</p>
                                                                <p className="text-[10px] text-muted-foreground">{t.description}</p>
                                                            </div>
                                                        </DropdownMenuItem>
                                                    );
                                                })
                                            }
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-1.5">
                                    {
                                        blocks.map((block, index) => {
                                            const isActive = activeStepIndex === index;
                                            const typeInfo = STEP_TYPES.find(s => s.value === block.type);
                                            const TypeIcon = typeInfo?.icon || FileText;
                                            return (
                                                <div
                                                    key={block.localId}
                                                    onClick={() => setActiveStepIndex(index)}
                                                    className={cn(
                                                        "group relative p-3 rounded-xl border cursor-pointer transition-all duration-200",
                                                        isActive
                                                            ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 shadow-md"
                                                            : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <Badge variant="outline" className={cn("text-[10px] tracking-wider px-1.5 py-0",
                                                            isActive ? "text-white/70 border-white/20 dark:text-neutral-900/70 dark:border-neutral-900/20" : "text-muted-foreground"
                                                        )}>
                                                            STEP {index + 1}
                                                        </Badge>
                                                        <div className="flex items-center gap-1">
                                                            {block.isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                                            {block.isSaved && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                                            {
                                                                blocks.length > 1 && (
                                                                    <button onClick={(e) => { e.stopPropagation(); removeBlock(block.localId); }}
                                                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-500/20">
                                                                        <Trash2 className={cn("w-3 h-3", isActive ? "text-red-300" : "text-red-500")} />
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                    <h4 className="font-semibold text-xs truncate">{block.title || "Untitled Step"}</h4>
                                                    <div className={cn("flex items-center gap-1 mt-1.5", isActive ? "opacity-70" : "text-muted-foreground")}>
                                                        <TypeIcon className="w-3 h-3" />
                                                        <span className="text-[10px] uppercase font-semibold">{typeInfo?.label}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
                <div className="col-span-8 flex flex-col min-h-0 bg-white dark:bg-neutral-950">
                    {
                        activeBlock && (
                            <>
                                <div className="flex items-center gap-3 px-6 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50 flex-shrink-0">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", stepTypeInfo?.bgColor)}>
                                        <StepIcon className={cn("w-4 h-4", stepTypeInfo?.color)} />
                                    </div>
                                    <Input
                                        value={activeBlock.title}
                                        onChange={e => updateBlock(activeBlock.localId, { title: e.target.value })}
                                        placeholder={`Title for Step ${activeStepIndex + 1}`}
                                        className="text-lg font-bold bg-transparent border-0 px-0 h-auto focus-visible:ring-0 flex-1"
                                    />
                                    <Select value={activeBlock.type} onValueChange={v => updateBlock(activeBlock.localId, { type: v as LearnStepType })}>
                                        <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {
                                                STEP_TYPES.map(t => {
                                                    const Icon = t.icon;
                                                    return <SelectItem key={t.value} value={t.value}><span className="flex items-center gap-1.5"><Icon className={`w-3 h-3 ${t.color}`} />{t.label}</span></SelectItem>;
                                                })
                                            }
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-1.5 ml-2">
                                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPreviewMode(!previewMode)}>
                                            {previewMode ? <><FileEdit className="w-3 h-3 mr-1" /> Edit</> : <><Eye className="w-3 h-3 mr-1" /> Preview</>}
                                        </Button>
                                        <Button size="sm" onClick={() => saveBlock(activeBlock)} disabled={activeBlock.isSaving || !activeBlock.title} className="h-7 text-xs">
                                            {activeBlock.isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="p-6 space-y-6 max-w-4xl mx-auto pb-32">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeBlock.localId + activeBlock.type}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                className="space-y-6"
                                            >
                                                {
                                                    activeBlock.type === "EXPLANATION" && (
                                                        <ContentEditor block={activeBlock} updateBlock={updateBlock} previewMode={previewMode} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "CODE" && (
                                                        <CodeBlockEditor block={activeBlock} updateBlock={updateBlock} previewMode={previewMode} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "QUIZ" && (
                                                        <QuizDataEditor block={activeBlock} updateBlock={updateBlock} LearnTitle={title} LearnDescription={description} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "CHALLENGE" && (
                                                        <ChallengeDataEditor block={activeBlock} updateBlock={updateBlock} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "COMPARISON" && (
                                                        <ComparisonDataViewer block={activeBlock} updateBlock={updateBlock} previewMode={previewMode} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "SUMMARY" && (
                                                        <ContentEditor block={activeBlock} updateBlock={updateBlock} previewMode={previewMode} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "RESOURCE" && (
                                                        <ResourceEditor block={activeBlock} updateBlock={updateBlock} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "VISUAL" && (
                                                        <VisualDataEditor block={activeBlock} updateBlock={updateBlock} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "MOCK_INTERVIEW" && (
                                                        <MockInterviewEditor block={activeBlock} updateBlock={updateBlock} LearnTitle={title} LearnDescription={description} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "PROJECT" && (
                                                        <ProjectEditor block={activeBlock} updateBlock={updateBlock} LearnTitle={title} LearnDescription={description} />
                                                    )
                                                }
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </ScrollArea>
                                <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 p-4">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-purple-500" />
                                            <span className="text-xs font-semibold text-muted-foreground">AI Content Generator</span>
                                            <span className="text-[10px] text-muted-foreground ml-auto">
                                                {activeBlock.type === "EXPLANATION" && "Describe what to explain..."}
                                                {activeBlock.type === "CODE" && "Describe code examples needed..."}
                                                {activeBlock.type === "QUIZ" && "Describe quiz topic..."}
                                                {activeBlock.type === "CHALLENGE" && "Describe the challenge..."}
                                                {activeBlock.type === "COMPARISON" && "Describe what to compare..."}
                                                {activeBlock.type === "SUMMARY" && "Describe summary needed..."}
                                                {activeBlock.type === "RESOURCE" && "Describe resources to find..."}
                                                {activeBlock.type === "VISUAL" && "Describe visual/diagram needed..."}
                                                {activeBlock.type === "MOCK_INTERVIEW" && "Describe interview scenario..."}
                                                {activeBlock.type === "PROJECT" && "Describe project idea..."}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                value={aiPrompt}
                                                onChange={e => setAiPrompt(e.target.value)}
                                                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && aiPrompt.trim()) { e.preventDefault(); handleAiGenerate(aiPrompt); } }}
                                                placeholder={`Tell AI what to generate for this ${stepTypeInfo?.label} step...`}
                                                className="flex-1 bg-white dark:bg-neutral-900 text-sm"
                                                disabled={activeBlock.isGenerating}
                                            />
                                            <Button onClick={() => handleAiGenerate(aiPrompt)} disabled={activeBlock.isGenerating || !aiPrompt.trim()}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                                                {activeBlock.isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </div>
            </div>
            <Sheet open={draftsOpen} onOpenChange={setDraftsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-xl flex items-center gap-2">
                            <FileStack className="w-5 h-5 text-blue-500" />
                            Your Drafts
                        </SheetTitle>
                        <SheetDescription>
                            {
                                drafts.length === 0
                                    ? "No drafts yet. Start creating to save your work!"
                                    : `${drafts.length} draft${drafts.length > 1 ? 's' : ''} in progress`
                            }
                        </SheetDescription>
                    </SheetHeader>

                    {
                        loadingDrafts ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : drafts.length === 0 ? (
                            <div className="text-center py-12">
                                <FileStack className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground">No drafts found</p>
                                <p className="text-xs text-muted-foreground mt-1">Your saved Learns will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {
                                    drafts.map(draft => (
                                        <button
                                            key={draft.id}
                                            onClick={() => handleDraftClick(draft)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-xl border transition-all hover:shadow-md",
                                                draft.id === LearnId
                                                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                                                    : "border-neutral-200 dark:border-neutral-800 hover:border-blue-300 bg-white dark:bg-neutral-900"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{draft.iconEmoji || "📚"}</span>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-sm truncate">{draft.title}</h3>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                        {draft.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className={cn(
                                                                "text-[10px]",
                                                                draft.status === "PENDING_VERIFICATION"
                                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                                            )}
                                                        >
                                                            {draft.status === "PENDING_VERIFICATION" ? "Pending" : "Draft"}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {draft._count.steps} steps
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            Updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                                {
                                                    draft.id === LearnId && (
                                                        <Badge className="bg-blue-600 text-white text-[10px]">Current</Badge>
                                                    )
                                                }
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        )
                    }
                </SheetContent>
            </Sheet>
        </div>
    );
}