'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, Sparkles, Play, Filter, Search, Heart, Eye, TrendingUp,
    CheckCircle2, Code2, Layers
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import { getCategoryById, getTechnologyById } from '../../data/categories'
import {
    getProjectIdeasByTechnology, getTopUpvotedProjects
} from '@/actions/(main)/projects/project-ideas.action'
import toast from '@repo/ui/components/ui/sonner'

interface ProjectIdea {
    id: string
    projectTitle: string
    projectDescription: string
    technologies: string[]
    difficulty: string
    generationType: string
    upvotes: number
    views: number
    createdAt?: string
}

export default function TechnologyProjectsPage() {
    const params = useParams()
    const router = useRouter()
    const categoryId = params.category as string
    const technologyId = params.technology as string

    const [projects, setProjects] = useState<ProjectIdea[]>([])
    const [topProjects, setTopProjects] = useState<ProjectIdea[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

    const category = getCategoryById(categoryId)
    const technology = getTechnologyById(categoryId, technologyId)

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true)
            try {
                const techNameMap: Record<string, string> = {
                    'react': 'React',
                    'nextjs': 'Next.js',
                    'vue': 'Vue.js',
                    'angular': 'Angular',
                    'nodejs': 'Node.js',
                    'python': 'Python'
                }

                const techName = techNameMap[technologyId] || technology?.name || technologyId

                const result = await getProjectIdeasByTechnology(techName)
                if (result.success && result.data) {
                    setProjects(result.data.map(project => ({
                        ...project,
                        createdAt: project.createdAt.toISOString()
                    })))
                }

                const topResult = await getTopUpvotedProjects(techName, 3)
                if (topResult.success && topResult.data) {
                    setTopProjects(topResult.data.map(project => ({
                        ...project,
                        createdAt: project.createdAt.toISOString()
                    })))
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error)
                toast.error('Failed to fetch projects')
            } finally {
                setLoading(false)
            }
        }

        if (technology) {
            fetchProjects()
        }
    }, [technologyId, technology])

    if (!category || !technology) {
        return (
            <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                        Technology Not Found
                    </h1>
                    <Button onClick={() => router.push('/projects/ideas')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Categories
                    </Button>
                </div>
            </div>
        )
    }

    // Filter projects logic
    const filteredProjects = projects.filter(project => {
        const matchesSearch = searchQuery === '' ||
            project.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.projectDescription.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesDifficulty = difficultyFilter === 'all' ||
            project.difficulty === difficultyFilter

        return matchesSearch && matchesDifficulty
    })

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">
            <div className="fixed inset-0 z-0 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <Link href="/projects/ideas">
                    <Button variant="ghost" className="mb-12 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Categories
                    </Button>
                </Link>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 grid lg:grid-cols-2 gap-12 items-center"
                >
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shadow-lg">
                                {technology.icon}
                            </div>
                            <Badge variant="outline" className="h-8 px-3 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                                {projects.length} Projects Available
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
                            Build with {technology.name}
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed max-w-xl">
                            {technology.description} Start building real-world applications to master the ecosystem and boost your portfolio.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search specific concepts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12 rounded-lg bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-neutral-900 dark:focus:ring-white"
                                />
                            </div>
                            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
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
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-8 border border-neutral-100 dark:border-neutral-800">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            What you&apos;ll master
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {
                                technology.learningOutcomes?.map((outcome, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-neutral-900 dark:text-white flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">{outcome}</span>
                                    </div>
                                )) || (
                                    <p className="text-sm text-neutral-500">Master core concepts and advanced patterns.</p>
                                )
                            }
                        </div>
                    </div>
                </motion.div>

                {
                    !loading && topProjects.length > 0 && (
                        <div className="mb-20">
                            <div className="flex items-center gap-2 mb-8">
                                <TrendingUp className="w-5 h-5 text-neutral-900 dark:text-white" />
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Popular Choices
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {
                                    topProjects.map((project, index) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            index={index}
                                            isTopProject={true}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    )
                }

                <div className="mb-8 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-neutral-900 dark:text-white" />
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        All Project Ideas
                    </h2>
                </div>

                {
                    loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {
                                [1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white dark:bg-neutral-900 shadow-2xl rounded-xl p-8 border border-neutral-100 dark:border-neutral-800 h-[300px] animate-pulse">
                                        <div className="flex justify-between mb-6">
                                            <div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                                            <div className="h-6 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                                        </div>
                                        <div className="h-8 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded mb-4" />
                                        <div className="space-y-2 mb-8">
                                            <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
                                            <div className="h-4 w-5/6 bg-neutral-100 dark:bg-neutral-800 rounded" />
                                        </div>
                                        <div className="flex gap-4 mt-auto">
                                            <div className="h-10 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/50">
                            <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No projects found</h3>
                            <p className="text-neutral-500 dark:text-neutral-400">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {
                                filteredProjects.map((project, index) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        index={index}
                                        isTopProject={false}
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

// --- Project Card Component ---
interface ProjectCardProps {
    project: ProjectIdea
    index: number
    isTopProject: boolean
}

function ProjectCard({ project, index, isTopProject }: ProjectCardProps) {
    const router = useRouter()
    const [upvoted, setUpvoted] = useState(false)
    const [upvoteCount, setUpvoteCount] = useState(project.upvotes || 0)
    const [upvoting, setUpvoting] = useState(false)

    useEffect(() => {
        const checkUpvoteStatus = async () => {
            const { checkUserUpvote } = await import('@/actions/(main)/projects/project-ideas.action')
            const result = await checkUserUpvote(project.id)
            if (result.success) {
                setUpvoted(result.upvoted || false)
            }
        }
        checkUpvoteStatus()
    }, [project.id])

    const handleUpvote = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setUpvoting(true)
        const { toggleProjectUpvote } = await import('@/actions/(main)/projects/project-ideas.action')
        const result = await toggleProjectUpvote(project.id)

        if (result.success) {
            setUpvoted(result.upvoted || false)
            setUpvoteCount((prev: number) => result.upvoted ? prev + 1 : prev - 1)
            toast.success(result.message)
        } else {
            toast.error(result.error || 'Failed to upvote')
        }
        setUpvoting(false)
    }

    const handleBuildOwn = async () => {
        const { incrementProjectView } = await import('@/actions/(main)/projects/project-ideas.action')
        await incrementProjectView(project.id)
        const params = new URLSearchParams({
            title: project.projectTitle,
            description: project.projectDescription,
            type: project.generationType,
            difficulty: project.difficulty,
        })
        router.push(`/projects/generate?${params.toString()}`)
    }

    const getDifficultyStyle = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            case 'INTERMEDIATE':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            case 'ADVANCED':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800'
            default:
                return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
                group flex flex-col justify-between
                bg-white dark:bg-neutral-900 
                shadow-2xl rounded-xl p-8 
                border border-neutral-100 dark:border-neutral-800 
                hover:border-neutral-300 dark:hover:border-neutral-600
                hover:-translate-y-1 hover:shadow-3xl
                transition-all duration-300 ease-out
                ${isTopProject ? 'ring-1 ring-neutral-200 dark:ring-neutral-700' : ''}
            `}
        >
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-2">
                        <Badge className={`${getDifficultyStyle(project.difficulty)} border px-2.5 py-0.5 rounded-md font-medium`}>
                            {project.difficulty}
                        </Badge>
                        {
                            isTopProject && (
                                <Badge className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-0 px-2.5 py-0.5 rounded-md">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Hot
                                </Badge>
                            )
                        }
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-500">
                        <div className="flex items-center gap-1.5" title="Views">
                            <Eye className="w-3.5 h-3.5" />
                            <span className="font-mono">{project.views || 0}</span>
                        </div>
                        <button
                            onClick={handleUpvote}
                            disabled={upvoting}
                            className={`flex items-center gap-1.5 transition-colors duration-200 ${upvoted ? 'text-rose-500' : 'hover:text-rose-500'}`}
                            title="Upvote"
                        >
                            <Heart className={`w-3.5 h-3.5 ${upvoted ? 'fill-current' : ''}`} />
                            <span className="font-mono">{upvoteCount}</span>
                        </button>
                    </div>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.projectTitle}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 line-clamp-3 leading-relaxed">
                    {project.projectDescription}
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                    {
                        project.technologies.slice(0, 3).map((tech: string) => (
                            <div key={tech} className="px-2 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                {tech}
                            </div>
                        ))
                    }
                    {
                        project.technologies.length > 3 && (
                            <span className="px-2 py-1 text-xs text-neutral-400">+{project.technologies.length - 3} more</span>
                        )
                    }
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <Button
                    onClick={handleBuildOwn}
                    className="h-10 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 font-medium text-sm transition-all"
                >
                    <Code2 className="w-4 h-4 mr-2" />
                    Build Now
                </Button>
                <Button
                    onClick={() => toast.info('Starting project...')}
                    variant="outline"
                    className="h-10 rounded-lg border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-sm"
                >
                    <Play className="w-4 h-4 mr-2" />
                    Preview
                </Button>
            </div>
        </motion.div>
    )
}