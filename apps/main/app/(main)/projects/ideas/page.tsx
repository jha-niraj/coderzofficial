"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import {
    ArrowRight, Lightbulb, Sparkles, Layers, Target, CheckCircle2,
    Heart, Eye, Code2, Search, Filter
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Input } from '@repo/ui/components/ui/input'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter
} from '@repo/ui/components/ui/sheet'
import { categories, type Category } from './data/categories'
import {
    SubmitProjectIdeaSheet
} from '@/components/projects/submit-project-idea-sheet'
import { getProblemStatements } from '@/actions/(main)/projects/project-ideas.action'
import toast from '@repo/ui/components/ui/sonner'
import ProjectGenerateSheet from '@/components/projects/project-generate-sheet'

// Type for suggested stacks in problem statements
interface SuggestedStacks {
    languages?: string[]
    databases?: string[]
    queues?: string[]
    frameworks?: string[]
    [key: string]: string[] | undefined
}

interface ProblemStatement {
    id: string
    projectTitle: string
    projectDescription: string
    difficulty: string
    overview: string | null
    coreRequirements: string[]
    engineeringConstraints: string[]
    suggestedStacks: SuggestedStacks | null
    recruiterSignal: string | null
    upvotes: number
    views: number
    buildCount: number
    createdAt: Date
    submittedBy?: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
}

