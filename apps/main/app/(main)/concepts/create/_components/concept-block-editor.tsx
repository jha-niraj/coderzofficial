"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
    Plus, Trash2, Save, Eye, ArrowLeft, Sparkles, Loader2, BookOpen,
    Code2, HelpCircle, Zap, BarChart3, CheckCircle2, FileText, Video,
    Globe, Send, FileEdit, X, Link2, Search, FileStack, Coins,
    AlertCircle, Image as ImageIcon, Mic, FolderGit2
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
import Image from "next/image";

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
    codeBlocks: {
        id?: string;
        order: number;
        title: string;
        language: string;
        code: string;
        explanation: string;
        isRunnable: boolean
    }[];
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
    { value: "VISUAL", label: "Visual", icon: ImageIcon, color: "text-cyan-500", bgColor: "bg-cyan-500/10 border-cyan-500/20", description: "Images & diagrams" },
    { value: "MOCK_INTERVIEW", label: "Mock Interview", icon: Mic, color: "text-red-500", bgColor: "bg-red-500/10 border-red-500/20", description: "Practice interviews" },
    { value: "PROJECT", label: "Project", icon: FolderGit2, color: "text-indigo-500", bgColor: "bg-indigo-500/10 border-indigo-500/20", description: "Build projects" },
];

const CATEGORIES = Object.values(ConceptCategory);
const DIFFICULTIES = Object.values(ConceptDifficulty);

// Subcategories mapping for each category
const SUBCATEGORIES_MAP: Record<ConceptCategory, string[]> = {
    WEB_DEVELOPMENT: ["React", "Next.js", "Vue.js", "Angular", "HTML & CSS", "JavaScript", "TypeScript", "Svelte", "Tailwind CSS"],
    MOBILE_DEVELOPMENT: ["React Native", "Flutter", "Swift/iOS", "Kotlin/Android", "Expo"],
    DATA_STRUCTURES: ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables", "Stacks & Queues", "Heaps"],
    ALGORITHMS: ["Sorting", "Searching", "Dynamic Programming", "Recursion", "Greedy Algorithms", "Backtracking"],
    SYSTEM_DESIGN: ["Scalability", "Microservices", "Load Balancing", "Caching", "Database Design", "API Gateway"],
    DATABASE: ["SQL", "NoSQL", "PostgreSQL", "MongoDB", "Redis", "MySQL", "Prisma"],
    DEVOPS: ["Docker", "Kubernetes", "CI/CD", "Terraform", "Jenkins", "GitHub Actions"],
    CLOUD_COMPUTING: ["AWS", "Google Cloud", "Azure", "Serverless", "Lambda", "S3"],
    MACHINE_LEARNING: ["Supervised Learning", "Unsupervised Learning", "Neural Networks", "NLP", "Computer Vision"],
    ARTIFICIAL_INTELLIGENCE: ["Deep Learning", "Reinforcement Learning", "GPT/LLMs", "Prompt Engineering"],
    CYBERSECURITY: ["Web Security", "Cryptography", "Network Security", "OWASP", "Penetration Testing"],
    BLOCKCHAIN: ["Ethereum", "Solidity", "Smart Contracts", "Web3.js", "DeFi"],
    PROGRAMMING_FUNDAMENTALS: ["Python", "Java", "C++", "Go", "Rust", "C#"],
    SOFTWARE_ARCHITECTURE: ["Clean Architecture", "Domain-Driven Design", "SOLID Principles", "Design Patterns"],
    API_DESIGN: ["REST APIs", "GraphQL", "gRPC", "WebSockets", "OpenAPI/Swagger"],
    TESTING: ["Unit Testing", "Integration Testing", "E2E Testing", "Jest", "Cypress", "Playwright"],
    VERSION_CONTROL: ["Git Basics", "Git Branching", "GitHub", "GitLab", "Git Flow"],
    UI_UX_DESIGN: ["Figma", "UI Principles", "UX Research", "Accessibility", "Responsive Design"],
    GAME_DEVELOPMENT: ["Unity", "Unreal Engine", "Godot", "Game Physics", "2D/3D Graphics"],
    NETWORKING: ["TCP/IP", "HTTP/HTTPS", "DNS", "WebRTC", "Socket Programming"],
    OPERATING_SYSTEMS: ["Linux", "Process Management", "Memory Management", "File Systems", "Shell Scripting"],
    CUSTOM: [],
};

