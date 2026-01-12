'use client'

import { useState } from 'react'
import {
    X, Link as LinkIcon, Image as ImageIcon, Loader2, Check,
    Target, Code2, ArrowLeft, ArrowRight, Lightbulb
} from 'lucide-react'
import Image from 'next/image'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Label } from '@repo/ui/components/ui/label'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import { Badge } from '@repo/ui/components/ui/badge'
import toast from '@repo/ui/components/ui/sonner'
import {
    submitProjectIdea, submitProblemStatement
} from '@/actions/(main)/projects/project-ideas.action'
import { uploadImageToCloudinary } from '@/actions/(common)/shared/upload.action'

interface SubmitProjectIdeaSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type IdeaType = 'select' | 'problem' | 'technology'

export function SubmitProjectIdeaSheet({ open, onOpenChange }: SubmitProjectIdeaSheetProps) {
    const [loading, setLoading] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [ideaType, setIdeaType] = useState<IdeaType>('select')

    // Technology-specific form data
    const [techFormData, setTechFormData] = useState({
        projectTitle: '',
        projectDescription: '',
        generationType: '',
        difficulty: '',
        primaryLanguageOrFramework: '',
        technology: '',
        technologies: [] as string[],
        categories: [] as string[],
        images: [] as string[],
        figmaLinks: [] as string[],
        resourceLinks: [] as string[],
    })

    // Problem statement form data
    const [problemFormData, setProblemFormData] = useState({
        projectTitle: '',
        projectDescription: '',
        difficulty: '',
        overview: '',
        coreRequirements: [] as string[],
        engineeringConstraints: [] as string[],
        recruiterSignal: '',
        categories: [] as string[],
    })

    const [techInput, setTechInput] = useState('')
    const [categoryInput, setCategoryInput] = useState('')
    const [figmaInput, setFigmaInput] = useState('')
    const [resourceInput, setResourceInput] = useState('')
    const [requirementInput, setRequirementInput] = useState('')
    const [constraintInput, setConstraintInput] = useState('')

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB')
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        setUploadingImage(true)
        try {
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)

            const result = await uploadImageToCloudinary(uploadFormData)

            if (result.success && result.url) {
                setTechFormData(prev => ({
                    ...prev,
                    images: [...prev.images, result.url!],
                }))
                toast.success('Image uploaded successfully')
            } else {
                toast.error(result.message || 'Failed to upload image')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
        } finally {
            setUploadingImage(false)
        }
    }

    const handleSubmitTechnology = async () => {
        if (!techFormData.projectTitle.trim()) {
            toast.error('Please enter a project title')
            return
        }
        if (!techFormData.projectDescription.trim()) {
            toast.error('Please enter a project description')
            return
        }
        if (!techFormData.generationType) {
            toast.error('Please select a generation type')
            return
        }
        if (!techFormData.difficulty) {
            toast.error('Please select a difficulty level')
            return
        }
        if (!techFormData.technology) {
            toast.error('Please select a technology')
            return
        }

        setLoading(true)
        try {
            const result = await submitProjectIdea(techFormData)

            if (result.success) {
                toast.success(result.message || 'Project idea submitted successfully!')
                resetAndClose()
            } else {
                toast.error(result.error || 'Failed to submit project idea')
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('Failed to submit project idea')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitProblem = async () => {
        if (!problemFormData.projectTitle.trim()) {
            toast.error('Please enter a title')
            return
        }
        if (!problemFormData.projectDescription.trim()) {
            toast.error('Please enter a description')
            return
        }
        if (!problemFormData.difficulty) {
            toast.error('Please select a difficulty level')
            return
        }

        setLoading(true)
        try {
            const result = await submitProblemStatement({
                projectTitle: problemFormData.projectTitle,
                projectDescription: problemFormData.projectDescription,
                difficulty: problemFormData.difficulty,
                overview: problemFormData.overview || problemFormData.projectDescription,
                coreRequirements: problemFormData.coreRequirements,
                engineeringConstraints: problemFormData.engineeringConstraints,
                recruiterSignal: problemFormData.recruiterSignal,
                categories: problemFormData.categories,
            })

            if (result.success) {
                toast.success(result.message || 'Problem statement submitted successfully!')
                resetAndClose()
            } else {
                toast.error(result.error || 'Failed to submit problem statement')
            }
        } catch (error) {
            console.error('Submit error:', error)
            toast.error('Failed to submit problem statement')
        } finally {
            setLoading(false)
        }
    }

    const resetAndClose = () => {
        setIdeaType('select')
        setTechFormData({
            projectTitle: '',
            projectDescription: '',
            generationType: '',
            difficulty: '',
            primaryLanguageOrFramework: '',
            technology: '',
            technologies: [],
            categories: [],
            images: [],
            figmaLinks: [],
            resourceLinks: [],
        })
        setProblemFormData({
            projectTitle: '',
            projectDescription: '',
            difficulty: '',
            overview: '',
            coreRequirements: [],
            engineeringConstraints: [],
            recruiterSignal: '',
            categories: [],
        })
        onOpenChange(false)
    }

    const addTechnology = () => {
        if (techInput.trim() && !techFormData.technologies.includes(techInput.trim())) {
            setTechFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()],
            }))
            setTechInput('')
        }
    }

    const removeTechnology = (tech: string) => {
        setTechFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(t => t !== tech),
        }))
    }

    const addCategory = (isProblem: boolean = false) => {
        if (categoryInput.trim()) {
            if (isProblem) {
                if (!problemFormData.categories.includes(categoryInput.trim())) {
                    setProblemFormData(prev => ({
                        ...prev,
                        categories: [...prev.categories, categoryInput.trim()],
                    }))
                }
            } else {
                if (!techFormData.categories.includes(categoryInput.trim())) {
                    setTechFormData(prev => ({
                        ...prev,
                        categories: [...prev.categories, categoryInput.trim()],
                    }))
                }
            }
            setCategoryInput('')
        }
    }

    const removeCategory = (cat: string, isProblem: boolean = false) => {
        if (isProblem) {
            setProblemFormData(prev => ({
                ...prev,
                categories: prev.categories.filter(c => c !== cat),
            }))
        } else {
            setTechFormData(prev => ({
                ...prev,
                categories: prev.categories.filter(c => c !== cat),
            }))
        }
    }

    const addFigmaLink = () => {
        if (figmaInput.trim() && !techFormData.figmaLinks.includes(figmaInput.trim())) {
            setTechFormData(prev => ({
                ...prev,
                figmaLinks: [...prev.figmaLinks, figmaInput.trim()],
            }))
            setFigmaInput('')
        }
    }

    const addResourceLink = () => {
        if (resourceInput.trim() && !techFormData.resourceLinks.includes(resourceInput.trim())) {
            setTechFormData(prev => ({
                ...prev,
                resourceLinks: [...prev.resourceLinks, resourceInput.trim()],
            }))
            setResourceInput('')
        }
    }

    const addRequirement = () => {
        if (requirementInput.trim() && !problemFormData.coreRequirements.includes(requirementInput.trim())) {
            setProblemFormData(prev => ({
                ...prev,
                coreRequirements: [...prev.coreRequirements, requirementInput.trim()],
            }))
            setRequirementInput('')
        }
    }

    const removeRequirement = (req: string) => {
        setProblemFormData(prev => ({
            ...prev,
            coreRequirements: prev.coreRequirements.filter(r => r !== req),
        }))
    }

    const addConstraint = () => {
        if (constraintInput.trim() && !problemFormData.engineeringConstraints.includes(constraintInput.trim())) {
            setProblemFormData(prev => ({
                ...prev,
                engineeringConstraints: [...prev.engineeringConstraints, constraintInput.trim()],
            }))
            setConstraintInput('')
        }
    }

    const removeConstraint = (constraint: string) => {
        setProblemFormData(prev => ({
            ...prev,
            engineeringConstraints: prev.engineeringConstraints.filter(c => c !== constraint),
        }))
    }

    return (
        <Sheet open={open} onOpenChange={(isOpen) => {
            if (!isOpen) resetAndClose()
            else onOpenChange(isOpen)
        }}>
            <SheetContent side="bottom" className="h-[80vh] w-full overflow-y-auto">
                <section className="w-full max-w-6xl mx-auto px-4">
                    {
                        ideaType === 'select' && (
                            <>
                                <SheetHeader className="mb-8">
                                    <SheetTitle className="flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5" />
                                        Submit an Idea
                                    </SheetTitle>
                                    <SheetDescription>
                                        What type of idea would you like to submit?
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => setIdeaType('problem')}
                                        className="cursor-pointer group text-left bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
                                                <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Problem Statement</h3>
                                                <p className="text-sm text-neutral-500">Technology agnostic</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Submit a challenge or problem that developers can solve using any tech stack they prefer.
                                            Great for real-world scenarios and open-ended projects.
                                        </p>
                                        <div className="mt-4 flex items-center text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:gap-2 transition-all">
                                            Choose this
                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setIdeaType('technology')}
                                        className="cursor-pointer group text-left bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                                <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Technology Specific</h3>
                                                <p className="text-sm text-neutral-500">With defined stack</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Submit a project idea with a specific technology stack.
                                            Best for tutorials, guided projects, and learning paths.
                                        </p>
                                        <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                                            Choose this
                                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>
                                </div>
                            </>
                        )
                    }
                    {
                        ideaType === 'problem' && (
                            <>
                                <SheetHeader className="mb-6">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIdeaType('select')}
                                            className="p-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <div>
                                            <SheetTitle className="flex items-center gap-2">
                                                <Target className="w-5 h-5 text-amber-600" />
                                                Submit Problem Statement
                                            </SheetTitle>
                                            <SheetDescription>
                                                A technology-agnostic challenge for developers
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>
                                <div className="space-y-5">
                                    <div className="w-full">
                                        <Label htmlFor="problem-title">Title *</Label>
                                        <Input
                                            id="problem-title"
                                            placeholder="e.g., Build an Event-Driven Notification System"
                                            value={problemFormData.projectTitle}
                                            onChange={(e) => setProblemFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                                            className="mt-2 w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="w-full">
                                            <Label htmlFor="problem-desc">Short Description *</Label>
                                            <Textarea
                                                id="problem-desc"
                                                placeholder="A brief description of the problem..."
                                                value={problemFormData.projectDescription}
                                                onChange={(e) => setProblemFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                                                rows={4}
                                                className="mt-2 w-full"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <Label htmlFor="problem-overview">Detailed Overview (optional)</Label>
                                            <Textarea
                                                id="problem-overview"
                                                placeholder="Provide a detailed explanation of the problem, context, and what makes it interesting..."
                                                value={problemFormData.overview}
                                                onChange={(e) => setProblemFormData(prev => ({ ...prev, overview: e.target.value }))}
                                                rows={4}
                                                className="mt-2 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="w-full">
                                            <Label>Difficulty Level *</Label>
                                            <Select
                                                value={problemFormData.difficulty}
                                                onValueChange={(value) => setProblemFormData(prev => ({ ...prev, difficulty: value }))}
                                            >
                                                <SelectTrigger className="mt-2 w-full">
                                                    <SelectValue placeholder="Select difficulty" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-full">
                                            <Label>Core Requirements (what must be implemented)</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="e.g., User authentication"
                                                    value={requirementInput}
                                                    onChange={(e) => setRequirementInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                                                    className="flex-1"
                                                />
                                                <Button type="button" onClick={addRequirement} variant="outline">Add</Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {
                                                    problemFormData.coreRequirements.map((req) => (
                                                        <Badge key={req} variant="secondary" className="flex items-center gap-1">
                                                            {req}
                                                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeRequirement(req)} />
                                                        </Badge>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="w-full">
                                            <Label>Engineering Constraints (optional)</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="e.g., Must handle 10k concurrent users"
                                                    value={constraintInput}
                                                    onChange={(e) => setConstraintInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addConstraint())}
                                                    className="flex-1"
                                                />
                                                <Button type="button" onClick={addConstraint} variant="outline">Add</Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {
                                                    problemFormData.engineeringConstraints.map((constraint) => (
                                                        <Badge key={constraint} variant="secondary" className="flex items-center gap-1">
                                                            {constraint}
                                                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeConstraint(constraint)} />
                                                        </Badge>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <Label htmlFor="recruiter-signal">Recruiter Signal (optional)</Label>
                                            <Input
                                                id="recruiter-signal"
                                                placeholder="e.g., Demonstrates understanding of event-driven architecture"
                                                value={problemFormData.recruiterSignal}
                                                onChange={(e) => setProblemFormData(prev => ({ ...prev, recruiterSignal: e.target.value }))}
                                                className="mt-2 w-full"
                                            />
                                            <p className="text-xs text-neutral-500 mt-1">What skill does this project prove to recruiters?</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setIdeaType('select')}>
                                            Back
                                        </Button>
                                        <Button onClick={handleSubmitProblem} disabled={loading}>
                                            {
                                                loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Submit Problem Statement
                                                    </>
                                                )
                                            }
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )
                    }
                    {
                        ideaType === 'technology' && (
                            <>
                                <SheetHeader className="mb-6">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIdeaType('select')}
                                            className="p-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </Button>
                                        <div>
                                            <SheetTitle className="flex items-center gap-2">
                                                <Code2 className="w-5 h-5 text-blue-600" />
                                                Submit Technology-Specific Idea
                                            </SheetTitle>
                                            <SheetDescription>
                                                A project idea with a defined tech stack
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="w-full">
                                            <Label htmlFor="title">Project Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., React Task Manager"
                                                value={techFormData.projectTitle}
                                                onChange={(e) => setTechFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
                                                className="mt-2 w-full"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <Label htmlFor="description">Project Description *</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe what the project does, key features, and learning outcomes..."
                                                value={techFormData.projectDescription}
                                                onChange={(e) => setTechFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                                                rows={2}
                                                className="mt-2 w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="w-full">
                                            <Label>Generation Type *</Label>
                                            <Select
                                                value={techFormData.generationType}
                                                onValueChange={(value) => setTechFormData(prev => ({ ...prev, generationType: value }))}
                                            >
                                                <SelectTrigger className="mt-2 w-full">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FRONTEND">Frontend</SelectItem>
                                                    <SelectItem value="FULL_STACK">Full Stack</SelectItem>
                                                    <SelectItem value="BACKEND">Backend</SelectItem>
                                                    <SelectItem value="AI_AGENT">AI Agent</SelectItem>
                                                    <SelectItem value="PROGRAMS">Programs</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-full">
                                            <Label>Difficulty Level *</Label>
                                            <Select
                                                value={techFormData.difficulty}
                                                onValueChange={(value) => setTechFormData(prev => ({ ...prev, difficulty: value }))}
                                            >
                                                <SelectTrigger className="mt-2 w-full">
                                                    <SelectValue placeholder="Select difficulty" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-full">
                                            <Label>Primary Technology *</Label>
                                            <Select
                                                value={techFormData.technology}
                                                onValueChange={(value) => setTechFormData(prev => ({ ...prev, technology: value, primaryLanguageOrFramework: value }))}
                                            >
                                                <SelectTrigger className="mt-2 w-full">
                                                    <SelectValue placeholder="Select technology" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="react">React</SelectItem>
                                                    <SelectItem value="nextjs">Next.js</SelectItem>
                                                    <SelectItem value="vue">Vue</SelectItem>
                                                    <SelectItem value="angular">Angular</SelectItem>
                                                    <SelectItem value="svelte">Svelte</SelectItem>
                                                    <SelectItem value="node">Node.js</SelectItem>
                                                    <SelectItem value="python">Python</SelectItem>
                                                    <SelectItem value="golang">Go</SelectItem>
                                                    <SelectItem value="java">Java</SelectItem>
                                                    <SelectItem value="rust">Rust</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="w-full">
                                            <Label>Additional Technologies</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="e.g., Tailwind CSS, PostgreSQL"
                                                    value={techInput}
                                                    onChange={(e) => setTechInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                                                    className="flex-1"
                                                />
                                                <Button type="button" onClick={addTechnology} variant="outline">Add</Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {
                                                    techFormData.technologies.map((tech) => (
                                                        <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                                                            {tech}
                                                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeTechnology(tech)} />
                                                        </Badge>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <Label>Categories</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="e.g., E-commerce, Social Media"
                                                    value={categoryInput}
                                                    onChange={(e) => setCategoryInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                                    className="flex-1"
                                                />
                                                <Button type="button" onClick={() => addCategory()} variant="outline">Add</Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {
                                                    techFormData.categories.map((cat) => (
                                                        <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                                                            {cat}
                                                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeCategory(cat)} />
                                                        </Badge>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="w-full">
                                            <Label>Figma Links</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="https://figma.com/..."
                                                    value={figmaInput}
                                                    onChange={(e) => setFigmaInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFigmaLink())}
                                                    className="flex-1"
                                                />
                                                <Button type="button" onClick={addFigmaLink} variant="outline">
                                                    <LinkIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {
                                                    techFormData.figmaLinks.map((link) => (
                                                        <Badge key={link} variant="outline" className="flex items-center gap-1 text-xs">
                                                            {link.substring(0, 30)}...
                                                            <X
                                                                className="w-3 h-3 cursor-pointer"
                                                                onClick={() => setTechFormData(prev => ({
                                                                    ...prev,
                                                                    figmaLinks: prev.figmaLinks.filter(l => l !== link),
                                                                }))}
                                                            />
                                                        </Badge>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className="w-full">
                                            <Label>Resource Links</Label>
                                            <div className="flex gap-2 mt-2">
                                                <Input
                                                    placeholder="https://..."
                                                    value={resourceInput}
                                                    onChange={(e) => setResourceInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResourceLink())}
                                                    className="flex-1"
                                                />
                                                <Button type="button" onClick={addResourceLink} variant="outline">
                                                    <LinkIcon className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {
                                                    techFormData.resourceLinks.map((link) => (
                                                        <Badge key={link} variant="outline" className="flex items-center gap-1 text-xs">
                                                            {link.substring(0, 30)}...
                                                            <X
                                                                className="w-3 h-3 cursor-pointer"
                                                                onClick={() => setTechFormData(prev => ({
                                                                    ...prev,
                                                                    resourceLinks: prev.resourceLinks.filter(l => l !== link),
                                                                }))}
                                                            />
                                                        </Badge>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <Label>UI Screenshots</Label>
                                        <div className="mt-2 flex flex-wrap gap-4">
                                            {
                                                techFormData.images.map((img, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <Image
                                                            src={img}
                                                            alt={`Screenshot ${idx + 1}`}
                                                            width={120}
                                                            height={80}
                                                            className="rounded-lg border object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setTechFormData(prev => ({
                                                                ...prev,
                                                                images: prev.images.filter((_, i) => i !== idx),
                                                            }))}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                            <Label className="w-[120px] h-[80px] border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                    disabled={uploadingImage}
                                                />
                                                {
                                                    uploadingImage ? (
                                                        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-neutral-400" />
                                                    )
                                                }
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setIdeaType('select')}>
                                            Back
                                        </Button>
                                        <Button onClick={handleSubmitTechnology} disabled={loading}>
                                            {
                                                loading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Submit Idea
                                                    </>
                                                )
                                            }
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </section>
            </SheetContent>
        </Sheet>
    )
}