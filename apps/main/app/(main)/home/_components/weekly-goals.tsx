"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import {
    Target, Plus, CheckCircle2, Circle, Trophy
} from "lucide-react";
import { addWeeklyGoal, toggleWeeklyGoal } from "@/actions/(main)/home/home.action";
import toast from "@repo/ui/components/ui/sonner";

interface WeeklyGoal {
    id: string;
    title: string;
    description: string | null;
    category: string;
    type: string;
    completed: boolean;
    completedAt: Date | null;
}

interface WeeklyGoalsProps {
    goals: WeeklyGoal[];
    progress: {
        completed: number;
        total: number;
        percentage: number;
    };
}

const goalCategories = [
    { value: "projects", label: "Projects" },
    { value: "learning", label: "Learning" },
    { value: "dsa", label: "DSA Practice" },
    { value: "studio", label: "Studio" },
    { value: "general", label: "General" },
];

export default function WeeklyGoals({ goals, progress }: WeeklyGoalsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: "",
        category: "general",
    });

    const handleAddGoal = async () => {
        if (!newGoal.title.trim()) {
            toast.error("Please enter a goal title");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await addWeeklyGoal(newGoal);
            if (result.success) {
                toast.success("Goal added successfully!");
                setIsOpen(false);
                setNewGoal({ title: "", category: "general" });
            } else {
                toast.error(result.error || "Failed to add goal");
            }
        } catch {
            toast.error("Failed to add goal");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleGoal = async (goalId: string) => {
        try {
            const result = await toggleWeeklyGoal(goalId);
            if (!result.success) {
                toast.error(result.error || "Failed to update goal");
            }
        } catch {
            toast.error("Failed to update goal");
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "projects":
                return "📁";
            case "learning":
                return "📖";
            case "dsa":
                return "🧩";
            case "studio":
                return "�";
            default:
                return "🎯";
        }
    };

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Weekly Goals</CardTitle>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Goal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Weekly Goal</DialogTitle>
                                <DialogDescription>
                                    Set a new goal for this week to track your progress
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Goal Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Complete 2 projects"
                                        value={newGoal.title}
                                        onChange={(e) =>
                                            setNewGoal({ ...newGoal, title: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={newGoal.category}
                                        onValueChange={(value) =>
                                            setNewGoal({ ...newGoal, category: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                goalCategories.map((cat) => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleAddGoal} disabled={isSubmitting}>
                                    {isSubmitting ? "Adding..." : "Add Goal"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                {
                    goals.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Weekly Progress</span>
                                <span className="font-medium">
                                    {progress.completed}/{progress.total} completed
                                </span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" />
                        </div>
                    )
                }
            </CardHeader>
            <CardContent className="space-y-3">
                {
                    goals.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-8 space-y-3"
                        >
                            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                <Target className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">No goals set for this week</p>
                                <p className="text-sm text-muted-foreground">
                                    Add a goal to track your progress
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {
                                goals.map((goal, index) => (
                                    <motion.div
                                        key={goal.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${goal.completed
                                            ? "bg-green-500/5 border-green-500/20"
                                            : "bg-muted/30 border-border"
                                            }`}
                                        onClick={() => handleToggleGoal(goal.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {
                                                    goal.completed ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                                    )
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">
                                                        {getCategoryIcon(goal.category)}
                                                    </span>
                                                    <p
                                                        className={`font-medium truncate ${goal.completed
                                                            ? "line-through text-muted-foreground"
                                                            : ""
                                                            }`}
                                                    >
                                                        {goal.title}
                                                    </p>
                                                </div>
                                                {
                                                    goal.description && (
                                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                                            {goal.description}
                                                        </p>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            }
                        </AnimatePresence>
                    )
                }
                {
                    goals.length > 0 && progress.percentage === 100 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center"
                        >
                            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                            <p className="font-semibold">All Goals Completed! 🎉</p>
                            <p className="text-sm text-muted-foreground">
                                You&apos;ve crushed it this week!
                            </p>
                        </motion.div>
                    )
                }
            </CardContent>
        </Card>
    );
}