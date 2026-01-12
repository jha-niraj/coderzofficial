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
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/ui/radio-group';
import { Switch } from '@repo/ui/components/ui/switch';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select';
import { createSpace } from '@/actions/(main)/space/space.action';
import { SpaceVisibility, SpaceCategory } from '@repo/prisma/client';
import {
    Loader2, Plus, Globe, Lock, Shield, ChevronRight, ChevronLeft,
    Sparkles
} from 'lucide-react';

interface CreateSpaceSheetProps {
    trigger?: React.ReactNode;
    onSuccess?: (slug: string) => void;
}

const categoryOptions = [
    { value: 'FRONTEND', label: 'Frontend Development', emoji: '🎨' },
    { value: 'BACKEND', label: 'Backend Development', emoji: '⚙️' },
    { value: 'FULLSTACK', label: 'Full Stack', emoji: '🚀' },
    { value: 'DSA', label: 'Data Structures & Algorithms', emoji: '🧮' },
    { value: 'SYSTEM_DESIGN', label: 'System Design', emoji: '🏗️' },
    { value: 'AI_ML', label: 'AI & Machine Learning', emoji: '🤖' },
    { value: 'DEVOPS', label: 'DevOps', emoji: '🔧' },
    { value: 'MOBILE', label: 'Mobile Development', emoji: '📱' },
    { value: 'DATABASE', label: 'Database', emoji: '🗄️' },
    { value: 'SECURITY', label: 'Security', emoji: '🔒' },
    { value: 'BLOCKCHAIN', label: 'Blockchain', emoji: '⛓️' },
    { value: 'CLOUD', label: 'Cloud Computing', emoji: '☁️' },
    { value: 'INTERVIEW_PREP', label: 'Interview Preparation', emoji: '💼' },
    { value: 'PROJECT_BASED', label: 'Project Based Learning', emoji: '🎯' },
    { value: 'CAREER', label: 'Career Development', emoji: '📈' },
    { value: 'OTHER', label: 'Other', emoji: '📚' },
];

const visibilityOptions = [
    {
        value: 'PUBLIC',
        label: 'Public',
        description: 'Anyone can discover and join',
        icon: Globe,
    },
    {
        value: 'PROTECTED',
        label: 'Protected',
        description: 'Requires access code to join',
        icon: Shield,
    },
    {
        value: 'PRIVATE',
        label: 'Private',
        description: 'Invite only',
        icon: Lock,
    },
];

