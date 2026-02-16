"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    Plus, Trash2, Save, Eye, ArrowLeft, Sparkles, Loader2, BookOpen,
    Code2, HelpCircle, Zap, BarChart3, CheckCircle2, FileText, Video,
    Globe, Send, FileEdit, X, Link2, Search, FileStack, Coins,
    AlertCircle
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
import { Switch } from "@repo/ui/components/ui/switch";
import { Separator } from "@repo/ui/components/ui/separator";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
    Alert, AlertDescription
} from "@repo/ui/components/ui/alert";
import toast from "@repo/ui/components/ui/sonner";
import { cn } from "@repo/ui/lib/utils";
import {
    ConceptCategory, ConceptDifficulty, ConceptStepType, ConceptPricingType
} from "@repo/prisma/client";
import {
    createConcept, addConceptStep, updateConceptStep, deleteConceptStep,
    updateConcept, publishConcept, addCodeBlock, searchConcepts, 
    addPrerequisiteConcept, removePrerequisiteConcept, getUserDraftConcepts, 
    getConceptForEditing,
} from "@/actions/(main)/concepts/concept.action";
import {
    generateStepContent, generateQuizQuestion, generateChallenge,
    generateResources, generateComparison
} from "@/actions/(main)/concepts/concept-ai.action";
import CodeEditor from "@/components/main/code-editor";
import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import { formatDistanceToNow } from "date-fns";

// ==================== TYPES ====================

interface DraftConcept {
    id: string;
    slug: string;
    title: string;
    description: string;
    iconEmoji: string | null;
    status: string;
    updatedAt: Date;
    _count: { steps: number };
}

interface StepBlock {
    id: string;
    localId: string;
    order: number;
    title: string;
    type: ConceptStepType;
    content: string;
    stepData?: Record<string, unknown>;
    tips: string[];
    codeBlocks: { id?: string; order: number; title: string; language: string; code: string; explanation: string; isRunnable: boolean }[];
    isExpanded: boolean;
    isSaved: boolean;
    isSaving: boolean;
    isGenerating: boolean;
}

