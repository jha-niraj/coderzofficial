'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Globe, Lock, UserPlus,
    Hash, Plus, X, Upload, Camera, Smile, ChevronDown, Type, CheckSquare,
    ListOrdered, ToggleLeft, GripVertical, Trash2
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { Label } from '@repo/ui/components/ui/label'
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@repo/ui/components/ui/tooltip'
import {
    Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@repo/ui/lib/utils'
import { createCommunity } from '@/actions/(main)/community/community.action'
import toast from '@repo/ui/components/ui/sonner'

// Emoji picker for category icons
const CATEGORY_ICONS = [
    '💬', '💻', '📚', '💼', '🔢', '🌐', '🤖', '🔓', '🎓', '🎮', '🎨', '🏢', '🚀', '⚡',
    '🔥', '💡', '🎯', '🏆', '📱', '🔧', '☁️', '🛡️', '📊', '🎵', '🎬', '📸', '✍️', '🧪'
]

const PRESET_CATEGORIES = [
    { value: 'General', icon: '💬' },
    { value: 'Tech', icon: '💻' },
    { value: 'Study', icon: '📚' },
    { value: 'Career', icon: '💼' },
    { value: 'DSA & Algorithms', icon: '🔢' },
    { value: 'Web Development', icon: '🌐' },
    { value: 'AI & Machine Learning', icon: '🤖' },
    { value: 'Open Source', icon: '🔓' },
    { value: 'College', icon: '🎓' },
    { value: 'Gaming', icon: '🎮' },
    { value: 'Design', icon: '🎨' },
    { value: 'Company', icon: '🏢' },
]

const VISIBILITY_OPTIONS = [
    {
        value: 'PUBLIC',
        label: 'Public',
        icon: Globe,
        description: 'Anyone can find and join',
        color: 'border-green-500 bg-green-50 dark:bg-green-950/30'
    },
    {
        value: 'RESTRICTED',
        label: 'Restricted',
        icon: UserPlus,
        description: 'Anyone can see, but requires approval to join',
        color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
    },
    {
        value: 'PRIVATE',
        label: 'Private',
        icon: Lock,
        description: 'Only invited members can see and join',
        color: 'border-red-500 bg-red-50 dark:bg-red-950/30'
    },
]

const DEFAULT_SECTIONS = [
    { id: 'FEED', name: 'Feed', icon: '📰', description: 'General posts and discussions', default: true },
    { id: 'RESOURCES', name: 'Resources', icon: '📚', description: 'Share files, PDFs, links', default: true },
    { id: 'QA', name: 'Q&A', icon: '❓', description: 'Questions and answers', default: false },
    { id: 'SHOWCASE', name: 'Showcase', icon: '🎨', description: 'Share completed projects', default: false },
    { id: 'EVENTS', name: 'Events', icon: '📅', description: 'Community events', default: false },
    { id: 'CHALLENGES', name: 'Challenges', icon: '🏆', description: 'Weekly/Monthly challenges', default: false },
    { id: 'JOBS', name: 'Jobs', icon: '💼', description: 'Job postings and referrals', default: false },
    { id: 'HELP', name: 'Help Room', icon: '🆘', description: 'Real-time help requests', default: false },
    { id: 'CODE_REVIEW', name: 'Code Review', icon: '👀', description: 'Request code reviews', default: false },
]

// Question types for join questions
type QuestionType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'

interface JoinQuestion {
    id: string
    type: QuestionType
    question: string
    required: boolean
    options?: string[] // For select, checkbox, radio
}

const QUESTION_TYPES: { type: QuestionType; label: string; icon: React.ReactNode }[] = [
    { type: 'text', label: 'Short Text', icon: <Type className="w-4 h-4" /> },
    { type: 'textarea', label: 'Long Text', icon: <ListOrdered className="w-4 h-4" /> },
    { type: 'select', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" /> },
    { type: 'checkbox', label: 'Checkboxes', icon: <CheckSquare className="w-4 h-4" /> },
    { type: 'radio', label: 'Radio Options', icon: <ToggleLeft className="w-4 h-4" /> },
]

type StepId = 'name' | 'category' | 'visibility' | 'sections' | 'questions' | 'rules' | 'customize' | 'review'

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
    { id: 'name', title: "What's your community called?", subtitle: 'Give it a name that describes its purpose' },
    { id: 'category', title: 'What category best fits?', subtitle: 'Choose or create your own category' },
    { id: 'visibility', title: 'Who can join?', subtitle: 'Control who can see and join your community' },
    { id: 'sections', title: 'Enable community sections', subtitle: 'Choose the features your community needs' },
    { id: 'questions', title: 'Join questions', subtitle: 'Ask questions before members join (optional)' },
    { id: 'rules', title: 'Set community rules', subtitle: 'Help maintain a healthy community' },
    { id: 'customize', title: 'Customize appearance', subtitle: 'Upload logo, cover and set theme' },
    { id: 'review', title: 'Review and create', subtitle: 'Check everything before launching' },
]

export default function CreateCommunityPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const coverInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        category: '',
        categoryIcon: '💬',
        isCustomCategory: false,
        visibility: 'PUBLIC',
        enabledSections: ['FEED', 'RESOURCES'],
        rules: ['Be respectful to all members', 'No spam or self-promotion', 'Stay on topic'],
        tags: [] as string[],
        themeColor: '#3B82F6',
        logo: null as string | null,
        coverImage: null as string | null,
        joinQuestions: [] as JoinQuestion[],
        verificationReason: ''
    })

    const [tagInput, setTagInput] = useState('')
    const [ruleInput, setRuleInput] = useState('')
    const [customCategory, setCustomCategory] = useState('')
    const [showCustomCategory, setShowCustomCategory] = useState(false)

    // Auto-generate slug from name
    useEffect(() => {
        if (formData.name) {
            setFormData(prev => ({
                ...prev,
                slug: formData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .slice(0, 50)
            }))
        }
    }, [formData.name])

    // Auto-focus input on step change
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 300)
    }, [currentStep])

    const canProceed = () => {
        switch (STEPS[currentStep].id) {
            case 'name':
                return formData.name.length >= 3 && formData.description.length >= 10
            case 'category':
                return !!formData.category
            case 'visibility':
                return !!formData.visibility
            case 'sections':
                return formData.enabledSections.length > 0
            case 'rules':
                return formData.rules.length > 0
            default:
                return true
        }
    }

    const goToStep = (index: number) => {
        // Only allow going to previous steps or if current step is complete
        if (index < currentStep || canProceed()) {
            setCurrentStep(index)
        }
    }

    const nextStep = () => {
        if (!canProceed()) {
            toast.error('Please complete this step')
            return
        }
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            nextStep()
        }
    }

    // Image upload handlers
    const handleImageUpload = useCallback((
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'logo' | 'coverImage'
    ) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            setFormData(prev => ({ ...prev, [type]: reader.result as string }))
        }
        reader.readAsDataURL(file)
    }, [])

    // Tag handlers
    const addTag = () => {
        const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
            setTagInput('')
        }
    }

    const removeTag = (tag: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    }

    // Rule handlers
    const addRule = () => {
        const rule = ruleInput.trim()
        if (rule && formData.rules.length < 10) {
            setFormData(prev => ({ ...prev, rules: [...prev.rules, rule] }))
            setRuleInput('')
        }
    }

    const removeRule = (index: number) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }))
    }

    // Section handler
    const toggleSection = (sectionId: string) => {
        setFormData(prev => ({
            ...prev,
            enabledSections: prev.enabledSections.includes(sectionId)
                ? prev.enabledSections.filter(s => s !== sectionId)
                : [...prev.enabledSections, sectionId]
        }))
    }

    // Category handlers
    const selectCategory = (category: string, icon: string) => {
        setFormData(prev => ({
            ...prev,
            category,
            categoryIcon: icon,
            isCustomCategory: false
        }))
        setShowCustomCategory(false)
    }

    const setCustomCategoryValue = () => {
        if (customCategory.trim()) {
            setFormData(prev => ({
                ...prev,
                category: customCategory.trim(),
                isCustomCategory: true
            }))
        }
    }

    // Join question handlers
    const addQuestion = (type: QuestionType) => {
        const newQuestion: JoinQuestion = {
            id: crypto.randomUUID(),
            type,
            question: '',
            required: false,
            options: type === 'select' || type === 'checkbox' || type === 'radio' ? [''] : undefined
        }
        setFormData(prev => ({
            ...prev,
            joinQuestions: [...prev.joinQuestions, newQuestion]
        }))
    }

    const updateQuestion = (id: string, updates: Partial<JoinQuestion>) => {
        setFormData(prev => ({
            ...prev,
            joinQuestions: prev.joinQuestions.map(q =>
                q.id === id ? { ...q, ...updates } : q
            )
        }))
    }

    const removeQuestion = (id: string) => {
        setFormData(prev => ({
            ...prev,
            joinQuestions: prev.joinQuestions.filter(q => q.id !== id)
        }))
    }

    const addQuestionOption = (questionId: string) => {
        setFormData(prev => ({
            ...prev,
            joinQuestions: prev.joinQuestions.map(q =>
                q.id === questionId && q.options
                    ? { ...q, options: [...q.options, ''] }
                    : q
            )
        }))
    }

    const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            joinQuestions: prev.joinQuestions.map(q =>
                q.id === questionId && q.options
                    ? { ...q, options: q.options.map((o, i) => i === optionIndex ? value : o) }
                    : q
            )
        }))
    }

    const removeQuestionOption = (questionId: string, optionIndex: number) => {
        setFormData(prev => ({
            ...prev,
            joinQuestions: prev.joinQuestions.map(q =>
                q.id === questionId && q.options && q.options.length > 1
                    ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
                    : q
            )
        }))
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            const result = await createCommunity({
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                shortDescription: formData.shortDescription,
                category: formData.category,
                visibility: formData.visibility as any,
                enabledSections: formData.enabledSections,
                rules: formData.rules,
                tags: formData.tags,
                themeColor: formData.themeColor,
                logo: formData.logo || undefined,
                coverImage: formData.coverImage || undefined,
                verificationReason: formData.verificationReason
            })

            if (result.success && result.data) {
                toast.success('Community created successfully!')
                router.push(`/community/${result.data.slug}`)
            } else {
                toast.error(result.error || 'Failed to create community')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const currentStepConfig = STEPS[currentStep]

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="fixed top-16 left-0 right-0 z-50 h-1 bg-neutral-200 dark:bg-neutral-800">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
            <div className="fixed top-20 left-4 right-4 z-40 flex items-center justify-between">
                <Link href="/community">
                    <Button variant="ghost" size="sm" className="gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </Link>
                <TooltipProvider delayDuration={100}>
                    <div className="hidden md:flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-full px-4 py-2">
                        {
                            STEPS.map((step, index) => (
                                <Tooltip key={step.id}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => goToStep(index)}
                                            className={cn(
                                                "rounded-full transition-all duration-300 hover:scale-125",
                                                index === currentStep
                                                    ? "w-6 h-2 bg-gradient-to-r from-blue-600 to-purple-600"
                                                    : index < currentStep
                                                        ? "w-2 h-2 bg-green-500 hover:bg-green-600 cursor-pointer"
                                                        : "w-2 h-2 bg-neutral-300 dark:bg-neutral-600"
                                            )}
                                            disabled={index > currentStep && !canProceed()}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="font-medium">
                                        <p>{step.title.replace("What's your community called?", "Name & Description")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))
                        }
                    </div>
                </TooltipProvider>
                <div className="text-sm text-neutral-500 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-full px-4 py-2">
                    {currentStep + 1} / {STEPS.length}
                </div>
            </div>
            <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="text-center mb-8">
                            <motion.h1
                                className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {currentStepConfig.title}
                            </motion.h1>
                            <motion.p
                                className="text-neutral-600 dark:text-neutral-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {currentStepConfig.subtitle}
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {
                                currentStepConfig.id === 'name' && (
                                    <div className="space-y-6">
                                        <Input
                                            ref={inputRef}
                                            placeholder="e.g., React Developers, DSA Masters..."
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            onKeyDown={handleKeyDown}
                                            className="text-xl h-16 px-6 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl"
                                        />
                                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                                            <span>URL:</span>
                                            <code className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">
                                                /community/{formData.slug || 'your-community'}
                                            </code>
                                        </div>
                                        <Textarea
                                            placeholder="Describe what your community is about..."
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            rows={4}
                                            className="text-lg p-6 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl resize-none"
                                        />
                                    </div>
                                )
                            }
                            {
                                currentStepConfig.id === 'category' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {
                                                PRESET_CATEGORIES.map((cat) => {
                                                    const isSelected = formData.category === cat.value && !formData.isCustomCategory
                                                    return (
                                                        <motion.button
                                                            key={cat.value}
                                                            onClick={() => selectCategory(cat.value, cat.icon)}
                                                            className={cn(
                                                                "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                                                                isSelected
                                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300"
                                                            )}
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <div className="text-3xl mb-3">{cat.icon}</div>
                                                            <div className="font-semibold text-neutral-900 dark:text-white">
                                                                {cat.value}
                                                            </div>
                                                            {
                                                                isSelected && (
                                                                    <motion.div
                                                                        className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                    >
                                                                        <Check className="w-4 h-4 text-white" />
                                                                    </motion.div>
                                                                )
                                                            }
                                                        </motion.button>
                                                    )
                                                })
                                            }
                                            <motion.button
                                                onClick={() => setShowCustomCategory(true)}
                                                className={cn(
                                                    "relative p-6 rounded-2xl border-2 border-dashed transition-all duration-300 text-left",
                                                    formData.isCustomCategory
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                                        : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 hover:border-neutral-400"
                                                )}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="text-3xl mb-3">
                                                    {formData.isCustomCategory ? formData.categoryIcon : <Plus className="w-8 h-8 text-neutral-400" />}
                                                </div>
                                                <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                                                    {formData.isCustomCategory ? formData.category : 'Custom'}
                                                </div>
                                                {
                                                    formData.isCustomCategory && (
                                                        <motion.div
                                                            className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                        >
                                                            <Check className="w-4 h-4 text-white" />
                                                        </motion.div>
                                                    )
                                                }
                                            </motion.button>
                                        </div>
                                        {
                                            showCustomCategory && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 space-y-4"
                                                >
                                                    <Label className="text-sm font-medium">Create Custom Category</Label>
                                                    <div className="flex gap-3">
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" className="w-16 h-12 text-2xl">
                                                                    {formData.categoryIcon}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-64 p-2">
                                                                <div className="grid grid-cols-7 gap-1">
                                                                    {
                                                                        CATEGORY_ICONS.map((icon) => (
                                                                            <button
                                                                                key={icon}
                                                                                onClick={() => setFormData(prev => ({ ...prev, categoryIcon: icon }))}
                                                                                className={cn(
                                                                                    "p-2 text-xl rounded hover:bg-neutral-100 dark:hover:bg-neutral-800",
                                                                                    formData.categoryIcon === icon && "bg-blue-100 dark:bg-blue-900"
                                                                                )}
                                                                            >
                                                                                {icon}
                                                                            </button>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <Input
                                                            placeholder="Category name..."
                                                            value={customCategory}
                                                            onChange={(e) => setCustomCategory(e.target.value)}
                                                            className="flex-1 h-12"
                                                        />
                                                        <Button onClick={setCustomCategoryValue} disabled={!customCategory.trim()}>
                                                            Set
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )
                                        }
                                    </div>
                                )
                            }
                            {
                                currentStepConfig.id === 'visibility' && (
                                    <div className="space-y-4">
                                        {
                                            VISIBILITY_OPTIONS.map((option) => {
                                                const Icon = option.icon
                                                const isSelected = formData.visibility === option.value
                                                return (
                                                    <motion.button
                                                        key={option.value}
                                                        onClick={() => setFormData(prev => ({ ...prev, visibility: option.value }))}
                                                        className={cn(
                                                            "w-full p-6 rounded-2xl border-2 text-left transition-all duration-300",
                                                            isSelected
                                                                ? option.color
                                                                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                                        )}
                                                        whileHover={{ scale: 1.01 }}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <Icon className={cn(
                                                                "w-6 h-6 mt-1",
                                                                isSelected ? "text-current" : "text-neutral-400"
                                                            )} />
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-neutral-900 dark:text-white">
                                                                    {option.label}
                                                                </div>
                                                                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                    {option.description}
                                                                </div>
                                                            </div>
                                                            {isSelected && <Check className="w-5 h-5 text-green-600" />}
                                                        </div>
                                                    </motion.button>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            }
                            {
                                currentStepConfig.id === 'sections' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {
                                            DEFAULT_SECTIONS.map((section) => {
                                                const isSelected = formData.enabledSections.includes(section.id)
                                                return (
                                                    <motion.button
                                                        key={section.id}
                                                        onClick={() => toggleSection(section.id)}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 text-left transition-all duration-200",
                                                            isSelected
                                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                                                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300"
                                                        )}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-2xl">{section.icon}</span>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-neutral-900 dark:text-white">
                                                                    {section.name}
                                                                </div>
                                                                <div className="text-xs text-neutral-500">
                                                                    {section.description}
                                                                </div>
                                                            </div>
                                                            <div className={cn(
                                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                                isSelected
                                                                    ? "bg-blue-500 border-blue-500"
                                                                    : "border-neutral-300 dark:border-neutral-600"
                                                            )}>
                                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            }
                            {
                                currentStepConfig.id === 'questions' && (
                                    <div className="space-y-6">
                                        <p className="text-sm text-neutral-500 text-center">
                                            These questions will be asked when users request to join your community
                                        </p>
                                        {
                                            formData.joinQuestions.length > 0 && (
                                                <div className="space-y-4">
                                                    {
                                                        formData.joinQuestions.map((question, index) => (
                                                            <motion.div
                                                                key={question.id}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="p-1 text-neutral-400">
                                                                        <GripVertical className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1 space-y-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="secondary" className="text-xs">
                                                                                {QUESTION_TYPES.find(t => t.type === question.type)?.label}
                                                                            </Badge>
                                                                            <span className="text-xs text-neutral-400">Q{index + 1}</span>
                                                                        </div>
                                                                        <Input
                                                                            placeholder="Enter your question..."
                                                                            value={question.question}
                                                                            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                                                            className="font-medium"
                                                                        />
                                                                        {
                                                                            question.options && (
                                                                                <div className="space-y-2 pl-4">
                                                                                    <Label className="text-xs text-neutral-500">Options</Label>
                                                                                    {
                                                                                        question.options.map((option, optIndex) => (
                                                                                            <div key={optIndex} className="flex items-center gap-2">
                                                                                                <Input
                                                                                                    placeholder={`Option ${optIndex + 1}`}
                                                                                                    value={option}
                                                                                                    onChange={(e) => updateQuestionOption(question.id, optIndex, e.target.value)}
                                                                                                    className="flex-1 h-9 text-sm"
                                                                                                />
                                                                                                {
                                                                                                    question.options!.length > 1 && (
                                                                                                        <Button
                                                                                                            variant="ghost"
                                                                                                            size="sm"
                                                                                                            onClick={() => removeQuestionOption(question.id, optIndex)}
                                                                                                            className="h-9 w-9 p-0 text-neutral-400 hover:text-red-500"
                                                                                                        >
                                                                                                            <X className="w-4 h-4" />
                                                                                                        </Button>
                                                                                                    )
                                                                                                }
                                                                                            </div>
                                                                                        ))
                                                                                    }
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => addQuestionOption(question.id)}
                                                                                        className="text-xs gap-1"
                                                                                    >
                                                                                        <Plus className="w-3 h-3" />
                                                                                        Add Option
                                                                                    </Button>
                                                                                </div>
                                                                            )
                                                                        }
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={question.required}
                                                                                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                                                                    className="rounded"
                                                                                />
                                                                                Required
                                                                            </label>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => removeQuestion(question.id)}
                                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        }
                                        {
                                            formData.joinQuestions.length < 10 && (
                                                <div className="space-y-3">
                                                    <Label className="text-sm text-neutral-600 dark:text-neutral-400">Add a question</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {
                                                            QUESTION_TYPES.map((qt) => (
                                                                <Button
                                                                    key={qt.type}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => addQuestion(qt.type)}
                                                                    className="gap-2"
                                                                >
                                                                    {qt.icon}
                                                                    {qt.label}
                                                                </Button>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        }
                                        {
                                            formData.joinQuestions.length === 0 && (
                                                <div className="text-center py-8 text-neutral-400">
                                                    <Smile className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p>No questions yet. Add questions above or skip this step.</p>
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }
                            {
                                currentStepConfig.id === 'rules' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            {
                                                formData.rules.map((rule, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700"
                                                    >
                                                        <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-sm flex items-center justify-center font-medium">
                                                            {index + 1}
                                                        </span>
                                                        <span className="flex-1 text-neutral-700 dark:text-neutral-300">
                                                            {rule}
                                                        </span>
                                                        <button
                                                            onClick={() => removeRule(index)}
                                                            className="text-neutral-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </motion.div>
                                                ))
                                            }
                                        </div>
                                        {
                                            formData.rules.length < 10 && (
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Add a new rule..."
                                                        value={ruleInput}
                                                        onChange={(e) => setRuleInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                addRule()
                                                            }
                                                        }}
                                                        className="flex-1"
                                                    />
                                                    <Button onClick={addRule} disabled={!ruleInput.trim()}>
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            }
                            {
                                currentStepConfig.id === 'customize' && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Community Images
                                            </Label>
                                            <div className="flex gap-6">
                                                <div className="space-y-2">
                                                    <button
                                                        onClick={() => logoInputRef.current?.click()}
                                                        className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden group"
                                                        style={{ backgroundColor: !formData.logo ? formData.themeColor : undefined }}
                                                    >
                                                        {
                                                            formData.logo ? (
                                                                <>
                                                                    <Image
                                                                        src={formData.logo}
                                                                        alt="Logo"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Camera className="w-6 h-6 text-white" />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center text-white">
                                                                    <Upload className="w-6 h-6 mx-auto mb-1" />
                                                                    <span className="text-xs">Logo</span>
                                                                </div>
                                                            )
                                                        }
                                                    </button>
                                                    <input
                                                        ref={logoInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(e, 'logo')}
                                                    />
                                                    {
                                                        formData.logo && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                                                                className="w-full text-xs text-red-500"
                                                            >
                                                                Remove
                                                            </Button>
                                                        )
                                                    }
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <button
                                                        onClick={() => coverInputRef.current?.click()}
                                                        className="relative w-full h-24 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 hover:border-blue-500 transition-colors flex items-center justify-center overflow-hidden group"
                                                        style={{
                                                            background: !formData.coverImage
                                                                ? `linear-gradient(135deg, ${formData.themeColor}40, ${formData.themeColor}20)`
                                                                : undefined
                                                        }}
                                                    >
                                                        {
                                                            formData.coverImage ? (
                                                                <>
                                                                    <Image
                                                                        src={formData.coverImage}
                                                                        alt="Cover"
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Camera className="w-6 h-6 text-white" />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center text-neutral-500">
                                                                    <Upload className="w-6 h-6 mx-auto mb-1" />
                                                                    <span className="text-xs">Cover Image (Optional)</span>
                                                                </div>
                                                            )
                                                        }
                                                    </button>
                                                    <input
                                                        ref={coverInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(e, 'coverImage')}
                                                    />
                                                    {
                                                        formData.coverImage && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                                                                className="w-full text-xs text-red-500"
                                                            >
                                                                Remove
                                                            </Button>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Theme Color
                                            </Label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <input
                                                        type="color"
                                                        value={formData.themeColor}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                                                        className="w-16 h-16 rounded-xl cursor-pointer border-2 border-neutral-200 dark:border-neutral-700"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Input
                                                        value={formData.themeColor}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                                                        placeholder="#3B82F6"
                                                        className="font-mono"
                                                    />
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        Click the color box or enter a hex code
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Tags (help people find your community)
                                            </Label>
                                            <div className="space-y-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {
                                                        formData.tags.map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                                #{tag}
                                                                <button onClick={() => removeTag(tag)} className="ml-1">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </Badge>
                                                        ))
                                                    }
                                                </div>
                                                {
                                                    formData.tags.length < 5 && (
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                                <Input
                                                                    placeholder="Add tag"
                                                                    value={tagInput}
                                                                    onChange={(e) => setTagInput(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault()
                                                                            addTag()
                                                                        }
                                                                    }}
                                                                    className="pl-9"
                                                                />
                                                            </div>
                                                            <Button variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
                                                                <Plus className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                currentStepConfig.id === 'review' && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                                            <div
                                                className="h-32 relative"
                                                style={{
                                                    background: formData.coverImage
                                                        ? `url(${formData.coverImage}) center/cover`
                                                        : `linear-gradient(135deg, ${formData.themeColor}40, ${formData.themeColor}20)`
                                                }}
                                            >
                                                <div className="absolute -bottom-8 left-6">
                                                    <div
                                                        className="w-20 h-20 rounded-xl border-4 border-white dark:border-neutral-900 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                                                        style={{
                                                            background: formData.logo
                                                                ? `url(${formData.logo}) center/cover`
                                                                : formData.themeColor
                                                        }}
                                                    >
                                                        {!formData.logo && formData.name.charAt(0)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 pt-12 space-y-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                                        {formData.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                                        <Badge variant="secondary" className="gap-1">
                                                            <span>{formData.isCustomCategory ? formData.categoryIcon : PRESET_CATEGORIES.find(c => c.value === formData.category)?.icon}</span>
                                                            {formData.category}
                                                        </Badge>
                                                        <Badge variant="outline" className="gap-1">
                                                            {formData.visibility === 'PUBLIC' && <Globe className="w-3 h-3" />}
                                                            {formData.visibility === 'RESTRICTED' && <UserPlus className="w-3 h-3" />}
                                                            {formData.visibility === 'PRIVATE' && <Lock className="w-3 h-3" />}
                                                            {formData.visibility.charAt(0) + formData.visibility.slice(1).toLowerCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                                    {formData.description}
                                                </p>
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                                    <div>
                                                        <div className="text-sm text-neutral-500 mb-1">Sections</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {
                                                                formData.enabledSections.slice(0, 4).map((sectionId) => {
                                                                    const section = DEFAULT_SECTIONS.find(s => s.id === sectionId)
                                                                    return section ? (
                                                                        <span key={sectionId} className="text-lg">{section.icon}</span>
                                                                    ) : null
                                                                })
                                                            }
                                                            {
                                                                formData.enabledSections.length > 4 && (
                                                                    <span className="text-sm text-neutral-400">+{formData.enabledSections.length - 4}</span>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-neutral-500 mb-1">Rules</div>
                                                        <div className="text-sm font-medium">{formData.rules.length} rules</div>
                                                    </div>
                                                    {
                                                        formData.joinQuestions.length > 0 && (
                                                            <div>
                                                                <div className="text-sm text-neutral-500 mb-1">Join Questions</div>
                                                                <div className="text-sm font-medium">{formData.joinQuestions.length} questions</div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                                {
                                                    formData.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                                                            {
                                                                formData.tags.map((tag) => (
                                                                    <Badge key={tag} variant="secondary">#{tag}</Badge>
                                                                ))
                                                            }
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </motion.div>
                        <motion.div
                            className="flex items-center justify-between mt-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            {
                                currentStep < STEPS.length - 1 ? (
                                    <Button
                                        onClick={nextStep}
                                        disabled={!canProceed()}
                                        className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8"
                                        size="lg"
                                    >
                                        Continue
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white px-8"
                                        size="lg"
                                    >
                                        {
                                            isLoading ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                                            ) : (
                                                <><Sparkles className="w-5 h-5" /> Create Community</>
                                            )
                                        }
                                    </Button>
                                )
                            }
                        </motion.div>
                        {
                            currentStep < STEPS.length - 1 && canProceed() && (
                                <motion.p
                                    className="text-center text-sm text-neutral-400 mt-6"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">Enter ↵</kbd> to continue
                                </motion.p>
                            )
                        }
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}