export default function CreateSpaceSheet({ trigger, onSuccess }: CreateSpaceSheetProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        emoji: '🚀',
        category: 'OTHER' as SpaceCategory,
        tags: [] as string[],
        visibility: 'PUBLIC' as SpaceVisibility,
        allowMemberContent: false,
        isAssignmentMode: false,
        enableProgressTracking: true,
        enableBranches: true,
        enableComments: true,
        enableLikes: true,
        // Paid space settings (commented out for now)
        // isPaid: false,
        // priceCredits: 0,
    });

    const totalSteps = 3;

    const handleSubmit = async () => {
        if (!formData.title) return;

        setIsSubmitting(true);
        const result = await createSpace(formData);

        if (result.success && result.data) {
            setOpen(false);
            setStep(1);
            setFormData({
                title: '',
                description: '',
                emoji: '🚀',
                category: 'OTHER' as SpaceCategory,
                tags: [],
                visibility: 'PUBLIC' as SpaceVisibility,
                allowMemberContent: false,
                isAssignmentMode: false,
                enableProgressTracking: true,
                enableBranches: true,
                enableComments: true,
                enableLikes: true,
            });

            if (onSuccess) {
                onSuccess(result.data.slug);
            } else {
                router.push(`/space/${result.data.slug}`);
            }
        } else {
            alert(result.error || 'Failed to create space');
        }
        setIsSubmitting(false);
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.title.length >= 3;
            case 2:
                return true;
            case 3:
                return true;
            default:
                return false;
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {
                    trigger || (
                        <Button className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Create Space
                        </Button>
                    )
                }
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                <div className="max-w-2xl mx-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-blue-500" />
                            Create New Space
                        </SheetTitle>
                        <SheetDescription>
                            Build a collaborative learning journey
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex items-center gap-2 mb-8">
                        {
                            [1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? 'bg-blue-500' : 'bg-neutral-200 dark:bg-neutral-800'
                                        }`}
                                />
                            ))
                        }
                    </div>
                    <AnimatePresence mode="wait">
                        {
                            step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Space Title *</Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g., Learning React from Scratch"
                                                className="text-lg"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="What will learners achieve in this space?"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="emoji">Emoji</Label>
                                                <Input
                                                    id="emoji"
                                                    value={formData.emoji}
                                                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                                    placeholder="🚀"
                                                    className="text-2xl text-center"
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => setFormData({ ...formData, category: value as SpaceCategory })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {
                                                            categoryOptions.map((cat) => (
                                                                <SelectItem key={cat.value} value={cat.value}>
                                                                    <span className="flex items-center gap-2">
                                                                        <span>{cat.emoji}</span>
                                                                        <span>{cat.label}</span>
                                                                    </span>
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        }
                        {
                            step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <Label>Who can join this space?</Label>
                                        <RadioGroup
                                            value={formData.visibility}
                                            onValueChange={(value) => setFormData({ ...formData, visibility: value as SpaceVisibility })}
                                            className="space-y-3"
                                        >
                                            {
                                                visibilityOptions.map((option) => {
                                                    const Icon = option.icon;
                                                    return (
                                                        <label
                                                            key={option.value}
                                                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.visibility === option.value
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                                                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                                                                }`}
                                                        >
                                                            <RadioGroupItem value={option.value} className="sr-only" />
                                                            <div className={`p-2 rounded-lg ${formData.visibility === option.value
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-neutral-100 dark:bg-neutral-800'
                                                                }`}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium">{option.label}</p>
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                    {option.description}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    );
                                                })
                                            }
                                        </RadioGroup>

                                        {
                                            formData.visibility === 'PROTECTED' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg"
                                                >
                                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                                        An access code will be generated after creating the space.
                                                        You can share it from the space settings.
                                                    </p>
                                                </motion.div>
                                            )
                                        }

                                        {/* Paid space option (commented out for now) */}
                                        {/* 
                                    <div className="pt-4 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label>Make this a paid space</Label>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    Charge credits for joining
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.isPaid}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                                            />
                                        </div>
                                        {
                                        formData.isPaid && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4"
                                            >
                                                <Label>Price (in credits)</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={formData.priceCredits}
                                                    onChange={(e) => setFormData({ ...formData, priceCredits: parseInt(e.target.value) || 0 })}
                                                />
                                            </motion.div>
                                        )
                                            }
                                    </div>
                                    */}
                                    </div>
                                </motion.div>
                            )
                        }
                        {
                            step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                            <div>
                                                <Label>Allow Members to Add Content</Label>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    Members can add steps to the main timeline
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.allowMemberContent}
                                                onCheckedChange={(checked) => setFormData({ ...formData, allowMemberContent: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                            <div>
                                                <Label>Assignment Mode</Label>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    Enable due dates and teacher features
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.isAssignmentMode}
                                                onCheckedChange={(checked) => setFormData({ ...formData, isAssignmentMode: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                            <div>
                                                <Label>Enable Branches</Label>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    Allow personalized learning paths
                                                </p>
                                            </div>
                                            <Switch
                                                checked={formData.enableBranches}
                                                onCheckedChange={(checked) => setFormData({ ...formData, enableBranches: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                            <div>
                                                <Label>Enable Comments</Label>
                                            </div>
                                            <Switch
                                                checked={formData.enableComments}
                                                onCheckedChange={(checked) => setFormData({ ...formData, enableComments: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                            <div>
                                                <Label>Enable Likes</Label>
                                            </div>
                                            <Switch
                                                checked={formData.enableLikes}
                                                onCheckedChange={(checked) => setFormData({ ...formData, enableLikes: checked })}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        }
                    </AnimatePresence>
                    <div className="flex items-center justify-between mt-8 pt-6 border-t">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => step > 1 ? setStep(step - 1) : setOpen(false)}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            {step > 1 ? 'Back' : 'Cancel'}
                        </Button>

                        {
                            step < totalSteps ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed()}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !canProceed()}
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
                                                Create Space
                                            </>
                                        )
                                    }
                                </Button>
                            )
                        }
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}