
import { useState } from "react";
import { Label } from "@repo/ui/components/ui/label";
import { Button } from "@repo/ui/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Card } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    FolderGit2, Loader2, Sparkles, ChevronDown, CheckCircle2, Plus,
    Trash2, ExternalLink, X
} from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@repo/ui/lib/utils";
import { generateLearnProjects } from "@/actions/(main)/learn/learn-ai.action";
import type { GeneratedProject } from "@/actions/(main)/learn/learn-ai.action";
import { MarkdownRenderer } from "@/components/common/markdown-renderer";
import ProjectGenerateSheet from "@/components/projects/project-generate-sheet";
import { AddProjectSheet } from "@/components/profile/sheets/add-project-sheet";
import { StepBlock } from "./types";

export function ProjectEditor({ block, updateBlock, LearnTitle, LearnDescription }: { block: StepBlock; updateBlock: (id: string, u: Partial<StepBlock>) => void; LearnTitle: string; LearnDescription: string }) {
    const data = (block.stepData || {}) as {
        projectType?: "minor" | "major";
        difficulty?: string;
        estimatedHours?: number;
        technologies?: string[];
        generatedProjects?: GeneratedProject[];
        projectCount?: number;
        linkedProjectSlugs?: string[];
    };

    const updateData = (key: string, value: unknown) => {
        updateBlock(block.localId, { stepData: { ...data, [key]: value } });
    };

    const [generating, setGenerating] = useState(false);
    const [expandedProject, setExpandedProject] = useState<number | null>(null);
    const [addProjectOpen, setAddProjectOpen] = useState(false);
    const [generateSheetOpen, setGenerateSheetOpen] = useState(false);

    const projectType = data.projectType || "minor";
    const projectCount = data.projectCount || 3;
    const generatedProjects = data.generatedProjects || [];

    const handleGenerateProjects = async () => {
        if (!LearnTitle && !block.title) {
            toast.error("Please add a Learn title first");
            return;
        }
        setGenerating(true);
        try {
            const result = await generateLearnProjects(
                LearnTitle || block.title,
                LearnDescription || block.content || "",
                projectCount,
                projectType,
                data.technologies,
                data.difficulty
            );
            if (result.error) {
                toast.error(result.error);
            } else if (result.projects) {
                // APPEND to existing projects, don't replace
                const merged = [...generatedProjects, ...result.projects];
                updateData("generatedProjects", merged);
                toast.success(`Generated ${result.projects.length} projects! Total: ${merged.length}`);
            }
        } catch {
            toast.error("Failed to generate projects");
        } finally {
            setGenerating(false);
        }
    };

    const difficultyColor = (d: string) => {
        switch (d) {
            case "BEGINNER": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "INTERMEDIATE": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "ADVANCED": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            default: return "bg-neutral-100 text-neutral-600";
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900">
                <div className="flex items-center gap-2 mb-3">
                    <FolderGit2 className="w-5 h-5 text-indigo-500" />
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">Project Configuration</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {
                        projectType === "minor"
                            ? "Generate focused mini-projects (1-3 hours each) to reinforce learning through building."
                            : "Generate comprehensive, portfolio-worthy projects (5+ hours) with full specifications."
                    }
                </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Project Type</Label>
                    <Select value={projectType} onValueChange={v => updateData("projectType", v)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="minor">Minor Projects (1-3 hrs)</SelectItem>
                            <SelectItem value="major">Major Projects (5+ hrs)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Number of Projects</Label>
                    <Select value={String(projectCount)} onValueChange={v => updateData("projectCount", parseInt(v))}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {
                                [1, 2, 3, 4, 5, 6].map(n => (
                                    <SelectItem key={n} value={String(n)}>{n} Project{n > 1 ? "s" : ""}</SelectItem>
                                ))
                            }
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
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Context / Topic Description</Label>
                <Textarea
                    value={block.content}
                    onChange={e => updateBlock(block.localId, { content: e.target.value })}
                    placeholder="Describe what the projects should cover (used as context for AI generation)..."
                    rows={3}
                    className="font-mono text-sm"
                />
            </div>
            <Button
                onClick={handleGenerateProjects}
                disabled={generating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
                {
                    generating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Projects...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" /> Generate {projectCount} {projectType === "minor" ? "Mini" : "Major"} Project{projectCount > 1 ? "s" : ""} with AI
                        </>
                    )
                }
            </Button>

            {
                generatedProjects.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider">Generated Projects ({generatedProjects.length})</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleGenerateProjects}
                                disabled={generating}
                                className="h-7 text-xs text-indigo-600"
                            >
                                <Sparkles className="w-3 h-3 mr-1" /> Regenerate
                            </Button>
                        </div>

                        {
                            generatedProjects.map((project, i) => (
                                <Card key={i} className="overflow-hidden border-indigo-100 dark:border-indigo-900/50">
                                    <div
                                        className="p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                                        onClick={() => setExpandedProject(expandedProject === i ? null : i)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 shrink-0">
                                                <FolderGit2 className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-sm">{project.title}</h4>
                                                    <Badge className={cn("text-[10px] px-1.5", difficultyColor(project.difficulty))}>
                                                        {project.difficulty}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        ~{project.estimatedHours}h
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {project.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {
                                                        project.technologies.slice(0, 5).map((tech, j) => (
                                                            <Badge key={j} variant="outline" className="text-[10px] px-1.5 py-0">
                                                                {tech}
                                                            </Badge>
                                                        ))
                                                    }
                                                    {
                                                        project.technologies.length > 5 && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                                +{project.technologies.length - 5}
                                                            </Badge>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            <ChevronDown className={cn(
                                                "w-4 h-4 text-muted-foreground transition-transform shrink-0",
                                                expandedProject === i && "rotate-180"
                                            )} />
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {
                                            expandedProject === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="border-t px-4 py-4 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/30">
                                                        {
                                                            project.learningObjectives && project.learningObjectives.length > 0 && (
                                                                <div>
                                                                    <h5 className="text-xs font-bold uppercase text-indigo-600 mb-2">Learning Objectives</h5>
                                                                    <ul className="space-y-1">
                                                                        {
                                                                            project.learningObjectives.map((obj, k) => (
                                                                                <li key={k} className="flex items-start gap-2 text-xs text-muted-foreground">
                                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                                                                                    {obj}
                                                                                </li>
                                                                            ))
                                                                        }
                                                                    </ul>
                                                                </div>
                                                            )
                                                        }

                                                        <div>
                                                            <h5 className="text-xs font-bold uppercase text-indigo-600 mb-2">Requirements</h5>
                                                            <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                                                                <MarkdownRenderer content={project.requirements || ""} />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 pt-2 border-t">
                                                            {
                                                                projectType === "minor" ? (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAddProjectOpen(true);
                                                                        }}
                                                                        className="h-7 text-xs"
                                                                    >
                                                                        <Plus className="w-3 h-3 mr-1" /> Add to Portfolio
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setGenerateSheetOpen(true);
                                                                        }}
                                                                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                    >
                                                                        <Sparkles className="w-3 h-3 mr-1" /> Generate Full Project
                                                                    </Button>
                                                                )
                                                            }
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const updated = generatedProjects.filter((_, j) => j !== i);
                                                                    updateData("generatedProjects", updated);
                                                                }}
                                                                className="h-7 text-xs text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        }
                                    </AnimatePresence>
                                </Card>
                            ))
                        }
                    </div>
                )
            }
            {
                data.linkedProjectSlugs && data.linkedProjectSlugs.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider">Linked Projects</Label>
                        <div className="space-y-2">
                            {
                                data.linkedProjectSlugs.map((slug, i) => (
                                    <div key={i} className="flex items-center gap-2 p-3 rounded-lg border bg-white dark:bg-neutral-900">
                                        <FolderGit2 className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm flex-1 font-medium">{slug}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => window.open(`/projects/${slug}`, "_blank")}
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" /> View
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const updated = data.linkedProjectSlugs!.filter((_, j) => j !== i);
                                                updateData("linkedProjectSlugs", updated);
                                            }}
                                            className="h-7 w-7 p-0 text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
            }

            <ProjectGenerateSheet
                isOpen={generateSheetOpen}
                onOpenChange={setGenerateSheetOpen}
                defaultValues={expandedProject !== null ? {
                    title: generatedProjects[expandedProject]?.title,
                    description: generatedProjects[expandedProject]?.description,
                    difficulty: generatedProjects[expandedProject]?.difficulty as string
                } : undefined}
            />

            <AddProjectSheet
                open={addProjectOpen}
                onOpenChange={setAddProjectOpen}
                onSuccess={() => {
                    toast.success("Project added to your portfolio!");
                    // OPTIONAL: maybe link the project slug to this Learn step automatically?
                    // AddProjectSheet unfortunately doesn't return the project ID or slug easily in onSuccess callback (it's void).
                    // So we can't easily auto-link it here without modifying AddProjectSheet.
                    // For now, just close it.
                    setAddProjectOpen(false);
                }}
            />
        </div>
    );
}