'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Target, CheckCircle, Sparkles, ArrowRight, ArrowLeft, Brain, Check
} from 'lucide-react'
import toast from '@repo/ui/components/ui/sonner'
import { createPathfinderGoal } from '@/actions/(main)/pathfinder'
import { PathfinderCategory, PathfinderLevel } from '@repo/prisma/client'
import { cn } from '@repo/ui/lib/utils'

interface Group {
    id: string
    name: string
    emoji: string | null
    color: string | null
}

interface CreateGoalSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (goalId: string) => void
    groups?: Group[]
}

const categories: { value: PathfinderCategory; label: string; emoji: string }[] = [
    { value: 'DSA', label: 'DSA', emoji: '🧮' },
    { value: 'WEB_DEVELOPMENT', label: 'Web Development', emoji: '🌐' },
    { value: 'FRONTEND', label: 'Frontend', emoji: '🎨' },
    { value: 'BACKEND', label: 'Backend', emoji: '⚙️' },
    { value: 'DEVOPS', label: 'DevOps', emoji: '🚀' },
    { value: 'AI_ML', label: 'AI/ML', emoji: '🤖' },
    { value: 'DATABASE', label: 'Database', emoji: '🗄️' },
    { value: 'SYSTEM_DESIGN', label: 'System Design', emoji: '🏗️' },
    { value: 'MOBILE', label: 'Mobile', emoji: '📱' },
    { value: 'OTHER', label: 'Other', emoji: '📚' },
]

