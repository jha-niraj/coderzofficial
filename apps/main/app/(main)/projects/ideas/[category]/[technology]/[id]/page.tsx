'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, Heart, Share2, Eye, CheckCircle2, Clock, Code2, Layers,
    Sparkles
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { Separator } from '@repo/ui/components/ui/separator'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    getProjectIdeaById, toggleProjectUpvote, checkUserUpvote
} from '@/actions/(main)/projects/project-ideas.action'
import toast from '@repo/ui/components/ui/sonner'
import { getCategoryById, getTechnologyById } from '../../../data/categories'

interface ProjectIdea {
    id: string
    projectTitle: string
    projectDescription: string
    difficulty: string
    generationType: string
    technologies?: string[]
    features?: string[]
    learningOutcomes?: string[]
    estimatedTime?: string
    views?: number
    upvotes?: number
    createdAt: Date
    author?: {
        name: string | null
        image: string | null
    }
}

export default function ProjectIdeaDetailPage() {
    const params = useParams()
    const router = useRouter()
    const categoryId = params.category as string
    const technologyId = params.technology as string
    const projectId = params.id as string

    const [project, setProject] = useState<ProjectIdea | null>(null)
    const [loading, setLoading] = useState(true)
    const [upvoted, setUpvoted] = useState(false)
    const [upvoteCount, setUpvoteCount] = useState(0)
    const [upvoting, setUpvoting] = useState(false)

    const category = getCategoryById(categoryId)
    const technology = getTechnologyById(categoryId, technologyId)

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true)
            try {
                const result = await getProjectIdeaById(projectId)
                if (result.success && result.data) {
                    setProject(result.data)
                    setUpvoteCount(result.data.upvotes || 0)
                } else {
                    toast.error('Project not found')
                    router.push(`/projects/ideas/${categoryId}/${technologyId}`)
                }

                const upvoteResult = await checkUserUpvote(projectId)
                if (upvoteResult.success) {
                    setUpvoted(upvoteResult.upvoted || false)
                }
            } catch (error) {
                console.error('Failed to fetch project:', error)
                toast.error('Failed to load project')
            } finally {
                setLoading(false)
            }
        }

        fetchProject()
    }, [projectId, categoryId, technologyId, router])

    const handleUpvote = async () => {
        setUpvoting(true)
        const result = await toggleProjectUpvote(projectId)

        if (result.success) {
            setUpvoted(result.upvoted || false)
            setUpvoteCount((prev) => result.upvoted ? prev + 1 : prev - 1)
            toast.success(result.message)
        } else {
            toast.error(result.error || 'Failed to upvote')
        }
        setUpvoting(false)
    }

    const handleBuildProject = () => {
        if (!project) return
        const params = new URLSearchParams({
            title: project.projectTitle,
            description: project.projectDescription,
            type: project.generationType,
            difficulty: project.difficulty,
        })
        router.push(`/projects/generate?${params.toString()}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-white"></div>
            </div>
        )
    }

    if (!project || !category || !technology) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                        Project Not Found
                    </h1>
                    <Button onClick={() => router.push('/projects/ideas')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Ideas
                    </Button>
                </div>
            </div>
        )
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
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans">
            <div className="fixed inset-0 z-0 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                <div>
                    <Link href={`/projects/ideas/${categoryId}/${technologyId}`}>
                        <Button variant="ghost" className="mb-8 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to {technology.name} Projects
                        </Button>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <Badge className={`${getDifficultyStyle(project.difficulty)} px-3 py-1`}>
                                {project.difficulty}
                            </Badge>
                            <div className="flex items-center gap-4 text-sm text-neutral-500">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    <span>{project.views || 0} views</span>
                                </div>
                                <button
                                    onClick={handleUpvote}
                                    disabled={upvoting}
                                    className={`flex items-center gap-1.5 transition-colors ${upvoted ? 'text-rose-500' : 'hover:text-rose-500'}`}
                                >
                                    <Heart className={`w-4 h-4 ${upvoted ? 'fill-current' : ''}`} />
                                    <span>{upvoteCount} upvotes</span>
                                </button>
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                            {project.projectTitle}
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
                            {project.projectDescription}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={handleBuildProject}
                                size="lg"
                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                            >
                                <Code2 className="w-4 h-4 mr-2" />
                                Start Building
                            </Button>
                            <Button variant="outline" size="lg">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8"></div>                      {/* Technologies */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="w-5 h-5" />
                                    Technologies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {
                                        project.technologies?.map((tech: string) => (
                                            <Badge key={tech} variant="secondary" className="px-3 py-1">
                                                {tech}
                                            </Badge>
                                        ))
                                    }
                                </div>
                            </CardContent>
                        </Card>
                        {
                            project.features && project.features.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Key Features
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {
                                                project.features.map((feature: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </CardContent>
                                </Card>
                            )
                        }
                        {
                            project.learningOutcomes && project.learningOutcomes.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5" />
                                            What You&apos;ll Learn
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {
                                                project.learningOutcomes.map((outcome: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{index + 1}</span>
                                                        </div>
                                                        <span className="text-neutral-700 dark:text-neutral-300">{outcome}</span>
                                                    </li>
                                                ))
                                            }
                                        </ul>
                                    </CardContent>
                                </Card>
                            )
                        }
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Project Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Category</div>
                                    <div className="font-medium text-neutral-900 dark:text-white">{category.name}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Technology</div>
                                    <div className="font-medium text-neutral-900 dark:text-white">{technology.name}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Difficulty</div>
                                    <Badge className={getDifficultyStyle(project.difficulty)}>
                                        {project.difficulty}
                                    </Badge>
                                </div>
                                {
                                    project.estimatedTime && (
                                        <>
                                            <Separator />
                                            <div>
                                                <div className="text-sm text-neutral-500 mb-1">Estimated Time</div>
                                                <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">{project.estimatedTime}</span>
                                                </div>
                                            </div>
                                        </>
                                    )
                                }
                            </CardContent>
                        </Card>
                        {
                            project.author && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Submitted By</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={project.author.image || ''} />
                                                <AvatarFallback>{project.author.name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-neutral-900 dark:text-white">
                                                    {project.author.name || 'Anonymous'}
                                                </div>
                                                <div className="text-sm text-neutral-500">
                                                    {new Date(project.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}