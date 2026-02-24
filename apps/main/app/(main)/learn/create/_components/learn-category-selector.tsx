
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronRight, ArrowLeft, Search, Layers, Grid, Plus, Loader2
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle
} from "@repo/ui/components/ui/dialog";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { toast } from "@repo/ui/components/ui/sonner";
import {
    createMainCategory, createSubCategory
} from "@/actions/(main)/learn/categories";
import type { LearnCategory, LearnSubCategory } from "@/types/learn";

interface LearnCategorySelectorProps {
    categories: LearnCategory[];
}

export function LearnCategorySelector({ categories }: LearnCategorySelectorProps) {
    const router = useRouter();
    const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Creation State
    const [isCreating, setIsCreating] = useState(false);
    const [creationType, setCreationType] = useState<"MAIN" | "SUB" | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDesc, setNewCategoryDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedMainCategory = categories.find(c => c.id === selectedMainId);

    const filteredMainCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSubCategories = selectedMainCategory?.subCategories.filter((sc: LearnSubCategory) =>
        sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleSelectSubCategory = (subCategoryId: string) => {
        router.push(`/Learns/create?mainCategoryId=${selectedMainId}&subCategoryId=${subCategoryId}`);
    };

    const handleCreate = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            if (creationType === "MAIN") {
                const result = await createMainCategory({
                    name: newCategoryName,
                    description: newCategoryDesc,
                    icon: "Layers" // Default icon
                });
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Main category created!");
                    setIsCreating(false);
                    setNewCategoryName("");
                    setNewCategoryDesc("");
                    // Select the new category? Or just refresh?
                    // The server action revalidates path, so updated categories should come in via props if parent refreshes
                    // But client might need refresh. router.refresh()
                    router.refresh();
                }
            } else if (creationType === "SUB" && selectedMainId) {
                const result = await createSubCategory({
                    name: newCategoryName,
                    description: newCategoryDesc,
                    mainCategoryId: selectedMainId,
                    icon: "Grid"
                });
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Sub category created!");
                    setIsCreating(false);
                    setNewCategoryName("");
                    setNewCategoryDesc("");
                    router.refresh();
                }
            }
        } catch {
            toast.error("Failed to create category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCreateModal = (type: "MAIN" | "SUB") => {
        setCreationType(type);
        setNewCategoryName("");
        setNewCategoryDesc("");
        setIsCreating(true);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8 text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create a New Learn</h1>
                <p className="text-muted-foreground text-lg">
                    Select a category to get started with your learning path
                </p>
            </div>

            <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder={selectedMainId ? `Search in ${selectedMainCategory?.name}...` : "Search categories..."}
                        className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {!selectedMainId && (
                    <Button onClick={() => openCreateModal("MAIN")} variant="outline" className="border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Main Category
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!selectedMainId ? (
                    <motion.div
                        key="main-categories"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {filteredMainCategories.map((category) => (
                            <Card
                                key={category.id}
                                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group overflow-hidden border-2 border-transparent hover:border-primary/20 bg-card/50"
                                onClick={() => {
                                    setSelectedMainId(category.id);
                                    setSearchQuery("");
                                }}
                            >
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            {/* We can render icon from string if needed, or fallback */}
                                            {category.icon ? (
                                                <Layers className="h-6 w-6" />
                                            ) : (
                                                <Layers className="h-6 w-6" />
                                            )}
                                        </div>
                                        <div className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                                            {category._count?.learns || 0} Learns
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {category.description || "Explore Learns in this category"}
                                        </p>
                                    </div>
                                    <div className="pt-2 flex items-center text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                        View Subcategories
                                        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="sub-categories"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMainId(null)}
                                className="text-muted-foreground hover:text-foreground -ml-2"
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to Categories
                            </Button>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Layers className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedMainCategory?.name}</h2>
                                    <p className="text-muted-foreground">Select a subcategory to continue</p>
                                </div>
                            </div>
                            <Button onClick={() => openCreateModal("SUB")} variant="outline" className="border-dashed">
                                <Plus className="w-4 h-4 mr-2" /> Add Sub Category
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredSubCategories.map((subCategory: LearnSubCategory) => (
                                <Card
                                    key={subCategory.id}
                                    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group border-2 border-transparent bg-card/50"
                                    onClick={() => handleSelectSubCategory(subCategory.id)}
                                >
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <Grid className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                {subCategory.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {subCategory._count?.learns || 0} Learns
                                            </p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredSubCategories.length === 0 && (
                                <div className="col-span-full py-12 text-center text-muted-foreground">
                                    <p>No subcategories found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Creation Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {creationType === "MAIN" ? "Create Main Category" : "Create Sub Category"}
                        </DialogTitle>
                        <DialogDescription>
                            {creationType === "MAIN"
                                ? "Add a new main technology category to the platform."
                                : `Add a new sub-category under ${selectedMainCategory?.name}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="e.g. Web Development"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Brief description..."
                                value={newCategoryDesc}
                                onChange={e => setNewCategoryDesc(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreating(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting || !newCategoryName.trim()}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
