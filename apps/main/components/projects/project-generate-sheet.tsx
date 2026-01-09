'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Code2, Brain, Rocket,
    Zap, Globe, Lock
} from 'lucide-react'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, 
    SheetTrigger
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { Switch } from '@repo/ui/components/ui/switch'
import { Label } from '@repo/ui/components/ui/label'
import { Progress } from '@repo/ui/components/ui/progress'
import toast from '@repo/ui/components/ui/sonner'
import { ProjectEchoSchema } from '@/actions/(main)/schemas/projects.schema'
import {
    initiateProjectGeneration, syncJobStatus, finalizeGeneratedProject,
    issueWorkerToken
} from '@/actions/(main)/workers/projectsworker.action'
import { z } from 'zod'
import { cn } from '@repo/ui/lib/utils'

type FormData = z.infer<typeof ProjectEchoSchema>

const GENERATION_TYPES = [
    { value: 'FULL_STACK', label: 'Full Stack', icon: Code2, color: 'from-blue-500 to-cyan-500' },
    { value: 'FRONTEND', label: 'Frontend', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { value: 'PROGRAMS', label: 'Programs', icon: Rocket, color: 'from-orange-500 to-red-500' },
    { value: 'AI/ML', label: 'AI/ML', icon: Sparkles, color: 'from-green-500 to-emerald-500' },
    { value: 'AI_AGENT', label: 'AI Agent', icon: Zap, color: 'from-yellow-500 to-amber-500' },
] as const

const DIFFICULTY_LEVELS = [
    { value: 'BEGINNER', label: 'Beginner', color: 'text-green-500' },
    { value: 'INTERMEDIATE', label: 'Intermediate', color: 'text-blue-500' },
    { value: 'ADVANCED', label: 'Advanced', color: 'text-purple-500' },
]

const FRONTEND_STACKS = ['React', 'Next.js', 'Vue', 'Angular', 'HTML/CSS/JS']
const BACKEND_STACKS = ['Node.js/Express', 'Next.js API', 'Python/Flask', 'Python/Django']
const DATABASES = ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite']

interface ProjectGenerateSheetProps {
    trigger?: React.ReactNode;
    onSuccess?: (projectSlug: string) => void;
    returnToSpace?: {
        spaceId: string;
        stepOrder?: number;
    };
    defaultValues?: {
        title?: string;
        description?: string;
        type?: string;
        difficulty?: string;
    };
}

export default function ProjectGenerateSheet({
    trigger,
    onSuccess,
    returnToSpace,
    defaultValues
}: ProjectGenerateSheetProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [progressPercent, setProgressPercent] = useState(0)
    const [jobStatus, setJobStatus] = useState<string>('idle')

    const [formData, setFormData] = useState<Partial<FormData>>({
        projectTitle: defaultValues?.title || '',
        projectDescription: defaultValues?.description || '',
        generationType: defaultValues?.type as FormData['generationType'] || undefined,
        difficulty: defaultValues?.difficulty as FormData['difficulty'] || undefined,
        technologies: [],
        conceptsFocus: [],
        stacks: {
            frontend: '',
            backend: '',
            database: '',
            deployment: '',
            aiProvider: '',
        },
        preferences: {
            generateNow: true,
            pagesPreset: 'CUSTOM',
        },
        visibility: 'PUBLIC',
        includeAssessment: true,
    })

    const steps = [
        { id: 'basics', title: 'Project Details', subtitle: 'Name and describe your project' },
        { id: 'type', title: 'Project Type', subtitle: 'Choose the category' },
        { id: 'stack', title: 'Tech Stack', subtitle: 'Select technologies' },
        { id: 'settings', title: 'Settings', subtitle: 'Final configurations' },
    ]

    const updateFormData = (key: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const updateStacks = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            stacks: { ...prev.stacks!, [key]: value },
        }))
    }

    const canProceed = () => {
        switch (currentStep) {
            case 0: return formData.projectTitle && formData.projectTitle.length >= 3 &&
                formData.projectDescription && formData.projectDescription.length >= 10
            case 1: return !!formData.generationType
            case 2: return true
            case 3: return !!formData.difficulty
            default: return true
        }
    }

    const nextStep = () => {
        if (!canProceed()) {
            toast.error('Please complete this step')
            return
        }
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleSubmit()
        }
    }

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1)
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const validated = ProjectEchoSchema.parse(formData)

            toast.info('Creating generation job...')

            const workerToken = await issueWorkerToken('generate_project')
            const jobResult = await initiateProjectGeneration(validated, workerToken)

            if (!jobResult.success || !jobResult.jobId) {
                toast.error(jobResult.error || 'Failed to create job')
                setLoading(false)
                return
            }

            setProgressPercent(0)
            setJobStatus('waiting')

            await startPolling(jobResult.jobId)
        } catch (error) {
            console.error('Generation error:', error)
            if (error instanceof z.ZodError) {
                toast.error(`Validation error: ${error.message}`)
            } else {
                toast.error('Failed to generate project. Please try again.')
            }
            setLoading(false)
        }
    }

    const startPolling = useCallback(async (jobId: string) => {
        const maxPolls = 120
        let pollCount = 0

        const pollInterval = setInterval(async () => {
            pollCount++

            try {
                const token = await issueWorkerToken('check_job', jobId)

                const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/api/v1/job/${jobId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                    cache: 'no-store',
                })

                if (!response.ok) {
                    clearInterval(pollInterval)
                    toast.error('Failed to check job status')
                    setLoading(false)
                    return
                }

                const result = await response.json()
                const { status, progress, data, failedReason } = result

                setProgressPercent(progress)
                setJobStatus(status)

                await syncJobStatus(jobId, status, progress, data, failedReason)

                if (status === 'completed' && data) {
                    clearInterval(pollInterval)
                    setProgressPercent(100)
                    setJobStatus('completed')

                    const savedProject = await finalizeGeneratedProject(jobId, data)
                    if (!savedProject.success) {
                        toast.error(savedProject.error || 'Failed to save project')
                        setLoading(false)
                        return
                    }

                    toast.success('Project generated successfully!')
                    setOpen(false)

                    if (onSuccess) {
                        onSuccess(savedProject.data?.projectSlug || '')
                    } else if (returnToSpace) {
                        router.push(`/projects/${savedProject.data?.projectSlug}?returnTo=/space/${returnToSpace.spaceId}`)
                    } else {
                        router.push(`/projects/${savedProject.data?.projectSlug}`)
                    }
                    setLoading(false)
                } else if (status === 'failed') {
                    clearInterval(pollInterval)
                    toast.error(failedReason || 'Generation failed')
                    setLoading(false)
                } else if (pollCount >= maxPolls) {
                    clearInterval(pollInterval)
                    toast.error('Generation timeout. Please try again.')
                    setLoading(false)
                }
            } catch (error) {
                console.log("Polling error:", error)
                if (pollCount >= maxPolls) {
                    clearInterval(pollInterval)
                    toast.error('Failed to connect to worker.')
                    setLoading(false)
                }
            }
        }, 5000)

        return () => clearInterval(pollInterval)
    }, [router, onSuccess, returnToSpace])

    const baseCost = formData.visibility === "PUBLIC" ? 13 : 25
    const assessmentCost = formData.includeAssessment ? 30 : 0
    const totalCost = baseCost + assessmentCost

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {
                    trigger || (
                        <Button className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generate Project
                        </Button>
                    )
                }
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            Generate AI Project
                        </SheetTitle>
                        <SheetDescription>
                            Create a complete project with tasks, concepts, and assessments
                        </SheetDescription>
                    </SheetHeader>

                    {/* Progress */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {
                                steps.map((step, index) => (
                                    <div key={step.id} className="flex-1 text-center">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium",
                                            index < currentStep ? "bg-green-500 text-white" :
                                                index === currentStep ? "bg-blue-500 text-white" :
                                                    "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
                                        )}>
                                            {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                                        </div>
                                        <p className="text-xs text-neutral-500 hidden sm:block">{step.title}</p>
                                    </div>
                                ))
                            }
                        </div>
                        <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
                    </div>

                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Generating Your Project...</h3>
                            <p className="text-neutral-500 mb-6">{jobStatus}</p>
                            <Progress value={progressPercent} className="max-w-md mx-auto" />
                            <p className="text-sm text-neutral-500 mt-2">{progressPercent}% complete</p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Step 0: Basics */}
                                {
                                    currentStep === 0 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Project Title *</Label>
                                                <Input
                                                    placeholder="e.g., Task Management App"
                                                    value={formData.projectTitle || ''}
                                                    onChange={(e) => updateFormData('projectTitle', e.target.value)}
                                                    className="text-lg h-12"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description *</Label>
                                                <Textarea
                                                    placeholder="Describe what your project should do..."
                                                    value={formData.projectDescription || ''}
                                                    onChange={(e) => updateFormData('projectDescription', e.target.value)}
                                                    rows={4}
                                                />
                                            </div>
                                        </div>
                                    )
                                }

                                {/* Step 1: Type */}
                                {
                                    currentStep === 1 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {
                                                GENERATION_TYPES.map((type) => {
                                                    const Icon = type.icon
                                                    const isSelected = formData.generationType === type.value
                                                    return (
                                                        <button
                                                            key={type.value}
                                                            onClick={() => updateFormData('generationType', type.value)}
                                                            className={cn(
                                                                "relative p-4 rounded-xl border-2 transition-all text-left",
                                                                isSelected
                                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "p-2 rounded-lg inline-flex mb-2 bg-gradient-to-br",
                                                                type.color
                                                            )}>
                                                                <Icon className="w-5 h-5 text-white" />
                                                            </div>
                                                            <p className="font-medium">{type.label}</p>
                                                            {
                                                                isSelected && (
                                                                    <Check className="absolute top-2 right-2 w-5 h-5 text-blue-500" />
                                                                )
                                                            }
                                                        </button>
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                                }

                                {/* Step 2: Stack */}
                                {
                                    currentStep === 2 && (
                                        <div className="space-y-4">
                                            {
                                                (formData.generationType === 'FULL_STACK' || formData.generationType === 'FRONTEND') && (
                                                    <div className="space-y-2">
                                                        <Label>Frontend</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {
                                                                FRONTEND_STACKS.map((stack) => (
                                                                    <Button
                                                                        key={stack}
                                                                        variant={formData.stacks?.frontend === stack ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => updateStacks('frontend', formData.stacks?.frontend === stack ? '' : stack)}
                                                                    >
                                                                        {stack}
                                                                    </Button>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            {
                                                formData.generationType === 'FULL_STACK' && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>Backend</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {
                                                                    BACKEND_STACKS.map((stack) => (
                                                                        <Button
                                                                            key={stack}
                                                                            variant={formData.stacks?.backend === stack ? "default" : "outline"}
                                                                            size="sm"
                                                                            onClick={() => updateStacks('backend', formData.stacks?.backend === stack ? '' : stack)}
                                                                        >
                                                                            {stack}
                                                                        </Button>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Database</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {
                                                                    DATABASES.map((db) => (
                                                                        <Button
                                                                            key={db}
                                                                            variant={formData.stacks?.database === db ? "default" : "outline"}
                                                                            size="sm"
                                                                            onClick={() => updateStacks('database', formData.stacks?.database === db ? '' : db)}
                                                                        >
                                                                            {db}
                                                                        </Button>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            }
                                            {
                                                !formData.generationType && (
                                                    <p className="text-center text-neutral-500 py-8">
                                                        Select a project type first to see relevant stack options
                                                    </p>
                                                )
                                            }
                                        </div>
                                    )
                                }

                                {/* Step 3: Settings */}
                                {
                                    currentStep === 3 && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Difficulty Level *</Label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {
                                                        DIFFICULTY_LEVELS.map((level) => (
                                                            <button
                                                                key={level.value}
                                                                onClick={() => updateFormData('difficulty', level.value)}
                                                                className={cn(
                                                                    "p-4 rounded-xl border-2 transition-all",
                                                                    formData.difficulty === level.value
                                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                                        : "border-neutral-200 dark:border-neutral-700"
                                                                )}
                                                            >
                                                                <p className={cn("font-semibold", level.color)}>{level.label}</p>
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                                                <div className="flex items-center gap-3">
                                                    {formData.visibility === 'PUBLIC' ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                                    <div>
                                                        <Label>Visibility</Label>
                                                        <p className="text-sm text-neutral-500">
                                                            {formData.visibility === 'PUBLIC' ? '13 credits' : '25 credits'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={formData.visibility === 'PUBLIC'}
                                                    onCheckedChange={(checked) => updateFormData('visibility', checked ? 'PUBLIC' : 'PRIVATE')}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                                                <div>
                                                    <Label>Include Assessment</Label>
                                                    <p className="text-sm text-neutral-500">+30 credits</p>
                                                </div>
                                                <Switch
                                                    checked={formData.includeAssessment}
                                                    onCheckedChange={(checked) => updateFormData('includeAssessment', checked)}
                                                />
                                            </div>
                                            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">Total Cost</span>
                                                    <Badge variant="secondary" className="text-lg">
                                                        {totalCost} Credits
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Navigation */}
                    {
                        !loading && (
                            <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                <Button
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={nextStep} disabled={!canProceed()}>
                                    {
                                        currentStep === steps.length - 1 ? (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate ({totalCost} credits)
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )
                                    }
                                </Button>
                            </div>
                        )
                    }
                </div>
            </SheetContent>
        </Sheet>
    )
}
