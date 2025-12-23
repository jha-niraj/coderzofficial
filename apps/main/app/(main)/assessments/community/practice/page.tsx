'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, Filter, Globe, Heart, Loader2, Search, Sparkles, Target, Users, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger
} from '@/components/ui/sheet'
import { cn } from '../../lib/utils'
import {
    getPublicPracticeSets
} from '@/actions/(main)/assessments/user-sets.action'
import { AssessmentLanguage, AssessmentMode, QuestionDifficulty } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import type { PracticeSetPreview } from '@/types/assessment'

// Language configs
const LANGUAGES: Record<string, { label: string; icon: string }> = {
    JAVASCRIPT: { label: 'JavaScript', icon: '🟨' },
    PYTHON: { label: 'Python', icon: '🐍' },
    C: { label: 'C', icon: '🔷' },
    CPP: { label: 'C++', icon: '🔶' },
    REACTJS: { label: 'React.js', icon: '⚛️' },
    TYPESCRIPT: { label: 'TypeScript', icon: '🔵' },
    JAVA: { label: 'Java', icon: '☕' },
    GO: { label: 'Go', icon: '🐹' },
    RUST: { label: 'Rust', icon: '🦀' },
    NODEJS: { label: 'Node.js', icon: '🟩' },
    PHP: { label: 'PHP', icon: '🐘' },
    SWIFT: { label: 'Swift', icon: '🍎' },
    KOTLIN: { label: 'Kotlin', icon: '🎯' },
    RUBY: { label: 'Ruby', icon: '💎' },
    SCALA: { label: 'Scala', icon: '🔴' },
}

const difficultyColors: Record<string, { bg: string; text: string }> = {
    EASY: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    INTERMEDIATE: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    HARD: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
}

type SortBy = 'newest' | 'popular' | 'rating'

export default function CommunityPracticePage() {
    const [practiceSets, setPracticeSets] = useState<PracticeSetPreview[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [language, setLanguage] = useState<AssessmentLanguage | 'ALL'>('ALL')
    const [difficulty, setDifficulty] = useState<QuestionDifficulty | 'ALL'>('ALL')
    const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest')
    const [showFilters, setShowFilters] = useState(false)

    const fetchSets = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getPublicPracticeSets({
                language: language === 'ALL' ? undefined : language,
                difficulty: difficulty === 'ALL' ? undefined : difficulty,
                topic: search || undefined,
                sortBy,
                page,
                limit: 12
            })

            if (result.success && result.data) {
                setPracticeSets(result.data)
                setTotal(result.pagination?.total || 0)
            }
        } catch (error) {
            console.error('Error fetching practice sets:', error)
        } finally {
            setLoading(false)
        }
    }, [language, difficulty, search, sortBy, page])

    useEffect(() => {
        fetchSets()
    }, [fetchSets])

    const clearFilters = () => {
        setLanguage('ALL')
        setDifficulty('ALL')
        setSearch('')
        setSortBy('newest')
    }

    const hasFilters = language !== 'ALL' || difficulty !== 'ALL' || search

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
                <div className="container py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/assessments">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-500" />
                                    Community Practice Sets
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Discover practice sets created by the community
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-[200px]"
                                />
                            </div>
                            <Select value={language} onValueChange={(v) => setLanguage(v as AssessmentLanguage | 'ALL')}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Languages</SelectItem>
                                    {
                                        Object.entries(LANGUAGES).map(([key, lang]) => (
                                            <SelectItem key={key} value={key}>
                                                {lang.icon} {lang.label}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuestionDifficulty | 'ALL')}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Levels</SelectItem>
                                    <SelectItem value="EASY">Easy</SelectItem>
                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                    <SelectItem value="HARD">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Recent</SelectItem>
                                    <SelectItem value="popular">Popular</SelectItem>
                                    <SelectItem value="rating">Most Liked</SelectItem>
                                </SelectContent>
                            </Select>
                            {
                                hasFilters && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        <X className="w-4 h-4 mr-1" />
                                        Clear
                                    </Button>
                                )
                            }
                        </div>
                        <Sheet open={showFilters} onOpenChange={setShowFilters}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="md:hidden gap-2">
                                    <Filter className="w-4 h-4" />
                                    Filters
                                    {
                                        hasFilters && (
                                            <Badge variant="secondary" className="ml-1">
                                                Active
                                            </Badge>
                                        )
                                    }
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom">
                                <SheetHeader>
                                    <SheetTitle>Filter Practice Sets</SheetTitle>
                                </SheetHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Search</label>
                                        <Input
                                            placeholder="Search practice sets..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Language</label>
                                        <Select value={language} onValueChange={(v) => setLanguage(v as AssessmentLanguage | 'ALL')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Languages</SelectItem>
                                                {
                                                    Object.entries(LANGUAGES).map(([key, lang]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {lang.icon} {lang.label}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Difficulty</label>
                                        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as QuestionDifficulty | 'ALL')}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ALL">All Levels</SelectItem>
                                                <SelectItem value="EASY">Easy</SelectItem>
                                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                <SelectItem value="HARD">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Sort By</label>
                                        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="newest">Recent</SelectItem>
                                                <SelectItem value="popular">Popular</SelectItem>
                                                <SelectItem value="rating">Most Liked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button variant="outline" onClick={clearFilters} className="flex-1">
                                            Clear All
                                        </Button>
                                        <Button onClick={() => setShowFilters(false)} className="flex-1">
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
            <div className="container py-8">
                {
                    loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : practiceSets.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No practice sets found</h3>
                            <p className="text-muted-foreground mb-4">
                                {hasFilters
                                    ? 'Try adjusting your filters'
                                    : 'Be the first to create and share a practice set!'}
                            </p>
                            {
                                hasFilters ? (
                                    <Button variant="outline" onClick={clearFilters}>
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <Link href="/assessments/practice/create">
                                        <Button className="gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Create Practice Set
                                        </Button>
                                    </Link>
                                )
                            }
                        </Card>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-muted-foreground">
                                    Showing {practiceSets.length} of {total} practice sets
                                </p>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {
                                    practiceSets.map((set) => (
                                        <PracticeSetCard key={set.id} set={set} />
                                    ))
                                }
                            </div>

                            {
                                total > 12 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => p - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-muted-foreground px-4">
                                            Page {page} of {Math.ceil(total / 12)}
                                        </span>
                                        <Button
                                            variant="outline"
                                            disabled={page >= Math.ceil(total / 12)}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
        </div>
    )
}

function PracticeSetCard({ set }: { set: PracticeSetPreview }) {
    const lang = LANGUAGES[set.language]
    const difficulty = difficultyColors[set.difficulty]

    return (
        <Link href={`/assessments/practice/set/${set.id}`}>
            <Card className="group hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{lang?.icon || '📚'}</span>
                            <Badge variant="outline" className={cn(difficulty.bg, difficulty.text)}>
                                {set.difficulty}
                            </Badge>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                            {set.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {set.description}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                            {set.mode}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Target className="w-4 h-4" />
                            <span>{set.questionCount}q</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" /> {set.likes}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {set.totalAttempts}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                            <AvatarImage src={set.creator.image || undefined} />
                            <AvatarFallback className="text-xs">
                                {set.creator.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                            {set.creator.name || set.creator.username}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                            {formatDistanceToNow(new Date(set.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}