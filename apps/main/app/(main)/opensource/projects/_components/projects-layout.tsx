'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    ArrowRight, Code, Filter, FolderOpen, Gift, GitBranch, GitPullRequest,
    Loader2, Search, Star, Users, DollarSign, X, BookOpen, GraduationCap,
    Trophy
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Input } from '@repo/ui/components/ui/input'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from "@repo/ui/components/ui/sheet"
import { cn } from '@repo/ui/lib/utils'
import { useUserStore } from '@/app/store/useUserStore'
import { getProjects, DIFFICULTY_LEVELS } from '@/actions/(main)/opensource'
import { OSIssueDifficulty } from '@prisma/client'

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
    totalBudget: number
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

const NAV_ITEMS = [
    { href: '/opensource/projects/free', label: 'Free Projects', icon: Gift, type: 'FREE' },
    { href: '/opensource/projects/paid', label: 'Paid Projects', icon: DollarSign, type: 'PAID' },
    { href: '/opensource/projects/exclusive', label: 'Exclusive', icon: Star, type: 'EXCLUSIVE' },
]

// All technologies for filtering
const TECHNOLOGIES = [
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
    'Go', 'Rust', 'Java', 'C++', 'Vue.js', 'Angular', 'Svelte',
    'TailwindCSS', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes'
]

