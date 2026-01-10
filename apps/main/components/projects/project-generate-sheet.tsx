'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Code2, Brain, Rocket,
    Zap, Globe, Lock, Eye, AlertCircle
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
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import toast from '@repo/ui/components/ui/sonner'
import { ProjectEchoSchema } from '@/actions/(main)/schemas/projects.schema'
import {
    initiateProjectGeneration, syncJobStatus, finalizeGeneratedProject,
    issueWorkerToken
} from '@/actions/(main)/workers/projectsworker.action'
import { searchSimilarProjects } from '@/actions/(main)/projects/project.action'
import { ProjectCard } from '@/components/projects/project-card'
import { z } from 'zod'
import { cn } from '@repo/ui/lib/utils'
import { ProjectV2Basic } from '@/types/project'

type FormData = z.infer<typeof ProjectEchoSchema>

const GENERATION_TYPES = [
    { value: 'FULL_STACK', label: 'Full Stack', icon: Code2, color: 'from-blue-500 to-cyan-500', description: 'Complete web application' },
    { value: 'FRONTEND', label: 'Frontend', icon: Brain, color: 'from-purple-500 to-pink-500', description: 'UI-focused project' },
    { value: 'PROGRAMS', label: 'Programs', icon: Rocket, color: 'from-orange-500 to-red-500', description: 'CLI tools & scripts' },
    { value: 'AI/ML', label: 'AI/ML', icon: Sparkles, color: 'from-green-500 to-emerald-500', description: 'AI & Machine Learning' },
    { value: 'AI_AGENT', label: 'AI Agent', icon: Zap, color: 'from-yellow-500 to-amber-500', description: 'Autonomous AI systems' },
    { value: 'OTHER', label: 'Other', icon: Code2, color: 'from-gray-500 to-slate-500', description: 'Custom project type' },
] as const

const DIFFICULTY_LEVELS = [
    { value: 'BEGINNER', label: 'Beginner', desc: '0-6 months', color: 'text-green-500' },
    { value: 'INTERMEDIATE', label: 'Intermediate', desc: '6-18 months', color: 'text-blue-500' },
    { value: 'ADVANCED', label: 'Advanced', desc: '18+ months', color: 'text-purple-500' },
]

const FRONTEND_STACKS = ['React', 'Next.js', 'Vue', 'Angular', 'HTML/CSS/JS', 'Svelte']
const BACKEND_STACKS = ['Node.js/Express', 'Next.js API', 'Python/Flask', 'Python/Django', 'Java/Spring', 'Go']
const DATABASES = ['PostgreSQL', 'MongoDB', 'MySQL', 'SQLite', 'Supabase', 'Firebase']
const DEPLOYMENTS = ['Vercel', 'Netlify', 'Railway', 'Heroku', 'AWS', 'Docker']
const AI_PROVIDERS = ['OpenAI', 'Claude (Anthropic)', 'Google Gemini', 'Hugging Face', 'None']

interface ProjectGenerateSheetProps {
    trigger?: React.ReactNode
    onSuccess?: (projectSlug: string) => void
    spaceId?: string
    defaultValues?: {
        title?: string
        description?: string
        type?: string
        difficulty?: string
    }
}