function getSubCategoriesForCategory(category: ConceptCategory): string[] {
    return SUBCATEGORIES_MAP[category] || [];
}

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
    const [subCategory, setSubCategory] = useState("");
    const [customSubCategory, setCustomSubCategory] = useState("");
    const [difficulty, setDifficulty] = useState<ConceptDifficulty>("BEGINNER");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [iconEmoji, setIconEmoji] = useState("📚");
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
                // Load subcategory from customCategory
                if (c.customCategory) {
                    const availableSubcats = getSubCategoriesForCategory(c.category);
                    if (availableSubcats.includes(c.customCategory)) {
                        setSubCategory(c.customCategory);
                        setCustomSubCategory("");
                    } else {
                        setSubCategory("custom");
                        setCustomSubCategory(c.customCategory);
                    }
                }
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
        // Determine the customCategory value from subCategory selection
        const customCategoryValue = subCategory === "custom" ? customSubCategory : subCategory;
        try {
            if (conceptId) {
                const result = await updateConcept(conceptId, {
                    title, description, category, difficulty, tags,
                    iconEmoji, customCategory: customCategoryValue, estimatedTime, prerequisites,
                    pricingType, price: pricingType === "PAID" ? price : 0,
                });
                if (result.error) { toast.error(result.error); return null; }
                toast.success("Concept updated!");
                loadDrafts(); // Refresh drafts
                return conceptId;
            } else {
                const result = await createConcept({
                    title, description, category, difficulty, tags,
                    iconEmoji, customCategory: customCategoryValue, estimatedTime, prerequisites,
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
    }, [conceptId, title, description, category, difficulty, tags, iconEmoji, subCategory, customSubCategory, estimatedTime, prerequisites, pricingType, price]);

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
                const result = await generateResources(title, block.title || prompt, category, difficulty);
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
                                            <Select value={category} onValueChange={v => { setCategory(v as ConceptCategory); setSubCategory(""); }}>
                                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c.replace(/_/g, " ")}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-full flex flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Sub Category</Label>
                                            <Select value={subCategory} onValueChange={v => setSubCategory(v)}>
                                                <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                                                <SelectContent>
                                                    {getSubCategoriesForCategory(category).map(sc => (
                                                        <SelectItem key={sc} value={sc} className="text-xs">{sc}</SelectItem>
                                                    ))}
                                                    <SelectItem value="custom" className="text-xs italic">+ Custom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {subCategory === "custom" && (
                                        <div className="w-full flex flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Custom Sub Category</Label>
                                            <Input 
                                                value={customSubCategory} 
                                                onChange={e => setCustomSubCategory(e.target.value)} 
                                                placeholder="Enter custom sub category" 
                                                className="mt-1 h-8 text-xs" 
                                            />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="w-full flex flex-col">
                                            <Label className="text-left text-xs font-medium text-muted-foreground">Difficulty</Label>
                                            <Select value={difficulty} onValueChange={v => setDifficulty(v as ConceptDifficulty)}>
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
                                                {
                                                    activeBlock.type === "VISUAL" && (
                                                        <VisualDataEditor block={activeBlock} updateBlock={updateBlock} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "MOCK_INTERVIEW" && (
                                                        <MockInterviewEditor block={activeBlock} updateBlock={updateBlock} />
                                                    )
                                                }
                                                {
                                                    activeBlock.type === "PROJECT" && (
                                                        <ProjectEditor block={activeBlock} updateBlock={updateBlock} />
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

function VisualDataEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as { images?: { url: string; caption?: string; alt?: string }[]; aiPrompt?: string };
    const images = data.images || [];
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiImagePrompt, setAiImagePrompt] = useState(data.aiPrompt || "");

    const updateData = (key: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...data, [key]: value } });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Using Cloudinary upload (you'll need to implement this action)
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "coderz_concepts");

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );

            const result = await response.json();
            if (result.secure_url) {
                updateData("images", [...images, { url: result.secure_url, caption: "", alt: file.name }]);
                toast.success("Image uploaded!");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAiGenerate = async () => {
        if (!aiImagePrompt.trim()) return;
        setIsGenerating(true);
        try {
            // AI image generation placeholder - would integrate with FalAI
            toast.info("AI image generation coming soon!");
            updateData("aiPrompt", aiImagePrompt);
        } catch {
            toast.error("Failed to generate image");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Images & Diagrams
                </Label>
                <div className="p-4 border-2 border-dashed border-cyan-200 dark:border-cyan-800 rounded-xl bg-cyan-50/30 dark:bg-cyan-950/10">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="visual-upload" disabled={isUploading} />
                    <label htmlFor="visual-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {
                            isUploading ? (
                                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-cyan-500" />
                            )
                        }
                        <span className="text-sm font-medium">{isUploading ? "Uploading..." : "Click to upload image"}</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                    </label>
                </div>
                <div className="flex gap-2">
                    <Input
                        value={aiImagePrompt}
                        onChange={e => setAiImagePrompt(e.target.value)}
                        placeholder="Describe the diagram/visual you need..."
                        className="flex-1 text-sm"
                    />
                    <Button onClick={handleAiGenerate} disabled={isGenerating || !aiImagePrompt.trim()} variant="outline" size="sm">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </Button>
                </div>

                {
                    images.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            {
                                images.map((img, i) => (
                                    <div key={i} className="relative group rounded-lg overflow-hidden border">
                                        <Image
                                            src={img.url}
                                            alt={img.alt || ""}
                                            className="w-full h-40 object-cover"
                                            fill
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => updateData("images", images.filter((_, j) => j !== i))}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            value={img.caption || ""}
                                            onChange={e => {
                                                const updated = [...images];
                                                updated[i] = { ...img, caption: e.target.value };
                                                updateData("images", updated);
                                            }}
                                            placeholder="Caption..."
                                            className="absolute bottom-0 left-0 right-0 bg-black/70 border-0 text-white text-xs h-8"
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Visual Explanation (Markdown)</Label>
                <Textarea
                    value={block.content}
                    onChange={e => updateBlock(block.localId, { content: e.target.value })}
                    placeholder="Explain what this visual demonstrates..."
                    rows={6}
                    className="font-mono text-sm"
                />
            </div>
        </div>
    );
}

function MockInterviewEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as {
        interviewType?: string;
        duration?: number;
        topics?: string[];
        questions?: { question: string; hints?: string[] }[];
    };

    const updateData = (key: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...data, [key]: value } });
    };

    const [newTopic, setNewTopic] = useState("");
    const topics = data.topics || [];
    const questions = data.questions || [];

    const addTopic = () => {
        if (!newTopic.trim()) return;
        updateData("topics", [...topics, newTopic.trim()]);
        setNewTopic("");
    };

    const addQuestion = () => {
        updateData("questions", [...questions, { question: "", hints: [] }]);
    };

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <div className="flex items-center gap-2 mb-3">
                    <Mic className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-red-700 dark:text-red-400">Mock Interview Configuration</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Configure an interactive mock interview. Students will practice with AI-powered voice interviews.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Interview Type</Label>
                    <Select value={data.interviewType || "technical"} onValueChange={v => updateData("interviewType", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="technical">Technical Interview</SelectItem>
                            <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                            <SelectItem value="system-design">System Design</SelectItem>
                            <SelectItem value="coding">Live Coding</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Duration (minutes)</Label>
                    <Input
                        type="number"
                        value={data.duration || 15}
                        onChange={e => updateData("duration", parseInt(e.target.value))}
                        min={5}
                        max={60}
                        className="h-9"
                    />
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase">Topics to Cover</Label>
                <div className="flex flex-wrap gap-2">
                    {
                        topics.map((topic, i) => (
                            <Badge key={i} variant="secondary" className="gap-1">
                                {topic}
                                <button onClick={() => updateData("topics", topics.filter((_, j) => j !== i))} className="hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))
                    }
                </div>
                <div className="flex gap-2">
                    <Input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Add topic..." className="h-8 text-xs"
                        onKeyDown={e => e.key === "Enter" && addTopic()} />
                    <Button variant="outline" size="sm" onClick={addTopic} className="h-8"><Plus className="w-3 h-3" /></Button>
                </div>
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase">Practice Questions</Label>
                    <Button variant="outline" size="sm" onClick={addQuestion} className="h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add Question
                    </Button>
                </div>
                {
                    questions.map((q, i) => (
                        <div key={i} className="p-3 rounded-lg border bg-white dark:bg-neutral-900 space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
                                <Textarea
                                    value={q.question}
                                    onChange={e => {
                                        const updated = [...questions];
                                        updated[i] = { ...q, question: e.target.value };
                                        updateData("questions", updated);
                                    }}
                                    placeholder="Enter interview question..."
                                    rows={2}
                                    className="flex-1 text-sm"
                                />
                                <Button variant="ghost" size="sm" onClick={() => updateData("questions", questions.filter((_, j) => j !== i))} className="h-7 w-7 p-0">
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Instructions (Markdown)</Label>
                <Textarea
                    value={block.content}
                    onChange={e => updateBlock(block.localId, { content: e.target.value })}
                    placeholder="Instructions for the mock interview..."
                    rows={4}
                    className="font-mono text-sm"
                />
            </div>
        </div>
    );
}

function ProjectEditor({ block, updateBlock }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void }) {
    const data = (block.stepData || {}) as {
        projectType?: "minor" | "major";
        difficulty?: string;
        estimatedHours?: number;
        technologies?: string[];
        requirements?: string[];
        deliverables?: string[];
        rubric?: { criteria: string; points: number }[];
    };

    const updateData = (key: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...data, [key]: value } });
    };

    const [newTech, setNewTech] = useState("");
    const [newReq, setNewReq] = useState("");
    const technologies = data.technologies || [];
    const requirements = data.requirements || [];
    const _deliverables = data.deliverables || [];

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900">
                <div className="flex items-center gap-2 mb-3">
                    <FolderGit2 className="w-5 h-5 text-indigo-500" />
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">Project Configuration</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Create a hands-on project for students to build and add to their portfolio.
                </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Project Type</Label>
                    <Select value={data.projectType || "minor"} onValueChange={v => updateData("projectType", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minor">Minor Project (1-3 hrs)</SelectItem>
                            <SelectItem value="major">Major Project (5+ hrs)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Difficulty</Label>
                    <Select value={data.difficulty || "BEGINNER"} onValueChange={v => updateData("difficulty", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Est. Hours</Label>
                    <Input
                        type="number"
                        value={data.estimatedHours || 2}
                        onChange={e => updateData("estimatedHours", parseInt(e.target.value))}
                        min={1}
                        className="h-9"
                    />
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase">Technologies</Label>
                <div className="flex flex-wrap gap-2">
                    {
                        technologies.map((tech, i) => (
                            <Badge key={i} variant="secondary" className="gap-1">
                                {tech}
                                <button onClick={() => updateData("technologies", technologies.filter((_, j) => j !== i))} className="hover:text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))
                    }
                </div>
                <div className="flex gap-2">
                    <Input value={newTech} onChange={e => setNewTech(e.target.value)} placeholder="Add technology..." className="h-8 text-xs"
                        onKeyDown={e => { if (e.key === "Enter") { updateData("technologies", [...technologies, newTech.trim()]); setNewTech(""); } }} />
                    <Button variant="outline" size="sm" onClick={() => { if (newTech.trim()) { updateData("technologies", [...technologies, newTech.trim()]); setNewTech(""); } }} className="h-8">
                        <Plus className="w-3 h-3" />
                    </Button>
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase">Requirements</Label>
                {
                    requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{i + 1}.</span>
                            <Input
                                value={req}
                                onChange={e => {
                                    const updated = [...requirements];
                                    updated[i] = e.target.value;
                                    updateData("requirements", updated);
                                }}
                                className="flex-1 h-8 text-xs"
                            />
                            <Button variant="ghost" size="sm" onClick={() => updateData("requirements", requirements.filter((_, j) => j !== i))} className="h-7 w-7 p-0">
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ))
                }
                <div className="flex gap-2">
                    <Input value={newReq} onChange={e => setNewReq(e.target.value)} placeholder="Add requirement..." className="h-8 text-xs"
                        onKeyDown={e => { if (e.key === "Enter" && newReq.trim()) { updateData("requirements", [...requirements, newReq.trim()]); setNewReq(""); } }} />
                    <Button variant="outline" size="sm" onClick={() => { if (newReq.trim()) { updateData("requirements", [...requirements, newReq.trim()]); setNewReq(""); } }} className="h-8">
                        <Plus className="w-3 h-3" />
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Project Description (Markdown)</Label>
                <Textarea
                    value={block.content}
                    onChange={e => updateBlock(block.localId, { content: e.target.value })}
                    placeholder="Detailed project description, goals, and guidelines..."
                    rows={8}
                    className="font-mono text-sm"
                />
            </div>
        </div>
    );
}