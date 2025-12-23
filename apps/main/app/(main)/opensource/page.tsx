'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowRight, BookOpen, Building2, CheckCircle, Code, DollarSign, Filter,
    FolderOpen, Gift, GitBranch, GitPullRequest, GraduationCap, Loader2, Lock,
    Search, Star, Target, Trophy, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { cn } from '../../lib/utils'
import { useUserStore } from '@/app/store/useUserStore'
import {
    getProjects, getUserCertificationStatus, PROJECT_TYPES, DIFFICULTY_LEVELS,
    getLearningProgress
} from '@/actions/(main)/opensource'
import { OSProjectType, OSIssueDifficulty } from '@prisma/client'

// Project type icons
const typeIcons: Record<string, React.ReactNode> = {
    FREE: <Gift className="w-4 h-4" />,
    PAID: <DollarSign className="w-4 h-4" />,
    EXCLUSIVE: <Star className="w-4 h-4" />,
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
    FREE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    PAID: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    EXCLUSIVE: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
}

const difficultyColors: Record<string, string> = {
    GOOD_FIRST_ISSUE: 'bg-green-500',
    EASY: 'bg-emerald-500',
    MEDIUM: 'bg-yellow-500',
    HARD: 'bg-red-500',
    EXPERT: 'bg-purple-500',
}

interface Project {
    id: string
    title: string
    slug: string
    description: string
    type: 'FREE' | 'PAID' | 'EXCLUSIVE'
    status: string
    difficulty: string
    githubOwner: string
    githubRepo: string
    technologies: string[]
    totalBounty: number
    openIssues: number
    totalContributors: number
    stars: number
    forks: number
    maintainer: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
}