export default function ProjectsLayout({ children, type }: { children?: React.ReactNode, type: 'FREE' | 'PAID' | 'EXCLUSIVE' }) {
    const pathname = usePathname()
    const { user } = useUserStore()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
    const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
    const [hasOpenIssues, setHasOpenIssues] = useState(false)

    const fetchProjects = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getProjects({
                type: type,
                difficulty: selectedDifficulty as OSIssueDifficulty | 'ALL',
                search: searchQuery || undefined,
            })

            if (result.success && result.projects) {
                let filtered = Array.isArray(result.projects) ? result.projects as Project[] : []

                // Filter by technologies
                if (selectedTechnologies.length > 0) {
                    filtered = filtered.filter(p =>
                        selectedTechnologies.some(tech =>
                            (Array.isArray(p.technologies) ? p.technologies : []).map(t => t.toLowerCase()).includes(tech.toLowerCase())
                        )
                    )
                }

                // Filter by open issues
                if (hasOpenIssues) {
                    filtered = filtered.filter(p => p.openIssues > 0)
                }

                setProjects(filtered)
            }
        } catch (error) {
            console.error('Error fetching projects:', error)
        } finally {
            setLoading(false)
        }
    }, [type, selectedDifficulty, searchQuery, selectedTechnologies, hasOpenIssues])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    const clearFilters = () => {
        setSelectedDifficulty('ALL')
        setSelectedTechnologies([])
        setHasOpenIssues(false)
        setSearchQuery('')
    }

    const hasActiveFilters = selectedDifficulty !== 'ALL' || selectedTechnologies.length > 0 || hasOpenIssues

    const typeConfig = {
        FREE: {
            title: 'Free Projects',
            description: 'Community-driven open source projects. Start contributing today!',
            icon: Gift,
            gradient: 'from-green-600/10 via-transparent to-emerald-600/10'
        },
        PAID: {
            title: 'Paid Projects',
            description: 'Earn bounties by solving issues. Get paid for your contributions!',
            icon: DollarSign,
            gradient: 'from-amber-600/10 via-transparent to-orange-600/10'
        },
        EXCLUSIVE: {
            title: 'Exclusive Projects',
            description: 'Premium projects from partner companies. Exclusive opportunities!',
            icon: Star,
            gradient: 'from-purple-600/10 via-transparent to-pink-600/10'
        }
    }

    const config = typeConfig[type]
    const TypeIcon = config.icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className={cn("relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800")}>
                <div className={cn("absolute inset-0 bg-gradient-to-r", config.gradient)} />
                <div className="max-w-7xl mx-auto px-4 py-8 relative">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/opensource" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                            ← Back to Open Source
                        </Link>
                    </div>
                    <div className="flex items-start justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("p-3 rounded-xl", typeColors[type].bg)}>
                                    <TypeIcon className={cn("w-6 h-6", typeColors[type].text)} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {config.title}
                                    </h1>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        {config.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/opensource/learn">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    Learning Path
                                </Button>
                            </Link>
                            <Link href="/opensource/mycontributions">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Trophy className="w-4 h-4" />
                                    My Contributions
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-6">
                        {
                            NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={isActive ? "default" : "ghost"}
                                            size="sm"
                                            className={cn(
                                                "gap-2",
                                                isActive && typeColors[item.type].bg,
                                                isActive && typeColors[item.type].text
                                            )}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            Filters
                                        </h3>
                                        {
                                            hasActiveFilters && (
                                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                                                    Clear all
                                                </Button>
                                            )
                                        }
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-sm font-medium mb-2 block">Difficulty</label>
                                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All Difficulties" />
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
                                    <div className="mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="openIssues"
                                                checked={hasOpenIssues}
                                                onCheckedChange={(checked) => setHasOpenIssues(checked as boolean)}
                                            />
                                            <label htmlFor="openIssues" className="text-sm cursor-pointer">
                                                Has open issues
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Technologies</label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {
                                                TECHNOLOGIES.map((tech) => (
                                                    <div key={tech} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={tech}
                                                            checked={selectedTechnologies.includes(tech)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedTechnologies([...selectedTechnologies, tech])
                                                                } else {
                                                                    setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech))
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor={tech} className="text-sm cursor-pointer">
                                                            {tech}
                                                        </label>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-3">Quick Links</h3>
                                    <div className="space-y-2">
                                        <Link href="/opensource/learn" className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                            <BookOpen className="w-4 h-4" />
                                            Get Certified
                                        </Link>
                                        <Link href="/opensource/exam" className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                            <GraduationCap className="w-4 h-4" />
                                            Take Exam
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="lg:hidden">
                                        <Filter className="w-4 h-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader>
                                        <SheetTitle>Filters</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Difficulty</label>
                                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All Difficulties" />
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
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="openIssuesMobile"
                                                checked={hasOpenIssues}
                                                onCheckedChange={(checked) => setHasOpenIssues(checked as boolean)}
                                            />
                                            <label htmlFor="openIssuesMobile" className="text-sm">
                                                Has open issues
                                            </label>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                        {
                            hasActiveFilters && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {
                                        selectedDifficulty !== 'ALL' && (
                                            <Badge variant="secondary" className="gap-1">
                                                {DIFFICULTY_LEVELS.find(d => d.value === selectedDifficulty)?.label}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDifficulty('ALL')} />
                                            </Badge>
                                        )
                                    }
                                    {
                                        selectedTechnologies.map(tech => (
                                            <Badge key={tech} variant="secondary" className="gap-1">
                                                {tech}
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech))} />
                                            </Badge>
                                        ))
                                    }
                                    {
                                        hasOpenIssues && (
                                            <Badge variant="secondary" className="gap-1">
                                                Has open issues
                                                <X className="w-3 h-3 cursor-pointer" onClick={() => setHasOpenIssues(false)} />
                                            </Badge>
                                        )
                                    }
                                </div>
                            )
                        }
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {projects.length} project{projects.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        {
                            loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                                </div>
                            ) : projects.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <FolderOpen className="w-12 h-12 text-neutral-400 mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-4">
                                            {hasActiveFilters ? 'Try adjusting your filters' : 'Projects will be added soon!'}
                                        </p>
                                        {
                                            hasActiveFilters && (
                                                <Button variant="outline" onClick={clearFilters}>
                                                    Clear Filters
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
                                                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                                    <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-green-600 transition-colors">
                                                                                        {project.title}
                                                                                    </h3>
                                                                                    <Badge className={cn("text-xs", typeColors[project.type].bg, typeColors[project.type].text)}>
                                                                                        {project.type}
                                                                                    </Badge>
                                                                                    {
                                                                                        project.type === 'PAID' && project.totalBudget > 0 && (
                                                                                            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">
                                                                                                ${project.totalBudget} bounty
                                                                                            </Badge>
                                                                                        )
                                                                                    }
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        {project.difficulty.replace('_', ' ')}
                                                                                    </Badge>
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
                                                                                <span>{project.openIssues} open</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Users className="w-4 h-4" />
                                                                                <span>{project.totalContributors}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <Star className="w-4 h-4" />
                                                                                <span>{project.stars}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1">
                                                                                <GitBranch className="w-4 h-4" />
                                                                                <span>{project.forks}</span>
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