export default function ProjectGenerateSheet({
    trigger,
    onSuccess,
    spaceId,
    defaultValues
}: ProjectGenerateSheetProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [progressPercent, setProgressPercent] = useState(0)
    const [jobStatus, setJobStatus] = useState<string>('idle')
    const [searchingProjects, setSearchingProjects] = useState(false)
    const [similarProjects, setSimilarProjects] = useState<ProjectV2Basic[]>([])
    const [hasSearched, setHasSearched] = useState(false)

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
        { id: 'difficulty', title: 'Difficulty', subtitle: 'Set experience level' },
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
            case 4: return true
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

    const searchForSimilarProjects = async () => {
        const stackTechnologies: string[] = []
        if (formData.stacks?.frontend) stackTechnologies.push(formData.stacks.frontend)
        if (formData.stacks?.backend) stackTechnologies.push(formData.stacks.backend)
        if (formData.stacks?.database) stackTechnologies.push(formData.stacks.database)

        if (!formData.projectTitle || stackTechnologies.length === 0) return

        setSearchingProjects(true)
        setHasSearched(true)

        try {
            const result = await searchSimilarProjects({
                title: formData.projectTitle,
                technologies: stackTechnologies,
                limit: 4
            })
            if (result.success && result.data) {
                setSimilarProjects(result.data)
            }
        } catch (error) {
            console.error('Error searching similar projects:', error)
        } finally {
            setSearchingProjects(false)
        }
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
                    setLoading(false)
                    resetForm()

                    const projectSlug = savedProject.data?.projectSlug || ''

                    if (onSuccess) {
                        onSuccess(projectSlug)
                    } else if (spaceId) {
                        // When called from space, don't redirect - let the timeline handle it
                        // The onSuccess callback should update the space timeline
                    } else {
                        router.push(`/projects/${projectSlug}`)
                    }
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
    }, [router, onSuccess, spaceId])

    const resetForm = () => {
        setCurrentStep(0)
        setFormData({
            projectTitle: '',
            projectDescription: '',
            generationType: undefined,
            difficulty: undefined,
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
        setSimilarProjects([])
        setHasSearched(false)
    }

    const baseCost = formData.visibility === "PUBLIC" ? 13 : 25
    const assessmentCost = formData.includeAssessment ? 30 : 0
    const totalCost = baseCost + assessmentCost

    const getStatusMessage = () => {
        switch (jobStatus) {
            case 'waiting': return 'Queued for generation...'
            case 'active': return 'Generating project structure...'
            case 'completed': return 'Project created!'
            case 'failed': return 'Generation failed'
            default: return 'Processing...'
        }
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) {
                resetForm()
                setLoading(false)
            }
        }}>
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
            <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                <div className="max-w-3xl mx-auto">
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

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center py-20"
                            >
                                {/* Animated Background */}
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl opacity-30 animate-pulse" />
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center"
                                    >
                                        <div className="w-28 h-28 rounded-full bg-white dark:bg-neutral-950 flex items-center justify-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                {jobStatus === 'completed' ? (
                                                    <Check className="w-12 h-12 text-green-500" />
                                                ) : (
                                                    <Sparkles className="w-12 h-12 text-purple-500" />
                                                )}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </div>

                                <h3 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                                    {jobStatus === 'completed' ? 'Project Created!' : 'Generating Your Project'}
                                </h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-8">
                                    {getStatusMessage()}
                                </p>

                                <div className="w-full max-w-md space-y-4">
                                    <Progress value={progressPercent} className="h-3" />
                                    <div className="flex justify-between text-sm text-neutral-500">
                                        <span>{progressPercent}% complete</span>
                                        <span className="capitalize">{jobStatus}</span>
                                    </div>
                                </div>

                                {/* Generation Steps */}
                                <div className="mt-8 space-y-3 text-sm text-left w-full max-w-md">
                                    {[
                                        { label: 'Analyzing requirements', threshold: 10 },
                                        { label: 'Generating project structure', threshold: 30 },
                                        { label: 'Creating tasks and milestones', threshold: 50 },
                                        { label: 'Generating concepts', threshold: 70 },
                                        { label: 'Creating assessments', threshold: 85 },
                                        { label: 'Finalizing project', threshold: 95 },
                                    ].map((step, idx) => (
                                        <motion.div
                                            key={step.label}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: progressPercent >= step.threshold ? 1 : 0.4, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center gap-3"
                                        >
                                            {progressPercent >= step.threshold + 10 ? (
                                                <Check className="w-5 h-5 text-green-500" />
                                            ) : progressPercent >= step.threshold ? (
                                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-700" />
                                            )}
                                            <span className={cn(
                                                progressPercent >= step.threshold
                                                    ? "text-neutral-900 dark:text-white"
                                                    : "text-neutral-400"
                                            )}>
                                                {step.label}
                                            </span>
                                        </motion.div>
                                    ))}
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
                                        {
                                            steps.map((step, index) => (
                                                <div key={step.id} className="flex-1 text-center">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm font-medium transition-all",
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
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        What&apos;s your project called?
                                                    </h3>
                                                    <p className="text-neutral-500">Give it a name that describes what you want to build</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Project Title *</Label>
                                                    <Input
                                                        placeholder="e.g., Task Management App, E-commerce Platform..."
                                                        value={formData.projectTitle || ''}
                                                        onChange={(e) => updateFormData('projectTitle', e.target.value)}
                                                        className="text-lg h-14 px-4"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description *</Label>
                                                    <Textarea
                                                        placeholder="Describe what your project should do, key features you want..."
                                                        value={formData.projectDescription || ''}
                                                        onChange={(e) => updateFormData('projectDescription', e.target.value)}
                                                        rows={4}
                                                        className="text-base"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 1: Type */}
                                        {currentStep === 1 && (
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        What type of project is this?
                                                    </h3>
                                                    <p className="text-neutral-500">Choose the category that best fits</p>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {GENERATION_TYPES.map((type) => {
                                                        const Icon = type.icon
                                                        const isSelected = formData.generationType === type.value
                                                        return (
                                                            <motion.button
                                                                key={type.value}
                                                                onClick={() => updateFormData('generationType', type.value)}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={cn(
                                                                    "relative p-4 rounded-xl border-2 transition-all text-left",
                                                                    isSelected
                                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 bg-white dark:bg-neutral-900"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "p-2 rounded-lg inline-flex mb-2 bg-gradient-to-br",
                                                                    type.color
                                                                )}>
                                                                    <Icon className="w-5 h-5 text-white" />
                                                                </div>
                                                                <p className="font-medium text-neutral-900 dark:text-white">{type.label}</p>
                                                                <p className="text-xs text-neutral-500 mt-1">{type.description}</p>
                                                                {isSelected && (
                                                                    <Check className="absolute top-2 right-2 w-5 h-5 text-blue-500" />
                                                                )}
                                                            </motion.button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Stack */}
                                        {currentStep === 2 && (
                                            <div className="space-y-6">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        Choose your tech stack
                                                    </h3>
                                                    <p className="text-neutral-500">Select the technologies you want to learn or use</p>
                                                </div>
                                                {(formData.generationType === 'FULL_STACK' ||
                                                    formData.generationType === 'FRONTEND' ||
                                                    formData.generationType === 'AI_AGENT') && (
                                                        <div className="space-y-2">
                                                            <Label>Frontend</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {FRONTEND_STACKS.map((stack) => (
                                                                    <Button
                                                                        key={stack}
                                                                        variant={formData.stacks?.frontend === stack ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => updateStacks('frontend', formData.stacks?.frontend === stack ? '' : stack)}
                                                                        className="rounded-full"
                                                                    >
                                                                        {stack}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                {(formData.generationType === 'FULL_STACK' || formData.generationType === 'AI_AGENT') && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label>Backend</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {BACKEND_STACKS.map((stack) => (
                                                                    <Button
                                                                        key={stack}
                                                                        variant={formData.stacks?.backend === stack ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => updateStacks('backend', formData.stacks?.backend === stack ? '' : stack)}
                                                                        className="rounded-full"
                                                                    >
                                                                        {stack}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Database</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {DATABASES.map((db) => (
                                                                    <Button
                                                                        key={db}
                                                                        variant={formData.stacks?.database === db ? "default" : "outline"}
                                                                        size="sm"
                                                                        onClick={() => updateStacks('database', formData.stacks?.database === db ? '' : db)}
                                                                        className="rounded-full"
                                                                    >
                                                                        {db}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {formData.generationType === 'AI_AGENT' && (
                                                    <div className="space-y-2">
                                                        <Label>AI Provider</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {AI_PROVIDERS.map((provider) => (
                                                                <Button
                                                                    key={provider}
                                                                    variant={formData.stacks?.aiProvider === provider ? "default" : "outline"}
                                                                    size="sm"
                                                                    onClick={() => updateStacks('aiProvider', formData.stacks?.aiProvider === provider ? '' : provider)}
                                                                    className="rounded-full"
                                                                >
                                                                    {provider}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label>Deployment (Optional)</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {DEPLOYMENTS.map((deploy) => (
                                                            <Button
                                                                key={deploy}
                                                                variant={formData.stacks?.deployment === deploy ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => updateStacks('deployment', formData.stacks?.deployment === deploy ? '' : deploy)}
                                                                className="rounded-full"
                                                            >
                                                                {deploy}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {!formData.generationType && (
                                                    <p className="text-center text-neutral-500 py-8">
                                                        Select a project type first to see relevant stack options
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Step 3: Difficulty */}
                                        {currentStep === 3 && (
                                            <div className="space-y-4">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        What&apos;s your experience level?
                                                    </h3>
                                                    <p className="text-neutral-500">This helps us tailor the project complexity</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {DIFFICULTY_LEVELS.map((level) => {
                                                        const isSelected = formData.difficulty === level.value
                                                        return (
                                                            <motion.button
                                                                key={level.value}
                                                                onClick={() => updateFormData('difficulty', level.value)}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className={cn(
                                                                    "p-6 rounded-2xl border-2 transition-all text-center",
                                                                    isSelected
                                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg"
                                                                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300"
                                                                )}
                                                            >
                                                                <div className={cn("text-2xl font-bold mb-1", level.color)}>
                                                                    {level.label}
                                                                </div>
                                                                <div className="text-sm text-neutral-500">
                                                                    {level.desc}
                                                                </div>
                                                                {isSelected && (
                                                                    <motion.div
                                                                        className="mt-3 inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full"
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                    >
                                                                        <Check className="w-4 h-4 text-white" />
                                                                    </motion.div>
                                                                )}
                                                            </motion.button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 4: Settings */}
                                        {currentStep === 4 && (
                                            <div className="space-y-6">
                                                <div className="text-center mb-6">
                                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                                        Final configurations
                                                    </h3>
                                                    <p className="text-neutral-500">Visibility, assessments, and review</p>
                                                </div>

                                                {/* Visibility */}
                                                <div className="space-y-3">
                                                    <Label>Visibility</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <motion.button
                                                            onClick={() => updateFormData('visibility', 'PUBLIC')}
                                                            whileHover={{ scale: 1.02 }}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 transition-all text-left",
                                                                formData.visibility === 'PUBLIC'
                                                                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                                            )}
                                                        >
                                                            <Globe className="w-5 h-5 text-green-500 mb-2" />
                                                            <div className="font-semibold text-neutral-900 dark:text-white">Public</div>
                                                            <div className="text-xs text-neutral-500">Share with community</div>
                                                            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                                                                50% off - 13 credits
                                                            </Badge>
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => updateFormData('visibility', 'PRIVATE')}
                                                            whileHover={{ scale: 1.02 }}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 transition-all text-left",
                                                                formData.visibility === 'PRIVATE'
                                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                                                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                                            )}
                                                        >
                                                            <Lock className="w-5 h-5 text-blue-500 mb-2" />
                                                            <div className="font-semibold text-neutral-900 dark:text-white">Private</div>
                                                            <div className="text-xs text-neutral-500">Only you can see</div>
                                                            <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                                                                25 credits
                                                            </Badge>
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                {/* Assessment Toggle */}
                                                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                                    <div className="flex items-center gap-3">
                                                        <Brain className="w-5 h-5 text-purple-500" />
                                                        <div>
                                                            <Label>Quiz & Mock Interview</Label>
                                                            <p className="text-xs text-neutral-500">+30 credits</p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={formData.includeAssessment}
                                                        onCheckedChange={(checked) => updateFormData('includeAssessment', checked)}
                                                    />
                                                </div>

                                                {/* Cost Summary */}
                                                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Total Cost</span>
                                                        <Badge variant="secondary" className="text-lg">
                                                            {totalCost} Credits
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Similar Projects Check */}
                                                <Button
                                                    onClick={searchForSimilarProjects}
                                                    disabled={searchingProjects}
                                                    variant="outline"
                                                    className="w-full"
                                                >
                                                    {searchingProjects ? (
                                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching...</>
                                                    ) : (
                                                        <><Eye className="w-4 h-4 mr-2" /> Check for Similar Projects</>
                                                    )}
                                                </Button>

                                                {hasSearched && !searchingProjects && similarProjects.length > 0 && (
                                                    <Alert>
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertTitle>Similar Projects Found</AlertTitle>
                                                        <AlertDescription className="mt-2">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                                                {similarProjects.slice(0, 2).map((project) => (
                                                                    <ProjectCard key={project.id} project={project} />
                                                                ))}
                                                            </div>
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
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
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
                                    >
                                        {currentStep === steps.length - 1 ? (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate ({totalCost} credits)
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