export default function OpenSourcePage() {
    const { user } = useUserStore()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedType, setSelectedType] = useState<string>('ALL')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCertified, setIsCertified] = useState(false)
    const [learningProgress, setLearningProgress] = useState(0)

    // Fetch projects
    const fetchProjects = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getProjects({
                type: selectedType as OSProjectType | 'ALL',
                difficulty: selectedDifficulty as OSIssueDifficulty | 'ALL',
                search: searchQuery || undefined,
            })

            if (result.success && result.projects) {
                setProjects(Array.isArray(result.projects) ? result.projects as Project[] : [])
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedType, selectedDifficulty, searchQuery])

    // Fetch certification status
    useEffect(() => {
        async function fetchStatus() {
            if (!user) return

            try {
                const [certResult, progressResult] = await Promise.all([
                    getUserCertificationStatus(),
                    getLearningProgress()
                ])

                if (certResult.success) {
                    setIsCertified(certResult.isCertified || false)
                }

                if (progressResult.success && Array.isArray(progressResult.data)) {
                    // Calculate overall progress
                    const totalModules = 5
                    const completedModules = progressResult.data.filter((p: { status: string }) => {
                        return p.status === 'COMPLETED'
                    }).length
                    setLearningProgress(Math.round((completedModules / totalModules) * 100))
                }
            } catch (error) {
                console.error('Error fetching status:', error)
            }
        }

        fetchStatus()
    }, [user])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    // Helper to get lesson count per module
    function getLessonCount(moduleId: string): number {
        const counts: Record<string, number> = {
            'git-basics': 6,
            'github-essentials': 5,
            'first-contribution': 5,
            'code-review': 5,
            'advanced-git': 5,
        }
        return counts[moduleId] || 5
    }

    const stats = [
        { icon: <Users className="w-5 h-5" />, value: '500+', label: 'Contributors' },
        { icon: <GitPullRequest className="w-5 h-5" />, value: '2.5K+', label: 'PRs Merged' },
        { icon: <DollarSign className="w-5 h-5" />, value: '$25K+', label: 'Bounties Paid' },
        { icon: <Building2 className="w-5 h-5" />, value: '15+', label: 'Company Partners' },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-transparent to-purple-600/5" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />

                <div className="max-w-7xl mx-auto px-4 py-12 relative">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl"
                        >
                            <Badge className="mb-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <GitBranch className="w-3 h-3 mr-1" />
                                Open Source Hub
                            </Badge>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                                Stop faking{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                                    open source contributions
                                </span>
                            </h1>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                                Real projects, real impact, real money. We've made it embarrassingly easy to contribute
                                to open source - unless you're still updating READMEs and calling it "contribution."
                                <span className="text-neutral-900 dark:text-white font-medium"> No shade, but also... a little shade.</span>
                            </p>
                            <div className="grid grid-cols-4 gap-4">
                                {
                                    stats.map((stat, i) => (
                                        <div key={i} className="text-center">
                                            <div className="flex items-center justify-center text-green-600 dark:text-green-400 mb-1">
                                                {stat.icon}
                                            </div>
                                            <p className="text-xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                                            <p className="text-xs text-neutral-500">{stat.label}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="w-80 border-2 border-neutral-200 dark:border-neutral-800">
                                <CardContent className="p-5">
                                    {
                                        !user ? (
                                            <div className="text-center py-4">
                                                <Lock className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                                    Sign in to start contributing
                                                </p>
                                                <Link href="/login">
                                                    <Button className="w-full">Sign In</Button>
                                                </Link>
                                            </div>
                                        ) : isCertified ? (
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white">Certified!</h3>
                                                        <p className="text-sm text-green-600">Ready to contribute</p>
                                                    </div>
                                                </div>
                                                <Link href="/opensource/my-contributions">
                                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
                                                        <Target className="w-4 h-4" />
                                                        My Contributions
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                                        <GraduationCap className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white">Get Certified</h3>
                                                        <p className="text-sm text-neutral-500">Complete the learning path</p>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                                                        <span className="font-medium">{learningProgress}%</span>
                                                    </div>
                                                    <Progress value={learningProgress} className="h-2" />
                                                </div>
                                                <Link href="/opensource/learn">
                                                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                                                        <BookOpen className="w-4 h-4" />
                                                        {learningProgress > 0 ? 'Continue Learning' : 'Start Learning'}
                                                    </Button>
                                                </Link>
                                            </div>
                                        )
                                    }
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-6">
                    <div className="w-72 flex-shrink-0">
                        <div className="sticky top-24">
                            <Card className="border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-green-600" />
                                        Browse Projects
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-1">
                                        {
                                            PROJECT_TYPES.map((type) => {
                                                const isActive = selectedType === type.value
                                                const colors = typeColors[type.value] || { bg: '', text: '', border: '' }

                                                return (
                                                    <button
                                                        key={type.value}
                                                        onClick={() => setSelectedType(type.value)}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all",
                                                            isActive
                                                                ? `${colors.bg} ${colors.text} font-medium`
                                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-lg">{type.icon}</span>
                                                            <span className="text-sm">{type.label}</span>
                                                        </div>
                                                    </button>
                                                )
                                            })
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="mt-4 border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-1">
                                    <Link href="/opensource/learn" className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
                                        <GraduationCap className="w-4 h-4 text-purple-600" />
                                        Learning Path
                                    </Link>
                                    <Link href="/opensource/my-contributions" className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
                                        <Target className="w-4 h-4 text-green-600" />
                                        My Contributions
                                    </Link>
                                    <Link href="/opensource/leaderboard" className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300">
                                        <Trophy className="w-4 h-4 text-amber-600" />
                                        Leaderboard
                                    </Link>
                                </CardContent>
                            </Card>
                            <Card className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-5 h-5 text-amber-600" />
                                        <span className="font-semibold text-amber-900 dark:text-amber-200">For Companies</span>
                                    </div>
                                    <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                                        Get your features built by skilled developers. Pay per contribution.
                                    </p>
                                    <Button size="sm" variant="outline" className="w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                                        Submit a Project
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search projects by name, technology..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                />
                            </div>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger className="w-[160px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        DIFFICULTY_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    {typeIcons[selectedType] || <FolderOpen className="w-5 h-5" />}
                                    {PROJECT_TYPES.find(t => t.value === selectedType)?.label || 'All Projects'}
                                </h2>
                                {
                                    selectedType !== 'ALL' && (
                                        <p className="text-sm text-neutral-500">
                                            {(PROJECT_TYPES.find(t => t.value === selectedType) as { description?: string })?.description || ''}
                                        </p>
                                    )
                                }
                            </div>
                            <Badge variant="secondary">
                                {projects.length} projects
                            </Badge>
                        </div>
                        {
                            loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
                                        <p className="text-neutral-600 dark:text-neutral-400">Loading projects...</p>
                                    </div>
                                </div>
                            ) : projects.length === 0 ? (
                                <Card className="border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                            <FolderOpen className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                            No projects found
                                        </h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-6 max-w-sm">
                                            {
                                                searchQuery
                                                    ? 'Try adjusting your search or filters'
                                                    : 'Projects are being added. Check back soon!'
                                            }
                                        </p>
                                        {
                                            searchQuery && (
                                                <Button variant="outline" onClick={() => setSearchQuery('')}>
                                                    Clear Search
                                                </Button>
                                            )
                                        }
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    <AnimatePresence mode="wait">
                                        {
                                            projects.map((project, index) => (
                                                <motion.div
                                                    key={project.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <Link href={`/opensource/${project.slug}`}>
                                                        <Card className="group hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all cursor-pointer">
                                                            <CardContent className="p-5">
                                                                <div className="flex items-start gap-4">
                                                                    <div className={cn(
                                                                        "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                                                                        typeColors[project.type].bg
                                                                    )}>
                                                                        <Code className={cn("w-7 h-7", typeColors[project.type].text)} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <div>
                                                                                <div className="flex items-center gap-2 mb-1">
                                                                                    <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                                                        {project.title}
                                                                                    </h3>
                                                                                    <Badge className={cn("text-xs", typeColors[project.type].bg, typeColors[project.type].text)}>
                                                                                        {project.type}
                                                                                    </Badge>
                                                                                    {
                                                                                        project.type === 'PAID' && project.totalBounty > 0 && (
                                                                                            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">
                                                                                                ${project.totalBounty} bounty
                                                                                            </Badge>
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                                                                                    {project.description}
                                                                                </p>
                                                                            </div>
                                                                            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                                            {
                                                                                (Array.isArray(project.technologies) ? project.technologies : []).slice(0, 5).map((tech) => (
                                                                                    <Badge key={tech} variant="secondary" className="text-xs font-normal">
                                                                                        {tech}
                                                                                    </Badge>
                                                                                ))
                                                                            }
                                                                            {
                                                                                (project.technologies?.length || 0) > 5 && (
                                                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                                                        +{project.technologies.length - 5}
                                                                                    </Badge>
                                                                                )
                                                                            }
                                                                        </div>
                                                                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                                            <div className="flex items-center gap-1">
                                                                                <GitPullRequest className="w-4 h-4" />
                                                                                <span>{project.openIssues} open issues</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Users className="w-4 h-4" />
                                                                                <span>{project.totalContributors} contributors</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Star className="w-4 h-4" />
                                                                                <span>{project.stars}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <GitBranch className="w-4 h-4" />
                                                                                <span>{project.forks} forks</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </Link>
                                                </motion.div>
                                            ))
                                        }
                                    </AnimatePresence>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}