const STEP_TYPES: { value: ConceptStepType; label: string; icon: LucideIcon; color: string; bgColor: string; description: string }[] = [
    { value: "EXPLANATION", label: "Explanation", icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-500/10 border-blue-500/20", description: "Teach a concept with markdown" },
    { value: "CODE", label: "Code", icon: Code2, color: "text-green-500", bgColor: "bg-green-500/10 border-green-500/20", description: "Code examples with editor" },
    { value: "QUIZ", label: "Quiz", icon: HelpCircle, color: "text-pink-500", bgColor: "bg-pink-500/10 border-pink-500/20", description: "Test understanding" },
    { value: "CHALLENGE", label: "Challenge", icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-500/10 border-yellow-500/20", description: "Hands-on coding challenge" },
    { value: "COMPARISON", label: "Comparison", icon: BarChart3, color: "text-orange-500", bgColor: "bg-orange-500/10 border-orange-500/20", description: "Compare approaches" },
    { value: "SUMMARY", label: "Summary", icon: CheckCircle2, color: "text-teal-500", bgColor: "bg-teal-500/10 border-teal-500/20", description: "Key takeaways" },
    { value: "RESOURCE", label: "Resources", icon: Video, color: "text-purple-500", bgColor: "bg-purple-500/10 border-purple-500/20", description: "Videos & docs" },
];

const CATEGORIES = Object.values(ConceptCategory);
const DIFFICULTIES = Object.values(ConceptDifficulty);

function createEmptyBlock(order: number, type: ConceptStepType = "EXPLANATION"): StepBlock {
    return {
        id: "", localId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        order, title: "", type, content: "", stepData: undefined, tips: [],
        codeBlocks: [], isExpanded: true, isSaved: false, isSaving: false, isGenerating: false,
    };
}

// ==================== COMPONENT ====================

export default function ConceptBlockEditor() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    // Drafts state
    const [drafts, setDrafts] = useState<DraftConcept[]>([]);
    const [draftsOpen, setDraftsOpen] = useState(false);
    const [loadingDrafts, setLoadingDrafts] = useState(false);

    // Concept metadata
    const [conceptId, setConceptId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<ConceptCategory>("PROGRAMMING_FUNDAMENTALS");
    const [difficulty, setDifficulty] = useState<ConceptDifficulty>("BEGINNER");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [iconEmoji, setIconEmoji] = useState("📚");
    const [accentColor, setAccentColor] = useState("#3B82F6");
    const [estimatedTime, setEstimatedTime] = useState(10);
    const [prerequisites, setPrerequisites] = useState<string[]>([]);

    // Pricing state
    const [pricingType, setPricingType] = useState<ConceptPricingType>("FREE");
    const [price, setPrice] = useState(0);

    // Steps (blocks)
    const [blocks, setBlocks] = useState<StepBlock[]>([createEmptyBlock(0)]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [isSavingConcept, setIsSavingConcept] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // AI prompt state
    const [aiPrompt, setAiPrompt] = useState("");

    // Prerequisite concepts state
    const [prereqSearch, setPrereqSearch] = useState("");
    const [prereqResults, setPrereqResults] = useState<{ id: string; title: string; iconEmoji: string | null; slug: string; difficulty: string; category: string }[]>([]);
    const [linkedPrereqs, setLinkedPrereqs] = useState<{ id: string; title: string; iconEmoji: string | null; slug: string }[]>([]);
    const [isSearchingPrereqs, setIsSearchingPrereqs] = useState(false);

    // Load drafts on mount
    useEffect(() => {
        loadDrafts();
    }, []);

    // Load concept for editing if editId is present
    useEffect(() => {
        if (editId) {
            loadConceptForEditing(editId);
        }
    }, [editId]);

    const loadDrafts = async () => {
        setLoadingDrafts(true);
        try {
            const result = await getUserDraftConcepts();
            if (result.drafts) {
                setDrafts(result.drafts as DraftConcept[]);
            }
        } catch (error) {
            console.error("Failed to load drafts:", error);
        } finally {
            setLoadingDrafts(false);
        }
    };

    const loadConceptForEditing = async (id: string) => {
        try {
            const result = await getConceptForEditing(id);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            if (result.concept) {
                const c = result.concept;
                setConceptId(c.id);
                setTitle(c.title);
                setDescription(c.description);
                setCategory(c.category);
                setDifficulty(c.difficulty);
                setTags(c.tags);
                setIconEmoji(c.iconEmoji || "📚");
                setAccentColor(c.accentColor || "#3B82F6");
                setEstimatedTime(c.estimatedTime || 10);
                setPrerequisites(c.prerequisites);
                setPricingType(c.pricingType || "FREE");
                setPrice(c.price || 0);

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
                toast.success("Concept loaded for editing");
            }
        } catch (error) {
            console.error("Failed to load concept:", error);
            toast.error("Failed to load concept");
        }
    };

    const handleDraftClick = (draft: DraftConcept) => {
        setDraftsOpen(false);
        router.push(`/concepts/create?edit=${draft.id}`);
    };

    // Search prerequisites
    const handlePrereqSearch = useCallback(async (query: string) => {
        setPrereqSearch(query);
        if (query.length < 2) { setPrereqResults([]); return; }
        setIsSearchingPrereqs(true);
        try {
            const result = await searchConcepts(query, conceptId || undefined);
            if (result.concepts) {
                setPrereqResults(result.concepts.filter(c => !linkedPrereqs.some(l => l.id === c.id)));
            }
        } catch { setPrereqResults([]); }
        finally { setIsSearchingPrereqs(false); }
    }, [conceptId, linkedPrereqs]);

    const addPrereq = useCallback(async (prereq: { id: string; title: string; iconEmoji: string | null; slug: string }) => {
        if (!conceptId) { toast.error("Save the concept first before adding prerequisites"); return; }
        const result = await addPrerequisiteConcept(conceptId, prereq.id);
        if (result.error) { toast.error(result.error); return; }
        setLinkedPrereqs(prev => [...prev, prereq]);
        setPrereqSearch("");
        setPrereqResults([]);
        toast.success(`Linked "${prereq.title}" as prerequisite`);
    }, [conceptId]);

    const removePrereq = useCallback(async (prereqId: string) => {
        if (!conceptId) return;
        const result = await removePrerequisiteConcept(conceptId, prereqId);
        if (result.error) { toast.error(result.error); return; }
        setLinkedPrereqs(prev => prev.filter(p => p.id !== prereqId));
        toast.success("Prerequisite removed");
    }, [conceptId]);

    const activeBlock = blocks[activeStepIndex] ?? blocks[0]!;

    // ==================== CONCEPT SAVE ====================

    const saveConcept = useCallback(async () => {
        if (!title.trim()) { toast.error("Title is required"); return null; }
        if (!description.trim()) { toast.error("Description is required"); return null; }
        setIsSavingConcept(true);
        try {
            if (conceptId) {
                const result = await updateConcept(conceptId, {
                    title, description, category, difficulty, tags,
                    iconEmoji, accentColor, estimatedTime, prerequisites,
                    pricingType, price: pricingType === "PAID" ? price : 0,
                });
                if (result.error) { toast.error(result.error); return null; }
                toast.success("Concept updated!");
                loadDrafts(); // Refresh drafts
                return conceptId;
            } else {
                const result = await createConcept({
                    title, description, category, difficulty, tags,
                    iconEmoji, accentColor, estimatedTime, prerequisites,
                    pricingType, price: pricingType === "PAID" ? price : 0,
                });
                if (result.error) { toast.error(result.error); return null; }
                setConceptId(result.concept!.id);
                toast.success("Concept created!");
                loadDrafts(); // Refresh drafts
                return result.concept!.id;
            }
        } catch { toast.error("Failed to save concept"); return null; }
        finally { setIsSavingConcept(false); }
    }, [conceptId, title, description, category, difficulty, tags, iconEmoji, accentColor, estimatedTime, prerequisites, pricingType, price]);

    // ==================== BLOCK SAVE ====================

    const saveBlock = useCallback(async (block: StepBlock) => {
        let cId = conceptId;
        if (!cId) { cId = await saveConcept(); if (!cId) return; }
        setBlocks(prev => prev.map(b => b.localId === block.localId ? { ...b, isSaving: true } : b));
        try {
            if (block.id) {
                const result = await updateConceptStep(block.id, {
                    title: block.title, type: block.type, content: block.content,
                    stepData: block.stepData, tips: block.tips, order: block.order,
                });
                if (result.error) { toast.error(result.error); return; }
                setBlocks(prev => prev.map(b => b.localId === block.localId ? { ...b, isSaved: true, isSaving: false } : b));
            } else {
                const result = await addConceptStep(cId, {
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
    }, [conceptId, saveConcept]);

    // ==================== BLOCK OPERATIONS ====================

    const addBlock = (type: ConceptStepType) => {
        const newOrder = blocks.length;
        setBlocks(prev => [...prev, createEmptyBlock(newOrder, type)]);
        setActiveStepIndex(newOrder);
    };

    const removeBlock = async (localId: string) => {
        const block = blocks.find(b => b.localId === localId);
        if (block?.id) { await deleteConceptStep(block.id); }
        const newBlocks = blocks.filter(b => b.localId !== localId).map((b, i) => ({ ...b, order: i }));
        setBlocks(newBlocks);
        if (activeStepIndex >= newBlocks.length) setActiveStepIndex(Math.max(0, newBlocks.length - 1));
    };

    const updateBlock = (localId: string, updates: Partial<StepBlock>) => {
        setBlocks(prev => prev.map(b => b.localId === localId ? { ...b, ...updates, isSaved: false } : b));
    };

    // ==================== AI GENERATION ====================

    const handleAiGenerate = async (prompt: string) => {
        const block = activeBlock;
        if (!block || !prompt.trim()) return;
        if (!title.trim()) { toast.error("Please set a concept title first"); return; }

        updateBlock(block.localId, { isGenerating: true });
        setAiPrompt("");

        try {
            if (block.type === "QUIZ") {
                const result = await generateQuizQuestion(title, description, block.title || prompt, block.content || prompt);
                if (result.quiz) {
                    updateBlock(block.localId, {
                        content: block.content || `## ${block.title || "Quiz"}`,
                        stepData: { question: result.quiz.question, options: result.quiz.options, explanation: result.quiz.explanation },
                        isGenerating: false,
                    });
                    toast.success("Quiz generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else if (block.type === "CHALLENGE") {
                const result = await generateChallenge(title, description, block.title || prompt, block.content || prompt);
                if (result.challenge) {
                    updateBlock(block.localId, {
                        content: result.challenge.description,
                        stepData: {
                            starterCode: result.challenge.starterCode, solution: result.challenge.solution,
                            hints: result.challenge.hints, testCases: result.challenge.testCases, language: result.challenge.language,
                        },
                        isGenerating: false,
                    });
                    toast.success("Challenge generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else if (block.type === "RESOURCE") {
                const result = await generateResources(title, block.title || prompt, category, difficulty);
                if (result.resources) {
                    updateBlock(block.localId, {
                        content: block.content || `## Resources for ${block.title || title}`,
                        stepData: { videos: result.resources.videos, docs: result.resources.docs },
                        isGenerating: false,
                    });
                    toast.success("Resources found!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else if (block.type === "COMPARISON") {
                const topics = (block.title || prompt).split(/\s+vs\.?\s+/i);
                const result = await generateComparison(title, description, block.title || prompt, topics.length > 1 ? topics : [block.title || prompt]);
                if (result.comparison) {
                    updateBlock(block.localId, {
                        content: block.content || `## ${block.title}`,
                        stepData: { items: result.comparison.items, conclusion: result.comparison.conclusion },
                        isGenerating: false,
                    });
                    toast.success("Comparison generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            } else {
                // EXPLANATION, CODE, SUMMARY — generate markdown content
                const result = await generateStepContent(title, description, block.title || prompt, block.type);
                if (result.content) {
                    if (block.type === "CODE") {
                        // For CODE type, put generated content into explanation and try to extract code blocks
                        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                        const codeBlocks: StepBlock["codeBlocks"] = [];
                        let match;
                        let idx = 0;
                        while ((match = codeBlockRegex.exec(result.content)) !== null) {
                            codeBlocks.push({
                                order: idx, title: `Example ${idx + 1}`, language: match[1] || "javascript",
                                code: match[2]?.trim() || "", explanation: "", isRunnable: false,
                            });
                            idx++;
                        }
                        // Remove code blocks from content to get just the explanation
                        const explanationText = result.content.replace(/```(\w+)?\n[\s\S]*?```/g, "").trim();
                        updateBlock(block.localId, {
                            content: explanationText,
                            codeBlocks: codeBlocks.length > 0 ? codeBlocks : block.codeBlocks,
                            isGenerating: false,
                        });
                    } else {
                        updateBlock(block.localId, { content: result.content, isGenerating: false });
                    }
                    toast.success("Content generated!");
                } else { toast.error(result.error || "Failed"); updateBlock(block.localId, { isGenerating: false }); }
            }
        } catch { toast.error("AI generation failed"); updateBlock(block.localId, { isGenerating: false }); }
    };

    // ==================== PUBLISH ====================

    const handlePublish = async () => {
        if (!conceptId) { toast.error("Save concept first"); return; }
        const unsaved = blocks.filter(b => !b.isSaved && b.title);
        for (const b of unsaved) { await saveBlock(b); }
        setIsPublishing(true);
        try {
            const result = await publishConcept(conceptId);
            if (result.error) { toast.error(result.error); return; }
            if (result.pendingVerification) {
                toast.success("Concept submitted for verification! 🎉 An admin will review it shortly.");
            } else {
                toast.success("Concept published! 🎉");
            }
            router.push("/concepts/home");
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
                        <h1 className="text-lg font-bold tracking-tight">{conceptId ? "Edit Concept" : "Create Concept"}</h1>
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
                    <Button variant="outline" size="sm" onClick={saveConcept} disabled={isSavingConcept} className="rounded-full">
                        {isSavingConcept ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                        Save Draft
                    </Button>
                    <Button size="sm" onClick={handlePublish} disabled={isPublishing || !conceptId}
                        className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                        {isPublishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                        Send for Verification
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
                                        Concept Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 pb-4 space-y-3 w-full">
                                    <div className="w-full flex flex-col">
                                        <Label className="text-left text-xs font-medium text-muted-foreground">Title *</Label>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Understanding React Hooks" className="mt-1 text-sm h-9" />
                                    </div>
                                    <div className="w-full flex flex-col">
                                        <Label className="text-left text-xs font-medium text-muted-foreground">Description *</Label>
                                        <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." rows={2} className="mt-1 text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="w-full flex flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Category</Label>
                                            <Select value={category} onValueChange={v => setCategory(v as ConceptCategory)}>
                                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c.replace(/_/g, " ")}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-full flex flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Difficulty</Label>
                                            <Select value={difficulty} onValueChange={v => setDifficulty(v as ConceptDifficulty)}>
                                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex w-full flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Time (min)</Label>
                                            <Input type="number" value={estimatedTime} onChange={e => setEstimatedTime(Number(e.target.value))} className="mt-1 h-8 text-xs" />
                                        </div>
                                        <div className="w-full flex flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Accent</Label>
                                            <div className="flex items-center gap-1 mt-1">
                                                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0" />
                                                <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 h-8 text-xs" />
                                            </div>
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
                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                        Monetization
                                    </CardTitle>
                                    <p className="text-[10px] text-muted-foreground">Set pricing for your concept</p>
                                </CardHeader>
                                <CardContent className="px-4 pb-3 space-y-3">
                                    <div className="w-full flex flex-col">
                                        <Label className="text-left text-xs font-medium text-muted-foreground mb-2">Access Type</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setPricingType("FREE"); setPrice(0); }}
                                                className={cn(
                                                    "p-3 rounded-lg border-2 transition-all text-left",
                                                    pricingType === "FREE"
                                                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Globe className={cn("w-4 h-4", pricingType === "FREE" ? "text-green-600" : "text-muted-foreground")} />
                                                    <span className={cn("text-xs font-semibold", pricingType === "FREE" ? "text-green-700 dark:text-green-400" : "")}>Free</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">Anyone can access</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPricingType("PAID")}
                                                className={cn(
                                                    "p-3 rounded-lg border-2 transition-all text-left",
                                                    pricingType === "PAID"
                                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Coins className={cn("w-4 h-4", pricingType === "PAID" ? "text-amber-600" : "text-muted-foreground")} />
                                                    <span className={cn("text-xs font-semibold", pricingType === "PAID" ? "text-amber-700 dark:text-amber-400" : "")}>Paid</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">Earn credits</p>
                                            </button>
                                        </div>
                                    </div>

                                    {
                                        pricingType === "PAID" && (
                                            <div className="space-y-3">
                                                <div className="w-full flex flex-col">
                                                    <Label className="text-left text-xs font-medium text-muted-foreground">Price (Credits)</Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={price}
                                                        onChange={e => setPrice(Math.max(1, Number(e.target.value)))}
                                                        className="mt-1 h-8 text-xs"
                                                        placeholder="e.g. 10"
                                                    />
                                                </div>
                                                {
                                                    price > 0 && (
                                                        <Alert className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                                            <AlertDescription className="text-xs">
                                                                <div className="flex justify-between">
                                                                    <span>Platform fee (10%):</span>
                                                                    <span className="font-medium">{Math.floor(price * 0.1)} credits</span>
                                                                </div>
                                                                <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                                                                    <span>You earn:</span>
                                                                    <span>{price - Math.floor(price * 0.1)} credits</span>
                                                                </div>
                                                            </AlertDescription>
                                                        </Alert>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </CardContent>
                            </Card>
                            <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-xs flex items-center gap-1.5">
                                        <Link2 className="w-3.5 h-3.5 text-blue-500" />
                                        Prerequisite Concepts
                                    </CardTitle>
                                    <p className="text-[10px] text-muted-foreground">Link previous concepts users should learn first</p>
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
                                            placeholder={conceptId ? "Search concepts..." : "Save concept first to link"}
                                            className="h-7 text-xs pl-7"
                                            disabled={!conceptId}
                                        />
                                        {isSearchingPrereqs && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin" />}
                                    </div>

                                    {
                                        prereqResults.length > 0 && (
                                            <div className="border rounded-lg divide-y divide-neutral-100 dark:divide-neutral-800 max-h-40 overflow-y-auto">
                                                {
                                                    prereqResults.map(concept => (
                                                        <button key={concept.id} onClick={() => addPrereq(concept)}
                                                            className="w-full text-left px-2.5 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1.5">
                                                            <span className="text-sm">{concept.iconEmoji || "📚"}</span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-medium truncate">{concept.title}</p>
                                                                <p className="text-[10px] text-muted-foreground">{concept.category.replace(/_/g, " ")} · {concept.difficulty}</p>
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
                                    <Select value={activeBlock.type} onValueChange={v => updateBlock(activeBlock.localId, { type: v as ConceptStepType })}>
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
                                    <div className="p-6 space-y-6 max-w-4xl mx-auto">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeBlock.localId + activeBlock.type}
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                className="space-y-6"
                                            >
                                                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 p-4">
                                                    <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                                        AI Content Generator
                                                    </Label>
                                                    <p className="text-[11px] text-muted-foreground mb-3">
                                                        {activeBlock.type === "EXPLANATION" && "Describe what you want explained, e.g. \"Create a detailed explanation of React Hooks covering useState, useEffect, and custom hooks\""}
                                                        {activeBlock.type === "CODE" && "Describe code examples you need, e.g. \"Create code examples for React hooks with detailed comments\""}
                                                        {activeBlock.type === "QUIZ" && "Describe the quiz topic, e.g. \"Generate a quiz about React useState and useEffect hooks\""}
                                                        {activeBlock.type === "CHALLENGE" && "Describe the challenge, e.g. \"Create a coding challenge to build a custom useDebounce hook\""}
                                                        {activeBlock.type === "COMPARISON" && "Describe what to compare, e.g. \"Compare useState vs useReducer for state management\""}
                                                        {activeBlock.type === "SUMMARY" && "Describe the summary needed, e.g. \"Summarize all React hooks concepts covered\""}
                                                        {activeBlock.type === "RESOURCE" && "Describe resources to find, e.g. \"Find best YouTube tutorials and docs for React hooks\""}
                                                    </p>
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
                                                        <QuizDataEditor block={activeBlock} updateBlock={updateBlock} />
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
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </ScrollArea>
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
                                <p className="text-xs text-muted-foreground mt-1">Your saved concepts will appear here</p>
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
                                                draft.id === conceptId
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
                                                    draft.id === conceptId && (
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

// ==================== SUB-COMPONENTS ====================

function ContentEditor({ block, updateBlock, previewMode }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void; previewMode: boolean }) {
    return (
        <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Content (Markdown)</Label>
            {
                previewMode ? (
                    <div className="p-6 border rounded-xl bg-white dark:bg-neutral-900 max-w-none min-h-[300px]">
                        <MarkdownRenderer content={block.content || "*No content yet. Use the AI generator above or switch to Edit mode.*"} />
                    </div>
                ) : (
                    <Textarea value={block.content} onChange={e => updateBlock(block.localId, { content: e.target.value })}
                        placeholder="Content will be generated by AI, or you can write/edit markdown here..."
                        rows={16} className="font-mono text-sm" />
                )
            }
        </div>
    );
}

function CodeBlockEditor({ block, updateBlock, previewMode }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void; previewMode: boolean }) {
    const addCB = () => {
        const cbs = [...block.codeBlocks, { order: block.codeBlocks.length, title: "", language: "javascript", code: "", explanation: "", isRunnable: false }];
        updateBlock(block.localId, { codeBlocks: cbs });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Code Blocks</Label>
                    <Button variant="outline" size="sm" onClick={addCB} className="h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add Code Block
                    </Button>
                </div>
                {
                    block.codeBlocks.length === 0 && (
                        <div className="text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-muted-foreground">
                            <Code2 className="w-6 h-6 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">No code blocks yet. Use AI to generate or add manually.</p>
                        </div>
                    )
                }
                {
                    block.codeBlocks.map((cb, i) => (
                        <div key={i} className="border rounded-xl overflow-hidden bg-neutral-900 text-white shadow-sm">
                            <div className="flex items-center justify-between px-3 py-2 bg-neutral-800 border-b border-neutral-700">
                                <Input value={cb.title} onChange={e => { const cbs = [...block.codeBlocks]; cbs[i] = { ...cb, title: e.target.value }; updateBlock(block.localId, { codeBlocks: cbs }); }}
                                    placeholder="Code block title" className="bg-transparent border-0 text-white text-xs h-7 focus-visible:ring-0 w-48" />
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-neutral-400 hover:text-red-400" onClick={() => { const cbs = block.codeBlocks.filter((_, j) => j !== i); updateBlock(block.localId, { codeBlocks: cbs }); }}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                            <CodeEditor code={cb.code} language={cb.language} height="200px" showRunButton={false} showLanguageSelector
                                onChange={code => { const cbs = [...block.codeBlocks]; cbs[i] = { ...cb, code }; updateBlock(block.localId, { codeBlocks: cbs }); }}
                                onLanguageChange={lang => { const cbs = [...block.codeBlocks]; cbs[i] = { ...cb, language: lang }; updateBlock(block.localId, { codeBlocks: cbs }); }} />
                            <div className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 p-3">
                                <Textarea value={cb.explanation}
                                    onChange={e => { const cbs = [...block.codeBlocks]; cbs[i] = { ...cb, explanation: e.target.value }; updateBlock(block.localId, { codeBlocks: cbs }); }}
                                    placeholder="Explanation for this code block..."
                                    className="text-sm min-h-[60px] border-0 bg-transparent focus-visible:ring-0 p-0 resize-none" />
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Step Explanation</Label>
                {
                    previewMode ? (
                        <div className="p-4 border rounded-xl bg-white dark:bg-neutral-900 max-w-none min-h-[120px] text-sm">
                            <MarkdownRenderer content={block.content || "*No explanation yet.*"} />
                        </div>
                    ) : (
                        <Textarea value={block.content} onChange={e => updateBlock(block.localId, { content: e.target.value })}
                            placeholder="Explanation generated by AI will appear here, you can also edit..."
                            rows={5} className="text-sm" />
                    )
                }
            </div>
        </div>
    );
}

function QuizDataEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as { question?: string; options?: { id: string; text: string; isCorrect: boolean }[]; explanation?: string };
    const options = data.options || [];

    const update = (field: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...block.stepData, [field]: value } });
    };

    if (!data.question) {
        return (
            <div className="text-center p-10 border-2 border-dashed border-pink-200 dark:border-pink-900 rounded-2xl bg-pink-50/30 dark:bg-pink-950/10">
                <HelpCircle className="w-8 h-8 mx-auto mb-3 text-pink-400 opacity-50" />
                <p className="text-sm font-medium mb-1">No Quiz Generated Yet</p>
                <p className="text-xs text-muted-foreground">Use the AI generator above to create a quiz question.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/10 border border-pink-200 dark:border-pink-900">
            <Label className="text-xs font-bold text-pink-700 dark:text-pink-400 uppercase">Quiz Configuration</Label>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Question</Label>
                <Input value={data.question || ""} onChange={e => update("question", e.target.value)} className="bg-white dark:bg-neutral-950" />
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Options</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {
                        options.map((opt, i) => (
                            <div key={opt.id || i} className={cn("flex items-center gap-2 p-2.5 rounded-lg border bg-white dark:bg-neutral-950 transition-colors",
                                opt.isCorrect ? "border-green-500 ring-1 ring-green-500/20" : "border-neutral-200 dark:border-neutral-800")}>
                                <Switch checked={opt.isCorrect} onCheckedChange={checked => { const newOpts = [...options]; newOpts[i] = { ...opt, isCorrect: checked }; update("options", newOpts); }} />
                                <Input value={opt.text} onChange={e => { const newOpts = [...options]; newOpts[i] = { ...opt, text: e.target.value }; update("options", newOpts); }}
                                    placeholder={`Option ${i + 1}`} className="flex-1 border-0 h-7 text-sm bg-transparent focus-visible:ring-0" />
                                <button onClick={() => update("options", options.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-500">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    }
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => update("options", [...options, { id: `opt-${Date.now()}`, text: "", isCorrect: false }])}>
                    <Plus className="w-3 h-3 mr-1" /> Add Option
                </Button>
            </div>
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Explanation</Label>
                <Textarea value={data.explanation || ""} onChange={e => update("explanation", e.target.value)} placeholder="Why is this the correct answer..." rows={3} className="text-sm bg-white dark:bg-neutral-950" />
            </div>
        </div>
    );
}

function ChallengeDataEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as { starterCode?: string; solution?: string; hints?: string[]; language?: string };
    const update = (field: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...block.stepData, [field]: value } });
    };

    if (!data.starterCode && !block.content) {
        return (
            <div className="text-center p-10 border-2 border-dashed border-yellow-200 dark:border-yellow-900 rounded-2xl bg-yellow-50/30 dark:bg-yellow-950/10">
                <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-400 opacity-50" />
                <p className="text-sm font-medium mb-1">No Challenge Generated Yet</p>
                <p className="text-xs text-muted-foreground">Use the AI generator above to create a coding challenge.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 rounded-xl bg-yellow-50/50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900">
            <Label className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase">Challenge Configuration</Label>
            <div>
                <Label className="text-xs text-muted-foreground">Task Description</Label>
                <Textarea value={block.content} onChange={e => updateBlock(block.localId, { content: e.target.value })} rows={3} className="mt-1 text-sm bg-white dark:bg-neutral-950" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label className="text-xs text-muted-foreground">Starter Code</Label>
                    <div className="mt-1 rounded-xl overflow-hidden border border-yellow-200 dark:border-yellow-800">
                        <CodeEditor code={data.starterCode || ""} language={data.language || "javascript"} height="180px" showLanguageSelector
                            onChange={code => update("starterCode", code)} onLanguageChange={lang => update("language", lang)} />
                    </div>
                </div>
                <div>
                    <Label className="text-xs text-muted-foreground">Solution</Label>
                    <div className="mt-1 rounded-xl overflow-hidden border border-yellow-200 dark:border-yellow-800">
                        <CodeEditor code={data.solution || ""} language={data.language || "javascript"} height="180px" showLanguageSelector={false}
                            onChange={code => update("solution", code)} />
                    </div>
                </div>
            </div>
            <div>
                <Label className="text-xs text-muted-foreground">Hints</Label>
                {
                    (data.hints || []).map((hint, i) => (
                        <div key={i} className="flex items-center gap-2 mt-1">
                            <Input value={hint} onChange={e => { const hints = [...(data.hints || [])]; hints[i] = e.target.value; update("hints", hints); }} className="flex-1 text-sm h-8" />
                            <button onClick={() => update("hints", (data.hints || []).filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-500">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                }
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => update("hints", [...(data.hints || []), ""])}>
                    <Plus className="w-3 h-3 mr-1" /> Add Hint
                </Button>
            </div>
        </div>
    );
}

function ComparisonDataViewer({ block, updateBlock: _updateBlock, previewMode: _previewMode }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void; previewMode: boolean }) {
    const data = (block.stepData || {}) as { items?: { title: string; description: string; pros: string[]; cons: string[] }[]; conclusion?: string };

    if (!data.items?.length) {
        return (
            <div className="text-center p-10 border-2 border-dashed border-orange-200 dark:border-orange-900 rounded-2xl bg-orange-50/30 dark:bg-orange-950/10">
                <BarChart3 className="w-8 h-8 mx-auto mb-3 text-orange-400 opacity-50" />
                <p className="text-sm font-medium mb-1">No Comparison Generated Yet</p>
                <p className="text-xs text-muted-foreground">Use the AI generator above to create a comparison.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Label className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase">Comparison</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {
                    data.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl border bg-orange-50/50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-800">
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            {item.pros?.length > 0 && <div className="mt-2 space-y-0.5">{item.pros.map((p, j) => <p key={j} className="text-xs text-green-600">✓ {p}</p>)}</div>}
                            {item.cons?.length > 0 && <div className="mt-1 space-y-0.5">{item.cons.map((c, j) => <p key={j} className="text-xs text-red-500">✗ {c}</p>)}</div>}
                        </div>
                    ))
                }
            </div>
            {
                data.conclusion && (
                    <div className="p-3 rounded-lg bg-orange-100/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                        <p className="text-xs font-medium">Conclusion:</p>
                        <p className="text-xs text-muted-foreground mt-1">{data.conclusion}</p>
                    </div>
                )
            }
        </div>
    );
}

function ResourceEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as { videos?: { url: string; title?: string; duration?: string }[]; docs?: { url: string; title?: string; type?: string }[] };
    const videos = data.videos || [];
    const docs = data.docs || [];

    const [newVideoUrl, setNewVideoUrl] = useState("");
    const [newVideoTitle, setNewVideoTitle] = useState("");
    const [newDocUrl, setNewDocUrl] = useState("");
    const [newDocTitle, setNewDocTitle] = useState("");

    const updateData = (field: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...block.stepData, [field]: value } });
    };

    const addVideo = () => {
        if (!newVideoUrl.trim()) return;
        updateData("videos", [...videos, { url: newVideoUrl.trim(), title: newVideoTitle.trim() || undefined }]);
        setNewVideoUrl(""); setNewVideoTitle("");
    };

    const addDoc = () => {
        if (!newDocUrl.trim()) return;
        updateData("docs", [...docs, { url: newDocUrl.trim(), title: newDocTitle.trim() || undefined }]);
        setNewDocUrl(""); setNewDocTitle("");
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Videos
                </Label>

                {
                    videos.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                            <span className="text-sm">🎬</span>
                            <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate">
                                {v.title || v.url}
                            </a>
                            {v.duration && <span className="text-[10px] text-muted-foreground">{v.duration}</span>}
                            <button onClick={() => updateData("videos", videos.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                }

                <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                        <Input value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} placeholder="YouTube URL..." className="h-8 text-xs" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <Input value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} placeholder="Title (optional)" className="h-8 text-xs" />
                    </div>
                    <Button variant="outline" size="sm" onClick={addVideo} disabled={!newVideoUrl.trim()} className="h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="space-y-3">
                <Label className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Documentation
                </Label>

                {
                    docs.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-white dark:bg-neutral-900 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                            <span className="text-sm">📄</span>
                            <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-blue-600 hover:underline truncate">
                                {d.title || d.url}
                            </a>
                            {d.type && <Badge variant="outline" className="text-[10px]">{d.type}</Badge>}
                            <button onClick={() => updateData("docs", docs.filter((_, j) => j !== i))} className="p-1 text-muted-foreground hover:text-red-500">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))
                }

                <div className="flex gap-2 items-end">
                    <div className="flex-1">
                        <Input value={newDocUrl} onChange={e => setNewDocUrl(e.target.value)} placeholder="Documentation URL..." className="h-8 text-xs" />
                    </div>
                    <div className="flex-1">
                        <Input value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} placeholder="Title (optional)" className="h-8 text-xs" />
                    </div>
                    <Button variant="outline" size="sm" onClick={addDoc} disabled={!newDocUrl.trim()} className="h-8 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                </div>
            </div>

            {
                videos.length === 0 && docs.length === 0 && (
                    <div className="text-center p-8 border-2 border-dashed border-purple-200 dark:border-purple-900 rounded-2xl bg-purple-50/30 dark:bg-purple-950/10">
                        <Video className="w-8 h-8 mx-auto mb-3 text-purple-400 opacity-50" />
                        <p className="text-sm font-medium mb-1">No Resources Yet</p>
                        <p className="text-xs text-muted-foreground">Use the AI generator to find resources, or add links manually above.</p>
                    </div>
                )
            }
        </div>
    );
}