export default function ProjectIdeasPage() {
    const [submitSheetOpen, setSubmitSheetOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [techSheetOpen, setTechSheetOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('technology')

    // Problem statements state
    const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([])
    const [loadingProblems, setLoadingProblems] = useState(false)
    const [problemSearch, setProblemSearch] = useState('')
    const [problemDifficulty, setProblemDifficulty] = useState('all')

    // Problem statement detail sheet
    const [selectedProblem, setSelectedProblem] = useState<ProblemStatement | null>(null)
    const [problemDetailOpen, setProblemDetailOpen] = useState(false)

    // Project generate sheet
    const [generateSheetOpen, setGenerateSheetOpen] = useState(false)
    const [generateDefaults, setGenerateDefaults] = useState<{ title?: string, description?: string }>({})

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category)
        setTechSheetOpen(true)
    }

    const fetchProblemStatements = useCallback(async () => {
        setLoadingProblems(true)
        try {
            const result = await getProblemStatements({
                difficulty: problemDifficulty,
                search: problemSearch
            })
            if (result.success && result.data) {
                setProblemStatements(result.data as ProblemStatement[])
            }
        } catch (error) {
            console.error('Error fetching problem statements:', error)
            toast.error('Failed to load problem statements')
        } finally {
            setLoadingProblems(false)
        }
    }, [problemDifficulty, problemSearch])

    // Fetch problem statements when tab changes
    useEffect(() => {
        if (activeTab === 'problem') {
            fetchProblemStatements()
        }
    }, [activeTab, fetchProblemStatements])

    const handleViewProblem = (problem: ProblemStatement) => {
        setSelectedProblem(problem)
        setProblemDetailOpen(true)
    }

    const handleStartBuilding = (problem: ProblemStatement) => {
        // Close the detail sheet first
        setProblemDetailOpen(false)
        setSelectedProblem(null)

        // Set defaults and open generate sheet
        setGenerateDefaults({
            title: problem.projectTitle,
            description: problem.overview || problem.projectDescription
        })

        // Small delay to allow sheet to close
        setTimeout(() => {
            setGenerateSheetOpen(true)
        }, 200)
    }

    const getDifficultyStyle = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
            case 'INTERMEDIATE':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
            case 'ADVANCED':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
            default:
                return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400'
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12 max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 text-xs font-medium mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Curated Development Paths</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                        Build your portfolio with <br />
                        <span className="text-neutral-500 dark:text-neutral-500">real-world projects.</span>
                    </h1>
                    <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-8">
                        Stuck in tutorial hell? Browse curated project ideas ranging from beginner to advanced.
                        Pick a category, choose a tech stack, and start coding.
                    </p>
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={() => setSubmitSheetOpen(true)}
                            className="rounded-lg h-12 px-6 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all font-medium"
                        >
                            <Lightbulb className="w-4 h-4 mr-2" />
                            Submit an Idea
                        </Button>
                    </div>
                </motion.div>

                {/* Two-Tab Layout */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full max-w-md mx-auto mb-12 bg-white dark:bg-neutral-900 rounded-xl p-1 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <TabsTrigger
                            value="technology"
                            className="flex-1 rounded-lg data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black py-3"
                        >
                            <Code2 className="w-4 h-4 mr-2" />
                            Technology Based
                        </TabsTrigger>
                        <TabsTrigger
                            value="problem"
                            className="flex-1 rounded-lg data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black py-3"
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Problem First
                        </TabsTrigger>
                    </TabsList>

                    {/* Technology Based Tab */}
                    <TabsContent value="technology">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {categories.map((category, index) => {
                                const Icon = category.icon
                                return (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div
                                            onClick={() => handleCategoryClick(category)}
                                            className="group h-full bg-white dark:bg-neutral-900 shadow-2xl rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className={`p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors duration-300`}>
                                                        <Icon className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500 border border-neutral-100 dark:border-neutral-800 px-2 py-1 rounded-md">
                                                        {category.technologies.length} Stacks
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                                    {category.name}
                                                </h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                                                    {category.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                                                Explore Projects
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </TabsContent>

                    {/* Problem First Tab */}
                    <TabsContent value="problem">
                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search problem statements..."
                                    value={problemSearch}
                                    onChange={(e) => setProblemSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchProblemStatements()}
                                    className="pl-10 h-12 rounded-lg bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                />
                            </div>
                            <Select value={problemDifficulty} onValueChange={setProblemDifficulty}>
                                <SelectTrigger className="w-full sm:w-48 h-12 rounded-lg bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                    <Filter className="w-4 h-4 mr-2 text-neutral-500" />
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Problem Statements Grid */}
                        {loadingProblems ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 animate-pulse">
                                        <div className="h-6 w-24 bg-neutral-100 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="h-8 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="space-y-2 mb-6">
                                            <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                                            <div className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : problemStatements.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
                                <Target className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No problem statements found</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-6">Be the first to submit a technology-agnostic challenge!</p>
                                <Button onClick={() => setSubmitSheetOpen(true)}>
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    Submit a Problem Statement
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {problemStatements.map((problem, index) => (
                                    <motion.div
                                        key={problem.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group bg-white dark:bg-neutral-900 shadow-2xl rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge className={getDifficultyStyle(problem.difficulty)}>
                                                {problem.difficulty}
                                            </Badge>
                                            <div className="flex items-center gap-3 text-sm text-neutral-400">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>{problem.views || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-3.5 h-3.5" />
                                                    <span>{problem.upvotes || 0}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {problem.projectTitle}
                                        </h3>

                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3 flex-grow">
                                            {problem.overview || problem.projectDescription}
                                        </p>

                                        {/* Core Requirements Preview */}
                                        {problem.coreRequirements && problem.coreRequirements.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {problem.coreRequirements.slice(0, 2).map((req, i) => (
                                                        <div key={i} className="flex items-center gap-1 text-xs text-neutral-500">
                                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                            <span className="truncate max-w-[120px]">{req}</span>
                                                        </div>
                                                    ))}
                                                    {problem.coreRequirements.length > 2 && (
                                                        <span className="text-xs text-neutral-400">+{problem.coreRequirements.length - 2} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        {problem.buildCount > 0 && (
                                            <p className="text-xs text-neutral-500 mb-4">
                                                👥 {problem.buildCount} devs built this
                                            </p>
                                        )}

                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleViewProblem(problem)}
                                                className="h-10 rounded-lg"
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                onClick={() => handleStartBuilding(problem)}
                                                className="h-10 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                            >
                                                Start Building
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Missing category section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-24 text-center"
                >
                    <div className="max-w-2xl mx-auto p-8 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                            Missing a category?
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-sm">
                            We are constantly adding new technologies and stacks. If you have a specific request, let us know.
                        </p>
                        <Button
                            onClick={() => setSubmitSheetOpen(true)}
                            variant="outline"
                            className="h-10 border-neutral-200 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800"
                        >
                            Request Category
                        </Button>
                    </div>
                </motion.div>
            </div>
            <Sheet open={techSheetOpen} onOpenChange={setTechSheetOpen}>
                <SheetContent side="bottom" className="h-[80vh] w-full overflow-y-auto">
                    {
                        selectedCategory && (
                            <section className="w-full max-w-5xl mx-auto">
                                <SheetHeader className="mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                                            {selectedCategory.icon && <selectedCategory.icon className="w-7 h-7 text-neutral-900 dark:text-white" />}
                                        </div>
                                    </div>
                                    <SheetTitle className="text-left">{selectedCategory.name}</SheetTitle>
                                    <SheetDescription className="text-left">
                                        {selectedCategory.description}
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Layers className="w-4 h-4 text-neutral-500" />
                                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Choose a Technology ({selectedCategory.technologies.length})
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedCategory.technologies.map((tech, index) => (
                                            <motion.div
                                                key={tech.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link
                                                    href={`/projects/ideas/${selectedCategory.id}/${tech.id}`}
                                                    onClick={() => setTechSheetOpen(false)}
                                                >
                                                    <div className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-lg transition-all duration-200 cursor-pointer">
                                                        <div className="flex items-start gap-4">
                                                            <div className="text-3xl flex-shrink-0 p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg group-hover:scale-105 transition-transform">
                                                                {tech.icon || <Layers className="w-6 h-6 text-neutral-400" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                        {tech.name}
                                                                    </h4>
                                                                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                                </div>
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                                                    {tech.description}
                                                                </p>
                                                                {
                                                                    tech.projectCount && (
                                                                        <div className="mt-3 text-xs text-neutral-500">
                                                                            {tech.projectCount} projects available
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))
                                        }
                                    </div>
                                </div>
                            </section>
                        )
                    }
                </SheetContent>
            </Sheet>
            <Sheet open={problemDetailOpen} onOpenChange={setProblemDetailOpen}>
                <SheetContent side="bottom" className="h-[80vh] w-full overflow-y-auto">
                    {
                        selectedProblem && (
                            <section className="w-full max-w-5xl mx-auto">
                                <SheetHeader className="mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className={getDifficultyStyle(selectedProblem.difficulty)}>
                                            {selectedProblem.difficulty}
                                        </Badge>
                                        <div className="flex items-center gap-3 text-sm text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                {selectedProblem.views || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-3.5 h-3.5" />
                                                {selectedProblem.upvotes || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <SheetTitle className="text-left text-2xl">{selectedProblem.projectTitle}</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Overview</h4>
                                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                            {selectedProblem.overview || selectedProblem.projectDescription}
                                        </p>
                                    </div>
                                    {
                                        selectedProblem.recruiterSignal && (
                                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                                                <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                                                    📡 Recruiter Signal
                                                </h4>
                                                <p className="text-sm text-indigo-700 dark:text-indigo-400">
                                                    {selectedProblem.recruiterSignal}
                                                </p>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedProblem.coreRequirements && selectedProblem.coreRequirements.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Core Requirements</h4>
                                                <ul className="space-y-2">
                                                    {
                                                        selectedProblem.coreRequirements.map((req, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">{req}</span>
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedProblem.engineeringConstraints && selectedProblem.engineeringConstraints.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Engineering Constraints</h4>
                                                <ul className="space-y-2">
                                                    {
                                                        selectedProblem.engineeringConstraints.map((constraint, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <Target className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                <span className="text-sm text-neutral-600 dark:text-neutral-400">{constraint}</span>
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedProblem.suggestedStacks && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Suggested Stacks</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {
                                                        Object.entries(selectedProblem.suggestedStacks).map(([key, values]) => (
                                                            Array.isArray(values) && values.map((value: string, i: number) => (
                                                                <Badge key={`${key}-${i}`} variant="outline" className="text-xs">
                                                                    {value}
                                                                </Badge>
                                                            ))
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedProblem.buildCount > 0 && (
                                            <div className="text-sm text-neutral-500 py-3 border-t border-neutral-200 dark:border-neutral-800">
                                                👥 {selectedProblem.buildCount} developers have built this project
                                            </div>
                                        )
                                    }
                                </div>
                                <SheetFooter className="mt-8">
                                    <Button
                                        onClick={() => handleStartBuilding(selectedProblem)}
                                        className="w-full h-12 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                    >
                                        <Code2 className="w-4 h-4 mr-2" />
                                        Start Building This Project
                                    </Button>
                                </SheetFooter>
                            </section>
                        )
                    }
                </SheetContent>
            </Sheet>

            <SubmitProjectIdeaSheet
                open={submitSheetOpen}
                onOpenChange={setSubmitSheetOpen}
            />

            <ProjectGenerateSheet
                trigger={<></>}
                defaultValues={generateDefaults}
                isOpen={generateSheetOpen}
                onOpenChange={setGenerateSheetOpen}
                onSuccess={() => {
                    setGenerateSheetOpen(false)
                    toast.success('Project created! Redirecting...')
                }}
            />
        </div>
    )
}