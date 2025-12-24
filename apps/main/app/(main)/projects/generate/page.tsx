'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Code2, Brain, Rocket, 
    AlertCircle, Eye, Zap, Globe, Lock
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert'
import toast from '@repo/ui/components/ui/sonner'
import { searchSimilarProjects } from '@/actions/(main)/projects/project.action'
import { ProjectEchoSchema } from '@/actions/(main)/schemas/projects.schema'
import {
    createProjectGenerationJob, updateJobStatusInDatabase, saveProjectToDatabase,
    getWorkerToken
} from '@/actions/(main)/workers/projectsworker.action'
import { ProjectCard } from '@/components/projects/project-card'
import { GenerationProgressDialog } from '@/components/projects/generation-progress-dialog'
import { z } from 'zod'
import { cn } from '@repo/ui/lib/utils'
import { ProjectV2Basic } from '@/types/project'

type FormData = z.infer<typeof ProjectEchoSchema>

const GENERATION_TYPES = [
    { value: 'FULL_STACK', label: 'Full Stack', icon: Code2, color: 'from-blue-500 to-cyan-500' },
    { value: 'FRONTEND', label: 'Frontend', icon: Brain, color: 'from-purple-500 to-pink-500' },
    { value: 'PROGRAMS', label: 'Programs', icon: Rocket, color: 'from-orange-500 to-red-500' },
    { value: 'AI/ML', label: 'AI/ML', icon: Sparkles, color: 'from-green-500 to-emerald-500' },
    { value: 'AI_AGENT', label: 'AI Agent', icon: Zap, color: 'from-yellow-500 to-amber-500' },
    { value: 'OTHER', label: 'Other', icon: Code2, color: 'from-gray-500 to-slate-500' },
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

// Each "step" is a question in the typeform
type StepId = 'title' | 'description' | 'type' | 'stack' | 'difficulty' | 'extras' | 'review'

interface StepConfig {
    id: StepId
    title: string
    subtitle: string
    isRequired?: boolean
}

const STEPS: StepConfig[] = [
    { id: 'title', title: "What's your project called?", subtitle: 'Give it a name that describes what you want to build', isRequired: true },
    { id: 'description', title: 'Describe your project', subtitle: 'What will it do? What features do you want?', isRequired: true },
    { id: 'type', title: 'What type of project is this?', subtitle: 'Choose the category that best fits', isRequired: true },
    { id: 'stack', title: 'Choose your tech stack', subtitle: 'Select the technologies you want to learn or use' },
    { id: 'difficulty', title: 'What\'s your experience level?', subtitle: 'This helps us tailor the project complexity', isRequired: true },
    { id: 'extras', title: 'Final touches', subtitle: 'Visibility, assessments, and additional preferences' },
    { id: 'review', title: 'Ready to generate?', subtitle: 'Review your choices and create your project' },
]

export default function GenerateProjectPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchingProjects, setSearchingProjects] = useState(false)
    const [similarProjects, setSimilarProjects] = useState<ProjectV2Basic[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [jobId, setJobId] = useState<string | null>(null)
    const [progressPercent, setProgressPercent] = useState(0)
    const [jobStatus, setJobStatus] = useState<string>('waiting')
    
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})

    const [formData, setFormData] = useState<Partial<FormData>>({
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

    // Load URL params on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search)
            const title = searchParams.get('title')
            const description = searchParams.get('description')
            const type = searchParams.get('type') as FormData['generationType'] | null
            const difficulty = searchParams.get('difficulty') as FormData['difficulty'] | null

            if (title || description || type || difficulty) {
                setFormData(prev => ({
                    ...prev,
                    ...(title && { projectTitle: title }),
                    ...(description && { projectDescription: description }),
                    ...(type && { generationType: type }),
                    ...(difficulty && { difficulty: difficulty }),
                }))
            }
        }
    }, [])

    // Auto-focus input on step change
    useEffect(() => {
        const step = STEPS[currentStep]
        if (step?.id && inputRefs.current[step.id]) {
            setTimeout(() => {
                inputRefs.current[step.id]?.focus()
            }, 500)
        }
    }, [currentStep])

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
        const step = STEPS[currentStep]
        switch (step?.id) {
            case 'title':
                return !!formData.projectTitle && formData.projectTitle.length >= 3
            case 'description':
                return !!formData.projectDescription && formData.projectDescription.length >= 10
            case 'type':
                return !!formData.generationType
            case 'difficulty':
                return !!formData.difficulty
            case 'stack':
            case 'extras':
            case 'review':
                return true
            default:
                return true
        }
    }

    const nextStep = () => {
        if (!canProceed()) {
            toast.error('Please complete this step before continuing')
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

    const goToStep = (index: number) => {
        if (index <= currentStep) {
            setCurrentStep(index)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            nextStep()
        }
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

            const workerToken = await getWorkerToken('generate_project')

            const jobResult = await createProjectGenerationJob(validated, workerToken)
            
            if (!jobResult.success || !jobResult.jobId) {
                toast.error(jobResult.error || 'Failed to create job')
                setLoading(false)
                return
            }

            setJobId(jobResult.jobId)
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

                const token = await getWorkerToken('check_job', jobId);

                const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/api/v1/job/${jobId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
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

                await updateJobStatusInDatabase(jobId, status, progress, data, failedReason)

                if (status === 'completed' && data) {
                    clearInterval(pollInterval)
                    setProgressPercent(100)
                    setJobStatus('completed')

                    const savedProject = await saveProjectToDatabase(jobId, data)
                    if (!savedProject.success) {
                        toast.error(savedProject.error || 'Failed to save project')
                        setLoading(false)
                        return
                    }

                    toast.success('Project generated successfully!')
                    router.push(`/projects/${savedProject.data?.projectSlug}`)
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
                if (pollCount >= maxPolls) {
                    clearInterval(pollInterval)
                    toast.error('Failed to connect to worker.')
                    setLoading(false)
                }
            }
        }, 5000)

        return () => clearInterval(pollInterval)
    }, [router])

    // Calculate costs
    const baseCost = formData.visibility === "PUBLIC" ? 13 : 25
    const assessmentCost = formData.includeAssessment ? 30 : 0
    const totalCost = baseCost + assessmentCost

    const currentStepConfig = STEPS[currentStep]

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Progress Bar */}
            <div className="fixed top-16 left-0 right-0 z-50 h-1 bg-neutral-200 dark:bg-neutral-800">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Navigation Header */}
            <div className="fixed top-16 left-4 right-4 z-40 flex items-center justify-between">
                <Link href="/projects">
                    <Button variant="ghost" size="sm" className="gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </Link>

                {/* Step Indicators */}
                <div className="hidden md:flex items-center gap-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-full px-4 py-2">
                    {STEPS.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => goToStep(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                index === currentStep 
                                    ? "w-6 bg-gradient-to-r from-blue-600 to-purple-600" 
                                    : index < currentStep 
                                        ? "bg-green-500" 
                                        : "bg-neutral-300 dark:bg-neutral-600"
                            )}
                            disabled={index > currentStep}
                        />
                    ))}
                </div>

                <div className="text-sm text-neutral-500 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-full px-4 py-2">
                    {currentStep + 1} / {STEPS.length}
                </div>
            </div>

            {/* Main Content */}
            <div ref={containerRef} className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="w-full max-w-2xl"
                    >
                        {/* Step Title */}
                        <div className="text-center mb-8">
                            <motion.h1
                                className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {currentStepConfig?.title}
                            </motion.h1>
                            <motion.p
                                className="text-neutral-600 dark:text-neutral-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {currentStepConfig?.subtitle}
                            </motion.p>
                        </div>

                        {/* Step Content */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {currentStepConfig?.id === 'title' && (
                                <div className="space-y-4">
                                    <Input
                                        ref={(el) => { inputRefs.current['title'] = el }}
                                        placeholder="e.g., Task Management App, E-commerce Platform..."
                                        value={formData.projectTitle || ''}
                                        onChange={(e) => updateFormData('projectTitle', e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="text-xl h-16 px-6 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl shadow-lg"
                                    />
                                </div>
                            )}

                            {currentStepConfig?.id === 'description' && (
                                <div className="space-y-4">
                                    <Textarea
                                        ref={(el) => { inputRefs.current['description'] = el }}
                                        placeholder="Describe what your project should do, key features you want, any specific requirements..."
                                        value={formData.projectDescription || ''}
                                        onChange={(e) => updateFormData('projectDescription', e.target.value)}
                                        rows={5}
                                        className="text-lg p-6 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-2xl shadow-lg resize-none"
                                    />
                                    <p className="text-sm text-neutral-500 text-center">
                                        Press Enter to continue, Shift+Enter for new line
                                    </p>
                                </div>
                            )}

                            {currentStepConfig?.id === 'type' && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {GENERATION_TYPES.map((type) => {
                                        const Icon = type.icon
                                        const isSelected = formData.generationType === type.value
                                        return (
                                            <motion.button
                                                key={type.value}
                                                onClick={() => updateFormData('generationType', type.value)}
                                                className={cn(
                                                    "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                                                    isSelected
                                                        ? "border-transparent bg-gradient-to-br shadow-xl scale-105"
                                                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600"
                                                )}
                                                style={isSelected ? {
                                                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                                } : {}}
                                                whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className={cn(
                                                    "p-3 rounded-xl inline-flex mb-3",
                                                    isSelected 
                                                        ? "bg-white/20" 
                                                        : `bg-gradient-to-br ${type.color} bg-opacity-10`
                                                )}>
                                                    <Icon className={cn(
                                                        "w-6 h-6",
                                                        isSelected ? "text-white" : "text-neutral-700 dark:text-neutral-300"
                                                    )} />
                                                </div>
                                                <div className={cn(
                                                    "font-semibold",
                                                    isSelected ? "text-white" : "text-neutral-900 dark:text-white"
                                                )}>
                                                    {type.label}
                                                </div>
                                                {isSelected && (
                                                    <motion.div
                                                        className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}

                            {currentStepConfig?.id === 'stack' && (
                                <div className="space-y-6">
                                    {/* Show relevant stack options based on type */}
                                    {(formData.generationType === 'FULL_STACK' || 
                                      formData.generationType === 'FRONTEND' || 
                                      formData.generationType === 'AI_AGENT') && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Frontend</label>
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
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Backend</label>
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
                                    )}

                                    {formData.generationType === 'FULL_STACK' && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Database</label>
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
                                    )}

                                    {formData.generationType === 'AI_AGENT' && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">AI Provider</label>
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

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Deployment</label>
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
                                </div>
                            )}

                            {currentStepConfig?.id === 'difficulty' && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {DIFFICULTY_LEVELS.map((level) => {
                                        const isSelected = formData.difficulty === level.value
                                        return (
                                            <motion.button
                                                key={level.value}
                                                onClick={() => updateFormData('difficulty', level.value)}
                                                className={cn(
                                                    "p-6 rounded-2xl border-2 transition-all duration-300 text-center",
                                                    isSelected
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-xl"
                                                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300"
                                                )}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className={cn("text-2xl font-bold mb-1", level.color)}>
                                                    {level.label}
                                                </div>
                                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
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
                            )}

                            {currentStepConfig?.id === 'extras' && (
                                <div className="space-y-6">
                                    {/* Visibility */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Visibility</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.button
                                                onClick={() => updateFormData('visibility', 'PUBLIC')}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                                                    formData.visibility === 'PUBLIC'
                                                        ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                                                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                                )}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Globe className="w-5 h-5 text-green-500 mb-2" />
                                                <div className="font-semibold text-neutral-900 dark:text-white">Public</div>
                                                <div className="text-sm text-neutral-500">Share with community</div>
                                                <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                                    50% off - 13 credits
                                                </Badge>
                                            </motion.button>
                                            <motion.button
                                                onClick={() => updateFormData('visibility', 'PRIVATE')}
                                                className={cn(
                                                    "p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                                                    formData.visibility === 'PRIVATE'
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                                        : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                                )}
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <Lock className="w-5 h-5 text-blue-500 mb-2" />
                                                <div className="font-semibold text-neutral-900 dark:text-white">Private</div>
                                                <div className="text-sm text-neutral-500">Only you can see</div>
                                                <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    25 credits
                                                </Badge>
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Assessment */}
                                    <motion.button
                                        onClick={() => updateFormData('includeAssessment', !formData.includeAssessment)}
                                        className={cn(
                                            "w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left",
                                            formData.includeAssessment
                                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                                                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                                        )}
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Brain className="w-5 h-5 text-purple-500" />
                                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                                        Quiz & AI Mock Interview
                                                    </span>
                                                    <Badge variant="secondary">Recommended</Badge>
                                                </div>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    Get AI-generated quiz and practice interviews tailored to your project
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                                    formData.includeAssessment
                                                        ? "bg-purple-500 border-purple-500"
                                                        : "border-neutral-300 dark:border-neutral-600"
                                                )}>
                                                    {formData.includeAssessment && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">+30 credits</div>
                                            </div>
                                        </div>
                                    </motion.button>
                                </div>
                            )}

                            {currentStepConfig?.id === 'review' && (
                                <div className="space-y-6">
                                    {/* Summary Card */}
                                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-xl space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {formData.projectTitle}
                                            </h3>
                                            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                                                {formData.projectDescription?.substring(0, 100)}...
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="outline">{formData.generationType?.replace('_', ' ')}</Badge>
                                            <Badge variant="outline">{formData.difficulty}</Badge>
                                            {formData.stacks?.frontend && <Badge>{formData.stacks.frontend}</Badge>}
                                            {formData.stacks?.backend && <Badge>{formData.stacks.backend}</Badge>}
                                            {formData.stacks?.database && <Badge>{formData.stacks.database}</Badge>}
                                        </div>

                                        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-500">Base ({formData.visibility})</span>
                                                <span className="font-medium">{baseCost} credits</span>
                                            </div>
                                            {formData.includeAssessment && (
                                                <div className="flex items-center justify-between text-sm mt-1">
                                                    <span className="text-neutral-500">Quiz & Mock Interview</span>
                                                    <span className="font-medium">+{assessmentCost} credits</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-neutral-200 dark:border-neutral-700">
                                                <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
                                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                    {totalCost} credits
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Similar Projects Check */}
                                    <Button
                                        onClick={searchForSimilarProjects}
                                        disabled={searchingProjects}
                                        variant="outline"
                                        className="w-full rounded-xl"
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

                        {/* Navigation */}
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

                            {currentStep < STEPS.length - 1 ? (
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
                                    disabled={loading}
                                    className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white px-8"
                                    size="lg"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                                    ) : (
                                        <><Sparkles className="w-5 h-5" /> Generate Project</>
                                    )}
                                </Button>
                            )}
                        </motion.div>

                        {/* Keyboard hint */}
                        {currentStep < STEPS.length - 1 && canProceed() && (
                            <motion.p
                                className="text-center text-sm text-neutral-400 mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                Press <kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs font-mono">Enter ↵</kbd> to continue
                            </motion.p>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Generation Progress Dialog */}
            <GenerationProgressDialog
                open={loading}
                progress={progressPercent}
                status={jobStatus}
            />
        </div>
    )
}
