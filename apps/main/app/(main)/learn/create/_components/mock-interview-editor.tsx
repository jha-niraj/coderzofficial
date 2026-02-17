
import { useState } from "react";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Mic, CheckCircle2, X, Plus, Trash2
} from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import { formatDistanceToNow } from "date-fns";
import { StepBlock } from "./types";
import { CreateMockSheet } from "@/app/(main)/mock/_components/create-mock-sheet";

export function MockInterviewEditor({ block, updateBlock, LearnTitle, LearnDescription }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void; LearnTitle: string; LearnDescription: string }) {
    const data = (block.stepData || {}) as {
        interviewType?: string;
        duration?: number;
        topics?: string[];
        questions?: { question: string; hints?: string[] }[];
        createdMocks?: { mockId: string; title: string; createdAt: string }[];
        description?: string;
        difficulty?: string;
        interviewCategory?: string;
        sampleQuestions?: string[];
        // Legacy single mock
        mockId?: string;
        mockCreated?: boolean;
    };

    const updateData = (key: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...data, [key]: value } });
    };

    const [newTopic, setNewTopic] = useState("");
    const [createMockOpen, setCreateMockOpen] = useState(false);
    const topics = data.topics || [];
    const questions = data.questions || [];

    // Merge legacy single mock into array
    const createdMocks = (() => {
        const mocks = data.createdMocks || [];
        if (data.mockId && data.mockCreated && mocks.length === 0) {
            return [{ mockId: data.mockId, title: block.title || "Mock Interview", createdAt: new Date().toISOString() }];
        }
        return mocks;
    })();

    const addTopic = () => {
        if (!newTopic.trim()) return;
        updateData("topics", [...topics, newTopic.trim()]);
        setNewTopic("");
    };

    const addQuestion = () => {
        updateData("questions", [...questions, { question: "", hints: [] }]);
    };

    // Build knowledge base from block content and code blocks for mock interview
    const buildKnowledgeBase = (): string => {
        let kb = "";
        if (block.content) {
            kb += `## Learn Content\n\n${block.content}\n\n`;
        }
        if (block.codeBlocks && block.codeBlocks.length > 0) {
            kb += `## Code Examples\n\n`;
            block.codeBlocks.forEach((cb, i) => {
                kb += `### ${cb.title || `Code Block ${i + 1}`}\n`;
                kb += `\`\`\`${cb.language}\n${cb.code}\n\`\`\`\n`;
                if (cb.explanation) {
                    kb += `${cb.explanation}\n`;
                }
                kb += "\n";
            });
        }
        if (topics.length > 0) {
            kb += `## Topics Covered\n${topics.map(t => `- ${t}`).join("\n")}\n\n`;
        }
        if (questions.length > 0) {
            kb += `## Practice Questions\n${questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")}\n`;
        }
        return kb;
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

            {/* Created Mocks Cards */}
            {createdMocks.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Created Mock Interviews ({createdMocks.length})</Label>
                    {createdMocks.map((mock, i) => (
                        <div key={i} className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="font-medium text-green-700 dark:text-green-400 text-sm">{mock.title}</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        ID: {mock.mockId} {mock.createdAt ? `• Created ${formatDistanceToNow(new Date(mock.createdAt), { addSuffix: true })}` : ""}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const updated = createdMocks.filter((_, j) => j !== i);
                                        updateData("createdMocks", updated);
                                    }}
                                    className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Difficulty</Label>
                    <Select value={data.difficulty || "INTERMEDIATE"} onValueChange={v => updateData("difficulty", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Category</Label>
                    <Select value={data.interviewCategory || "TECHNICAL"} onValueChange={v => updateData("interviewCategory", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TECHNICAL">Technical</SelectItem>
                            <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                            <SelectItem value="SYSTEM_DESIGN">System Design</SelectItem>
                            <SelectItem value="CODING">Coding</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                        </SelectContent>
                    </Select>
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

            {/* Create Mock Interview Button */}
            <div className="border-t pt-4 space-y-3">
                <Button
                    onClick={() => setCreateMockOpen(true)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    <Mic className="w-4 h-4 mr-2" />
                    Create & Link Mock Interview
                </Button>
                <p className="text-xs text-muted-foreground">
                    Creates a mock interview linked to this step. You can create multiple mocks.
                </p>
            </div>

            {/* CreateMockSheet */}
            <CreateMockSheet
                open={createMockOpen}
                onOpenChange={setCreateMockOpen}
                userCredits={100}
                saveOnly={true}
                learnStepId={block.id || undefined}
                defaultValues={{
                    title: `${LearnTitle || block.title} - Mock Interview ${createdMocks.length + 1}`,
                    description: data.description || LearnDescription || block.content || "Practice interview based on Learn content",
                    knowledgeBase: buildKnowledgeBase(),
                    category: (data.interviewCategory as any) || "TECHNICAL",
                    level: data.difficulty || "INTERMEDIATE",
                }}
                onSuccess={(mockId) => {
                    // APPEND to created mocks, don't replace
                    const newMock = {
                        mockId,
                        title: `${LearnTitle || block.title} - Mock ${createdMocks.length + 1}`,
                        createdAt: new Date().toISOString(),
                    };

                    const updatedMocks = [...createdMocks, newMock];

                    updateBlock(block.localId, {
                        stepData: {
                            ...data,
                            createdMocks: updatedMocks,
                            mockId: undefined,
                            mockCreated: undefined
                        }
                    });

                    setCreateMockOpen(false);
                    toast.success("Mock interview created and linked!");
                }}
            />
        </div>
    );
}