const levels: { value: PathfinderLevel; label: string; description: string }[] = [
    { value: 'BEGINNER', label: 'Beginner', description: 'Just starting out' },
    { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Know the basics' },
    { value: 'ADVANCED', label: 'Advanced', description: 'Deep dive' },
    { value: 'EXPERT', label: 'Expert', description: 'Master level' },
]

const focusOptions: { id: string; label: string }[] = [
    { id: 'concepts', label: 'Core Concepts' },
    { id: 'practice', label: 'Practice Problems' },
    { id: 'interview', label: 'Interview Prep' },
    { id: 'projects', label: 'Build Projects' },
    { id: 'optimization', label: 'Optimization' },
    { id: 'patterns', label: 'Design Patterns' },
]

export function CreateGoalSheet({ open, onOpenChange, onSuccess, groups = [] }: CreateGoalSheetProps) {
    const [step, setStep] = useState(0)
    const [processing, setProcessing] = useState(false)
    const [progressPercent, setProgressPercent] = useState(0)
    const [formData, setFormData] = useState({
        title: '',
        category: '' as PathfinderCategory | '',
        level: 'INTERMEDIATE' as PathfinderLevel,
        focusAreas: [] as string[],
        groupId: null as string | null,
    })

    const steps = [
        { id: 'title', title: 'What do you want to learn?' },
        { id: 'category', title: 'Choose a category' },
        { id: 'level', title: 'Select your level' },
        { id: 'focus', title: 'Focus areas' },
        ...(groups.length > 0 ? [{ id: 'group', title: 'Add to group (optional)' }] : []),
    ]

    const resetForm = () => {
        setStep(0)
        setProcessing(false)
        setProgressPercent(0)
        setFormData({
            title: '',
            category: '',
            level: 'INTERMEDIATE',
            focusAreas: [],
            groupId: null,
        })
    }

    const canProceed = () => {
        switch (step) {
            case 0: return formData.title.trim().length >= 3
            case 1: return formData.category !== ''
            case 2: return Boolean(formData.level) // Level always has a default
            case 3: return formData.focusAreas.length > 0
            case 4: return true // Group is optional
            default: return false
        }
    }

    const nextStep = () => {
        if (!canProceed()) {
            toast.error('Please complete this step')
            return
        }
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            handleSubmit()
        }
    }

    const prevStep = () => {
        if (step > 0) setStep(step - 1)
    }

    const toggleFocus = (id: string) => {
        setFormData(prev => ({
            ...prev,
            focusAreas: prev.focusAreas.includes(id)
                ? prev.focusAreas.filter(f => f !== id)
                : [...prev.focusAreas, id]
        }))
    }

    const handleSubmit = async () => {
        setProcessing(true)
        setProgressPercent(10)

        const progressInterval = setInterval(() => {
            setProgressPercent(p => Math.min(p + 5, 85))
        }, 500)

        try {
            const result = await createPathfinderGoal({
                title: formData.title,
                category: formData.category as PathfinderCategory,
                level: formData.level,
                focusAreas: formData.focusAreas,
                groupId: formData.groupId,
            })

            clearInterval(progressInterval)

            if (!result.success) {
                throw new Error(result.error || 'Failed to create goal')
            }

            setProgressPercent(100)
            toast.success('Goal created! AI is generating your plan...')

            setTimeout(() => {
                onOpenChange(false)
                resetForm()
                if (onSuccess && result.goalId) {
                    onSuccess(result.goalId)
                }
            }, 1000)
        } catch (error) {
            clearInterval(progressInterval)
            console.error('Error creating goal:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create goal')
            setProcessing(false)
            setProgressPercent(0)
        }
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            onOpenChange(isOpen)
            if (!isOpen) resetForm()
        }}>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <div className="max-w-xl mx-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            Create Learning Goal
                        </SheetTitle>
                        <SheetDescription>
                            Set your goal and let AI create a personalized learning plan
                        </SheetDescription>
                    </SheetHeader>

                    <AnimatePresence mode="wait">
                        {processing ? (
                            <motion.div
                                key="processing"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 blur-2xl opacity-30 animate-pulse" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 flex items-center justify-center"
                                    >
                                        <div className="w-28 h-28 rounded-full bg-white dark:bg-neutral-950 flex items-center justify-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                {progressPercent === 100 ? (
                                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                                ) : (
                                                    <Brain className="w-12 h-12 text-purple-500" />
                                                )}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </div>

                                <h3 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                                    {progressPercent === 100 ? 'Goal Created!' : 'Creating Your Goal'}
                                </h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                                    {progressPercent < 50 ? 'Setting up your learning path...' : 'AI is generating your plan...'}
                                </p>

                                <div className="w-full max-w-md space-y-4">
                                    <Progress value={progressPercent} className="h-3" />
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
                                        {steps.map((s, index) => (
                                            <div key={s.id} className="flex-1 text-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium transition-all",
                                                    index < step ? "bg-green-500 text-white" :
                                                        index === step ? "bg-violet-500 text-white" :
                                                            "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                                                )}>
                                                    {index < step ? <Check className="w-5 h-5" /> : index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
                                </div>

                                {/* Step Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        {/* Step 0: Title */}
                                        {step === 0 && (
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        {steps[0]?.title}
                                                    </h3>
                                                    <p className="text-neutral-500">Be specific about your learning goal</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Goal Title</Label>
                                                    <Input
                                                        placeholder="e.g., Master Arrays and Strings in DSA"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        className="h-14 text-lg"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {['Learn React Hooks', 'Master SQL Queries', 'DSA with Python'].map((example) => (
                                                        <Badge
                                                            key={example}
                                                            variant="outline"
                                                            className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                            onClick={() => setFormData({ ...formData, title: example })}
                                                        >
                                                            {example}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 1: Category */}
                                        {step === 1 && (
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        {steps[1]?.title}
                                                    </h3>
                                                    <p className="text-neutral-500">Select the primary category</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {categories.map((cat) => (
                                                        <motion.button
                                                            key={cat.value}
                                                            onClick={() => setFormData({ ...formData, category: cat.value })}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                                                                formData.category === cat.value
                                                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                            )}
                                                        >
                                                            <span className="text-2xl">{cat.emoji}</span>
                                                            <span className="font-medium text-neutral-900 dark:text-white">{cat.label}</span>
                                                            {formData.category === cat.value && (
                                                                <Check className="w-5 h-5 text-violet-500 ml-auto" />
                                                            )}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Level */}
                                        {step === 2 && (
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        {steps[2]?.title}
                                                    </h3>
                                                    <p className="text-neutral-500">Your current experience level</p>
                                                </div>
                                                <div className="space-y-3">
                                                    {levels.map((level) => (
                                                        <motion.button
                                                            key={level.value}
                                                            onClick={() => setFormData({ ...formData, level: level.value })}
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            className={cn(
                                                                "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between",
                                                                formData.level === level.value
                                                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                            )}
                                                        >
                                                            <div>
                                                                <div className="font-semibold text-neutral-900 dark:text-white">
                                                                    {level.label}
                                                                </div>
                                                                <div className="text-sm text-neutral-500">
                                                                    {level.description}
                                                                </div>
                                                            </div>
                                                            {formData.level === level.value && (
                                                                <Check className="w-5 h-5 text-violet-500" />
                                                            )}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 3: Focus Areas */}
                                        {step === 3 && (
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        {steps[3]?.title}
                                                    </h3>
                                                    <p className="text-neutral-500">Select at least one focus area</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {focusOptions.map((focus) => (
                                                        <motion.button
                                                            key={focus.id}
                                                            onClick={() => toggleFocus(focus.id)}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between",
                                                                formData.focusAreas.includes(focus.id)
                                                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                            )}
                                                        >
                                                            <span className="font-medium text-neutral-900 dark:text-white">{focus.label}</span>
                                                            {formData.focusAreas.includes(focus.id) && (
                                                                <Check className="w-5 h-5 text-violet-500" />
                                                            )}
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 4: Group (Optional) */}
                                        {step === 4 && groups.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        {steps[4]?.title}
                                                    </h3>
                                                    <p className="text-neutral-500">Organize your goal into a group. You can change this later.</p>
                                                </div>
                                                <div className="space-y-3">
                                                    {/* No Group Option */}
                                                    <motion.button
                                                        onClick={() => setFormData({ ...formData, groupId: null })}
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        className={cn(
                                                            "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                                                            formData.groupId === null
                                                                ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                                                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                        )}
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-lg">
                                                            📋
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-neutral-900 dark:text-white">
                                                                No Group
                                                            </div>
                                                            <div className="text-sm text-neutral-500">
                                                                Keep this goal ungrouped
                                                            </div>
                                                        </div>
                                                        {formData.groupId === null && (
                                                            <Check className="w-5 h-5 text-violet-500" />
                                                        )}
                                                    </motion.button>

                                                    {/* Groups */}
                                                    {groups.map((group) => (
                                                        <motion.button
                                                            key={group.id}
                                                            onClick={() => setFormData({ ...formData, groupId: group.id })}
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            className={cn(
                                                                "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3",
                                                                formData.groupId === group.id
                                                                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                            )}
                                                        >
                                                            <div
                                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                                style={{ backgroundColor: group.color || '#7c3aed' }}
                                                            >
                                                                {group.emoji || '📁'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-neutral-900 dark:text-white">
                                                                    {group.name}
                                                                </div>
                                                            </div>
                                                            {formData.groupId === group.id && (
                                                                <Check className="w-5 h-5 text-violet-500" />
                                                            )}
                                                        </motion.button>
                                                    ))}
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
                                        disabled={step === 0}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button
                                        onClick={nextStep}
                                        disabled={!canProceed()}
                                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 text-white"
                                    >
                                        {step === steps.length - 1 ? (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Create Goal
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
    )
}
