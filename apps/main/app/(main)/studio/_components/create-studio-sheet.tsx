"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
    SheetTrigger
} from '@repo/ui/components/ui/sheet';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import { Label } from '@repo/ui/components/ui/label';
import { Textarea } from '@repo/ui/components/ui/textarea';
import { Progress } from '@repo/ui/components/ui/progress';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';
import { createStudio } from '@/actions/(main)/studios/studio.action';
import {
    STUDIO_CATEGORIES, StudioCategory
} from '@/types/studio';
import {
    Plus, Sparkles, FileText, Check, ArrowLeft, ArrowRight, Globe, Lock
} from 'lucide-react';
import toast from '@repo/ui/components/ui/sonner';
import { cn } from '@repo/ui/lib/utils';

interface CreateStudioSheetProps {
    trigger?: React.ReactNode;
    onSuccess?: (studioSlug: string) => void;
    spaceId?: string;
}

export default function CreateStudioSheet({ trigger, onSuccess, spaceId }: CreateStudioSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'PROGRAMMING' as StudioCategory,
        isPublic: false,
    });

    const steps = [
        { id: 'basics', title: 'Studio Details', subtitle: 'Name your studio' },
        { id: 'settings', title: 'Settings', subtitle: 'Configure visibility' },
    ];

    const canProceed = () => {
        switch (currentStep) {
            case 0: return formData.title.trim().length >= 3;
            case 1: return true;
            default: return true;
        }
    };

    const nextStep = () => {
        if (!canProceed()) {
            toast.error('Please complete this step');
            return;
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const resetForm = () => {
        setCurrentStep(0);
        setFormData({
            title: '',
            description: '',
            category: 'PROGRAMMING',
            isPublic: false,
        });
    };

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
            setIsSubmitting(false);
        } else if (result.studio) {
            toast.success('Studio created successfully!');
            setOpen(false);
            setIsSubmitting(false);
            resetForm();

            const studioSlug = result.studio.slug || result.studio.id;

            if (onSuccess) {
                onSuccess(studioSlug);
            } else if (spaceId) {
                // When called from space, don't redirect - let the timeline handle it
            } else {
                router.push(`/studio/${studioSlug}`);
            }
        }
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
                resetForm();
                setIsSubmitting(false);
            }
        }}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Studio
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            Create New Studio
                        </SheetTitle>
                        <SheetDescription>
                            Create an AI-powered learning workspace with quizzes, flashcards, and more.
                        </SheetDescription>
                    </SheetHeader>

                    <AnimatePresence mode="wait">
                        {isSubmitting ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 blur-2xl opacity-30 animate-pulse" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-rose-500 flex items-center justify-center"
                                    >
                                        <div className="w-28 h-28 rounded-full bg-white dark:bg-neutral-950 flex items-center justify-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <FileText className="w-12 h-12 text-purple-500" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </div>

                                <h3 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                                    Creating Your Studio
                                </h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                                    Setting up your workspace...
                                </p>

                                <div className="w-full max-w-md">
                                    <Progress value={60} className="h-3" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Progress Indicator */}
                                <div className="mb-8">
                                    <div className="flex justify-between mb-2">
                                        {steps.map((step, index) => (
                                            <div key={step.id} className="flex-1 text-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium transition-all",
                                                    index < currentStep ? "bg-green-500 text-white" :
                                                        index === currentStep ? "bg-purple-500 text-white" :
                                                            "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                                                )}>
                                                    {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                                                </div>
                                                <p className="text-xs text-neutral-500">{step.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
                                </div>

                                {/* Step Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        {/* Step 0: Basics */}
                                        {currentStep === 0 && (
                                            <div className="space-y-6">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        Name your studio
                                                    </h3>
                                                    <p className="text-neutral-500">What topic will you be learning?</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Title *</Label>
                                                    <Input
                                                        id="title"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        placeholder="e.g., JavaScript Fundamentals, React Hooks Deep Dive"
                                                        className="text-lg h-14"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Description (Optional)</Label>
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
                                                        <SelectTrigger className="h-12">
                                                            <SelectValue placeholder="Select category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {STUDIO_CATEGORIES.map((cat) => (
                                                                <SelectItem key={cat.value} value={cat.value}>
                                                                    {cat.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 1: Settings */}
                                        {currentStep === 1 && (
                                            <div className="space-y-6">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        Configure your studio
                                                    </h3>
                                                    <p className="text-neutral-500">Set visibility preferences</p>
                                                </div>

                                                {/* Visibility Selection */}
                                                <div className="space-y-3">
                                                    <Label>Visibility</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <motion.button
                                                            onClick={() => setFormData({ ...formData, isPublic: false })}
                                                            whileHover={{ scale: 1.02 }}
                                                            className={cn(
                                                                "p-5 rounded-xl border-2 transition-all text-left",
                                                                !formData.isPublic
                                                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                                            )}
                                                        >
                                                            <Lock className="w-6 h-6 text-purple-500 mb-3" />
                                                            <div className="font-semibold text-neutral-900 dark:text-white">Private</div>
                                                            <div className="text-sm text-neutral-500 mt-1">Only you can access</div>
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => setFormData({ ...formData, isPublic: true })}
                                                            whileHover={{ scale: 1.02 }}
                                                            className={cn(
                                                                "p-5 rounded-xl border-2 transition-all text-left",
                                                                formData.isPublic
                                                                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                                            )}
                                                        >
                                                            <Globe className="w-6 h-6 text-green-500 mb-3" />
                                                            <div className="font-semibold text-neutral-900 dark:text-white">Public</div>
                                                            <div className="text-sm text-neutral-500 mt-1">Share with community</div>
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                {/* Summary Card */}
                                                <div className="p-5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                                                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Studio Summary</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-500">Title</span>
                                                            <span className="font-medium text-neutral-900 dark:text-white">{formData.title || 'Untitled'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-500">Category</span>
                                                            <span className="font-medium text-neutral-900 dark:text-white">{formData.category}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-neutral-500">Visibility</span>
                                                            <span className="font-medium text-neutral-900 dark:text-white">{formData.isPublic ? 'Public' : 'Private'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation */}
                                <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                    <Button
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={currentStep === 0}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={nextStep}
                                        disabled={!canProceed()}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white"
                                    >
                                        {currentStep === steps.length - 1 ? (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Create Studio
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </SheetContent>
        </Sheet>
    );
}
