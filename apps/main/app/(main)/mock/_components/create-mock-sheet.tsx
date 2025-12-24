'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Switch } from '@repo/ui/components/ui/switch'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@repo/ui/components/ui/dialog'
import {
    Sparkles, FileText, Globe, Lock, Loader2, CheckCircle, AlertCircle,
    Brain, Zap, Info, Clock, ChevronRight, BookOpen
} from 'lucide-react'
import toast from '@repo/ui/components/ui/sonner'
import { createCustomMockVoice } from '@/actions/(main)/mockvoice/voice.action'
import { MOCK_CATEGORIES, MOCK_LEVELS } from '../voice/_constants/mock-categories'
import { MockCategory } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/app/store/useUserStore'
import { cn } from '@repo/ui/lib/utils'
import Link from 'next/link'

interface CreateMockSheetProps {
    isOpen: boolean
    onClose: () => void
    userCredits: number
}

export function CreateMockSheet({ isOpen, onClose, userCredits }: CreateMockSheetProps) {
    const router = useRouter()
    const { user } = useUserStore()
    const [step, setStep] = useState(1)
    const [processing, setProcessing] = useState<'idle' | 'processing' | 'success' | 'choose-action'>('idle')
    const [createdMockId, setCreatedMockId] = useState<string | null>(null)
    const [showResumeDialog, setShowResumeDialog] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'GENERAL' as MockCategory,
        level: 'INTERMEDIATE',
        includeResume: false,
        isPublic: false,
        duration: 15,
        questionsCount: 5,
        knowledgeBase: ''
    })

    // Calculate credits
    const baseCredits = formData.duration
    const questionCredits = formData.questionsCount * 2
    const subtotal = (baseCredits + questionCredits) * (formData.isPublic ? 0.5 : 1)
    const resumeCredits = formData.includeResume ? 5 : 0
    const totalCredits = Math.ceil(subtotal + resumeCredits)

    const resetForm = () => {
        setStep(1)
        setProcessing('idle')
        setFormData({
            title: '',
            description: '',
            category: 'GENERAL' as MockCategory,
            level: 'INTERMEDIATE',
            includeResume: false,
            isPublic: false,
            duration: 15,
            questionsCount: 5,
            knowledgeBase: ''
        })
        setCreatedMockId(null)
    }

    const handleTitleChange = (title: string) => {
        setFormData({ ...formData, title })
    }

    const handleResumeToggle = (checked: boolean) => {
        if (checked && !user?.hasResume && !user?.resume) {
            setShowResumeDialog(true)
            return
        }
        setFormData({ ...formData, includeResume: checked })
    }

    const handleGoToProfile = () => {
        setShowResumeDialog(false)
        onClose()
        router.push('/profile?tab=documents')
    }

    const handleContinueWithoutResume = () => {
        setShowResumeDialog(false)
        setFormData({ ...formData, includeResume: false })
    }

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.title.trim() && formData.description.trim()
            case 2:
                return true
            case 3:
                return true
            default:
                return false
        }
    }

    const handleSubmit = async () => {
        if (userCredits < totalCredits) {
            toast.error('Insufficient credits')
            return
        }

        setProcessing('processing')

        try {
            const result = await createCustomMockVoice({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                level: formData.level,
                duration: formData.duration,
                questionsCount: formData.questionsCount,
                includeResume: formData.includeResume,
                isPublic: formData.isPublic,
                knowledgeBase: formData.knowledgeBase || undefined
            })

            if (!result.success) {
                throw new Error(result.error || 'Failed to create mock')
            }

            setCreatedMockId(result.mockId!)
            setProcessing('success')

            setTimeout(() => {
                setProcessing('choose-action')
            }, 1500)
        } catch (error) {
            console.error('Error creating mock:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create mock interview')
            setProcessing('idle')
        }
    }

    const handleStartNow = async () => {
        if (!createdMockId) return

        try {
            const { createMockVoiceSession } = await import('@/actions/(main)/mockvoice/session.action')

            const result = await createMockVoiceSession({
                mockId: createdMockId,
                mockType: 'custom',
                includesResume: formData.includeResume
            })

            if (!result.success) {
                throw new Error(result.error || 'Failed to start session')
            }

            toast.success('Starting your interview!')
            onClose()
            resetForm()
            router.push(`/mock/voice/interview/${result.sessionId}`)
        } catch (error) {
            console.error('Error starting interview:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to start interview')
        }
    }

    const handleStartLater = () => {
        toast.success('Mock interview created successfully!')
        onClose()
        resetForm()
        router.push('/mock/voice/mymocks')
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => {
                if (!open) {
                    onClose()
                    resetForm()
                }
            }}>
                <SheetContent className="w-full sm:max-w-2xl overflow-hidden p-0 bg-white dark:bg-neutral-950">
                    {/* Header with Step Indicator */}
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
                        <SheetHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <SheetTitle className="text-xl font-bold text-neutral-900 dark:text-white">
                                        Create Custom Mock Interview
                                    </SheetTitle>
                                    <SheetDescription className="text-neutral-600 dark:text-neutral-400">
                                        Design your personalized AI-powered interview
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>
                        
                        {/* Step Indicator */}
                        <div className="flex items-center gap-2 mt-6">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex-1 flex items-center gap-2">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                                        step >= s
                                            ? "bg-purple-600 text-white"
                                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                                    )}>
                                        {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div className={cn(
                                            "flex-1 h-1 rounded-full transition-all",
                                            step > s ? "bg-purple-600" : "bg-neutral-200 dark:bg-neutral-700"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Credit Info */}
                        <div className="flex items-center gap-3 mt-4 text-sm">
                            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {totalCredits} Credits Required
                            </Badge>
                            <span className="text-neutral-600 dark:text-neutral-400">
                                You have <span className="font-semibold text-neutral-900 dark:text-white">{userCredits}</span> credits
                            </span>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <ScrollArea className="h-[calc(100vh-340px)]">
                        <div className="p-6">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Basic Information */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                                Basic Information
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Tell us about the role you're preparing for
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="title">Position Title *</Label>
                                                <Input
                                                    id="title"
                                                    placeholder="e.g., Senior Frontend Developer, SDE-2, Product Manager"
                                                    value={formData.title}
                                                    onChange={(e) => handleTitleChange(e.target.value)}
                                                    className="h-11"
                                                />
                                                <p className="text-xs text-neutral-500">
                                                    Be specific about the role you're preparing for
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description *</Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="Describe the key areas you want to focus on, specific technologies, or any particular challenges..."
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    rows={3}
                                                    className="resize-none"
                                                />
                                                <p className="text-xs text-neutral-500">
                                                    The AI will use this to generate relevant questions
                                                </p>
                                            </div>

                                            {/* Category Selection */}
                                            <div className="space-y-2">
                                                <Label>Interview Category *</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => setFormData({ ...formData, category: value as MockCategory })}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MOCK_CATEGORIES.filter(c => c.value !== 'ALL').map((category) => (
                                                            <SelectItem key={category.value} value={category.value}>
                                                                <span className="flex items-center gap-2">
                                                                    <span>{category.icon}</span>
                                                                    <span>{category.label}</span>
                                                                </span>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-neutral-500">
                                                    Choose the type of interview you want to practice
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-2">
                                                    <Label>Experience Level</Label>
                                                    <Select
                                                        value={formData.level}
                                                        onValueChange={(value) => setFormData({ ...formData, level: value })}
                                                    >
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {MOCK_LEVELS.filter(l => l.value !== 'ALL').map((level) => (
                                                                <SelectItem key={level.value} value={level.value}>
                                                                    {level.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Duration</Label>
                                                    <Select
                                                        value={formData.duration.toString()}
                                                        onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                                                    >
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="10">10 min</SelectItem>
                                                            <SelectItem value="15">15 min</SelectItem>
                                                            <SelectItem value="20">20 min</SelectItem>
                                                            <SelectItem value="25">25 min</SelectItem>
                                                            <SelectItem value="30">30 min</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Questions</Label>
                                                    <Select
                                                        value={formData.questionsCount.toString()}
                                                        onValueChange={(value) => setFormData({ ...formData, questionsCount: parseInt(value) })}
                                                    >
                                                        <SelectTrigger className="h-11">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3">3 qs</SelectItem>
                                                            <SelectItem value="5">5 qs</SelectItem>
                                                            <SelectItem value="7">7 qs</SelectItem>
                                                            <SelectItem value="10">10 qs</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Knowledge Base (Optional) */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                                Knowledge Base (Optional)
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Paste your syllabus, study notes, or any content you want the interviewer to focus on
                                            </p>
                                        </div>
                                        
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                                            <div className="flex gap-2">
                                                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-blue-900 dark:text-blue-100">
                                                    <p className="font-medium mb-1">Pro Tip</p>
                                                    <p className="text-blue-700 dark:text-blue-300">
                                                        Adding your syllabus or course content helps the AI ask more targeted questions. 
                                                        If you skip this, the AI will generate questions based on the position title and description.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Textarea
                                                placeholder={`Paste your study materials, syllabus, or notes here...

Example:
- Chapter 1: JavaScript Fundamentals
  - Variables, Data Types, Operators
  - Functions and Scope
  - Arrays and Objects
  
- Chapter 2: React Basics
  - Components and Props
  - State Management
  - Hooks (useState, useEffect)
  
This helps the AI interviewer focus on these specific topics.`}
                                                value={formData.knowledgeBase}
                                                onChange={(e) => setFormData({ ...formData, knowledgeBase: e.target.value })}
                                                rows={12}
                                                className="font-mono text-sm resize-none"
                                            />
                                            <div className="flex items-center justify-between text-sm">
                                                <span className={formData.knowledgeBase.length > 0 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : 'text-neutral-500'
                                                }>
                                                    {formData.knowledgeBase.length} characters
                                                </span>
                                                {formData.knowledgeBase.length === 0 && (
                                                    <span className="text-neutral-500 text-xs">
                                                        Optional - Skip if you want AI to generate content
                                                    </span>
                                                )}
                                                {formData.knowledgeBase.length > 0 && (
                                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Additional Options & Summary */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div>
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                                Additional Options
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Configure resume context and visibility
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {/* Resume Toggle */}
                                            <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                                        <div>
                                                            <div className="font-medium text-neutral-900 dark:text-white">
                                                                Include Resume Context
                                                            </div>
                                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                AI will ask questions based on your experience
                                                            </div>
                                                            <Badge variant="outline" className="text-xs mt-1">
                                                                +5 credits
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.includeResume}
                                                        onCheckedChange={handleResumeToggle}
                                                    />
                                                </div>
                                            </div>

                                            {/* Visibility Toggle */}
                                            <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-3">
                                                        {formData.isPublic ? (
                                                            <Globe className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                                        ) : (
                                                            <Lock className="w-5 h-5 text-neutral-500 mt-0.5" />
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-neutral-900 dark:text-white">
                                                                {formData.isPublic ? 'Public' : 'Private'}
                                                            </div>
                                                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                {formData.isPublic
                                                                    ? 'Anyone can use this mock (50% discount)'
                                                                    : 'Only you can access this mock'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.isPublic}
                                                        onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                                                    />
                                                </div>
                                            </div>

                                            {formData.isPublic && (
                                                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                                                    <div className="flex gap-2">
                                                        <Info className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                                        <div className="text-sm text-green-900 dark:text-green-100">
                                                            <p className="font-medium mb-1">Community Contribution!</p>
                                                            <p className="text-green-700 dark:text-green-300">
                                                                Making your mock public helps others prepare and gives you a 50% discount.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cost Summary */}
                                            <div className="p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                                <div className="space-y-3">
                                                    <h4 className="font-semibold text-base">Cost Summary</h4>
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300">
                                                            <span>Duration ({formData.duration} min)</span>
                                                            <span className="font-medium">{baseCredits}c</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300">
                                                            <span>Questions ({formData.questionsCount} × 2c)</span>
                                                            <span className="font-medium">{questionCredits}c</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300">
                                                            <span>Visibility</span>
                                                            <span className={`font-medium ${formData.isPublic ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                                {formData.isPublic ? '-50%' : 'Private'}
                                                            </span>
                                                        </div>
                                                        {formData.includeResume && (
                                                            <div className="flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300">
                                                                <span>Resume Context</span>
                                                                <span className="font-medium">+{resumeCredits}c</span>
                                                            </div>
                                                        )}
                                                        <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-2" />
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-base">Total</span>
                                                            <div className="flex items-center gap-1.5">
                                                                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                                <span className="font-bold text-xl text-neutral-900 dark:text-white">
                                                                    {totalCredits}
                                                                </span>
                                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">credits</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>

                    {/* Footer with Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                        {userCredits < totalCredits && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <div className="text-sm text-red-900 dark:text-red-100">
                                        Insufficient credits.{' '}
                                        <Link href="/purchase" className="underline">Purchase credits</Link>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            {step > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(step - 1)}
                                    disabled={processing !== 'idle'}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                            )}
                            {step < 3 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed()}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    Continue
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={processing !== 'idle' || userCredits < totalCredits}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {processing === 'processing' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Create Mock ({totalCredits} Credits)
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Processing/Success Dialog */}
            <Dialog open={processing === 'processing' || processing === 'success'} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {processing === 'processing' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                    Creating Your Mock Interview
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    Mock Interview Created!
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {processing === 'processing' ? (
                                'Our AI is generating a comprehensive knowledge base for your mock interview...'
                            ) : (
                                'Your custom mock interview is ready!'
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <AnimatePresence mode="wait">
                            {processing === 'processing' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center gap-3 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span>Analyzing your requirements...</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Brain className="w-4 h-4 text-purple-600" />
                                        <span>Generating relevant questions...</span>
                                    </div>
                                    {formData.knowledgeBase && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <BookOpen className="w-4 h-4 text-orange-600" />
                                            <span>Processing your study materials...</span>
                                        </div>
                                    )}
                                    {formData.includeResume && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <FileText className="w-4 h-4 text-green-600" />
                                            <span>Processing resume context...</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-sm">
                                        <Sparkles className="w-4 h-4 text-amber-600" />
                                        <span>Finalizing knowledge base...</span>
                                    </div>
                                </motion.div>
                            )}
                            {processing === 'success' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex flex-col items-center justify-center py-8"
                                >
                                    <CheckCircle className="w-20 h-20 text-green-600 mb-4" />
                                    <p className="text-center text-neutral-600 dark:text-neutral-400">
                                        Ready to start your mock interview
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Choose Action Dialog */}
            <Dialog open={processing === 'choose-action'} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-lg p-8">
                    <DialogHeader className="space-y-3">
                        <div className="flex justify-center">
                            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <DialogTitle className="text-2xl text-center">
                            Mock Interview Created!
                        </DialogTitle>
                        <DialogDescription className="text-center text-base">
                            Your custom mock interview is ready. Would you like to start it now or save it for later?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-6">
                        <Button
                            size="lg"
                            onClick={handleStartNow}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg py-6"
                        >
                            <Zap className="w-5 h-5 mr-2" />
                            Start Interview Now
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleStartLater}
                            className="w-full text-lg py-6"
                        >
                            <Clock className="w-5 h-5 mr-2" />
                            Start Later
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Resume Required Dialog */}
            <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                                <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <DialogTitle className="text-xl text-center">
                            Resume Required
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            To include resume context in your mock interview, you need to upload your resume first.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-4">
                        <Button
                            onClick={handleGoToProfile}
                            className="w-full bg-neutral-900 text-white dark:bg-white dark:text-black"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Go to Profile & Upload Resume
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleContinueWithoutResume}
                            className="w-full"
                        >
                            Continue Without Resume
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
