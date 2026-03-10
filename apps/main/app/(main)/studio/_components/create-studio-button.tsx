"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, StickyNote } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select";
import { createStudio } from "@/actions/(main)/studios/studio.actions";
import toast from "@repo/ui/components/ui/sonner";

const CATEGORY_OPTIONS = [
    { value: "GENERAL", label: "General", emoji: "📚" },
    { value: "PROGRAMMING", label: "Programming", emoji: "💻" },
    { value: "WEB_DEVELOPMENT", label: "Web Development", emoji: "🌐" },
    { value: "DATA_SCIENCE", label: "Data Science", emoji: "📊" },
    { value: "DEVOPS", label: "DevOps", emoji: "🔧" },
    { value: "SYSTEM_DESIGN", label: "System Design", emoji: "🏗️" },
    { value: "INTERVIEW_PREP", label: "Interview Prep", emoji: "🎯" },
    { value: "PROJECT_NOTES", label: "Project Notes", emoji: "📝" },
    { value: "COURSE_NOTES", label: "Course Notes", emoji: "🎓" },
    { value: "OTHER", label: "Other", emoji: "📌" },
];

export function CreateStudioButton() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("GENERAL");

    const handleCreate = async () => {
        if (!title.trim()) {
            toast.error("Please enter a studio title");
            return;
        }

        setIsCreating(true);
        try {
            const result = await createStudio({
                title: title.trim(),
                description: description.trim() || undefined,
                source: "manual",
            });

            if (result.success && result.studio) {
                toast.success("Studio created!");
                setOpen(false);
                setTitle("");
                setDescription("");
                setCategory("GENERAL");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create studio");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4" />
                    Create Studio
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[480px]">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <StickyNote className="w-4 h-4 text-white" />
                        </div>
                        Create New Studio
                    </SheetTitle>
                    <SheetDescription>
                        Create a personal learning workspace. Add notes, code, quizzes, and more.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-5 mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="studio-title">Title</Label>
                        <Input
                            id="studio-title"
                            placeholder="e.g. React Hooks Deep Dive"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            disabled={isCreating}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studio-description">Description (optional)</Label>
                        <Textarea
                            id="studio-description"
                            placeholder="What will you be learning or working on?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isCreating}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory} disabled={isCreating}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{opt.emoji}</span>
                                            <span>{opt.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || !title.trim()}
                        className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Create Studio
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
