"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, 
    SheetTrigger
} from '@repo/ui/components/ui/sheet';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Switch } from '@repo/ui/components/ui/switch';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';
import { createStudio } from '@/actions/(main)/studios/studio.action';
import { 
    STUDIO_CATEGORIES, StudioCategory 
} from '@/types/studio';
import { 
    Loader2, Plus, Sparkles, FileText 
} from 'lucide-react';
import toast from '@repo/ui/components/ui/sonner';

interface CreateStudioSheetProps {
    trigger?: React.ReactNode;
    onSuccess?: (studioId: string) => void;
    returnToSpace?: {
        spaceId: string;
        stepOrder?: number;
    };
}

export default function CreateStudioSheet({ trigger, onSuccess, returnToSpace }: CreateStudioSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'PROGRAMMING' as StudioCategory,
        isPublic: false,
    });

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        setIsSubmitting(true);
        const result = await createStudio({
            title: formData.title,
            description: formData.description || undefined,
            category: formData.category,
            visibility: formData.isPublic ? 'PUBLIC' : 'PRIVATE',
        });

        if (result.error) {
            toast.error(result.error);
        } else if (result.studio) {
            toast.success('Studio created successfully!');
            setOpen(false);
            setFormData({
                title: '',
                description: '',
                category: 'PROGRAMMING',
                isPublic: false,
            });

            const studioSlug = result.studio.slug || result.studio.id;
            if (onSuccess) {
                onSuccess(studioSlug);
            } else if (returnToSpace) {
                // TODO: Add studio to space step
                router.push(`/studio/${studioSlug}?returnTo=/space/${returnToSpace.spaceId}`);
            } else {
                router.push(`/studio/${studioSlug}`);
            }
        }
        setIsSubmitting(false);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {
                    trigger || (
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Studio
                        </Button>
                    )
                }
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-xl flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        Create New Studio
                    </SheetTitle>
                    <SheetDescription>
                        Create an AI-powered learning workspace with quizzes, flashcards, and more.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., JavaScript Fundamentals"
                            className="text-base"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="What will you learn in this studio?"
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value as StudioCategory })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    STUDIO_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div>
                            <Label htmlFor="public" className="font-medium">Make Public</Label>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Allow others to view this studio
                            </p>
                        </div>
                        <Switch
                            id="public"
                            checked={formData.isPublic}
                            onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.title.trim()}
                            className="flex-1"
                        >
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Create Studio
                                    </>
                                )
                            }
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}


