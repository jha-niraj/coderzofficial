'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, Plus, Search, Filter, Target, Sparkles, Star, Briefcase, Users,
    DollarSign, Code, Building2, FileText, MessageSquare, LayoutGrid, List,
    Loader2, FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '../../lib/utils'
import { useUserStore } from '@/app/store/useUserStore'
import { MockInterviewCard } from '../../_components/mock-interview-card'
import { CreateMockSheet } from '../../_components/create-mock-sheet'
import { getCreatedVoiceMocks } from '@/actions/(main)/mockvoice/voice.action'
import { MOCK_CATEGORIES, MOCK_LEVELS } from '../_constants/mock-categories'
import { MockCategory } from '@prisma/client'

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
    ALL: <Target className="w-4 h-4" />,
    TECHNICAL: <Code className="w-4 h-4" />,
    BEHAVIORAL: <Users className="w-4 h-4" />,
    HR: <Briefcase className="w-4 h-4" />,
    SYSTEM_DESIGN: <Building2 className="w-4 h-4" />,
    LEADERSHIP: <Star className="w-4 h-4" />,
    NEGOTIATION: <DollarSign className="w-4 h-4" />,
    CODING: <Code className="w-4 h-4" />,
    CASE_STUDY: <FileText className="w-4 h-4" />,
    GENERAL: <MessageSquare className="w-4 h-4" />,
}

// Types
interface MockInterview {
    id: string
    title: string
    description: string
    category: MockCategory
    level: string
    duration: number
    questionsCount: number
    creditsRequired: number
    tags: string[]
    isPublic: boolean
    byAdmin: boolean
    popularity: number
    totalSessions: number
    averageRating: number | null
    createdAt: Date
}

export default function MyMocksPage() {
    const { user } = useUserStore()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<MockCategory | 'ALL'>('ALL')
    const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [loading, setLoading] = useState(true)
    const [myMocks, setMyMocks] = useState<MockInterview[]>([])

    // Fetch user's created mocks
    const fetchMyMocks = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getCreatedVoiceMocks(
                selectedCategory === 'ALL' ? undefined : selectedCategory,
                100 // Fetch more to filter client-side
            )
            if (result.success && result.mocks) {
                setMyMocks(result.mocks as MockInterview[])
            }
        } catch (error) {
            console.error('Error fetching my mocks:', error)
        } finally {
            setLoading(false)
        }
    }, [selectedCategory])

    useEffect(() => {
        fetchMyMocks()
    }, [fetchMyMocks])

    // Filter mocks based on search and level
    const filteredMocks = myMocks.filter(mock => {
        const matchesSearch = searchQuery === '' ||
            mock.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mock.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mock.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesLevel = selectedLevel === 'ALL' || mock.level === selectedLevel

        return matchesSearch && matchesLevel
    })

    // Group mocks by category for stats
    const categoryStats = myMocks.reduce((acc, mock) => {
        acc[mock.category] = (acc[mock.category] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/mock/voice">
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-purple-600" />
                                    My Mock Interviews
                                </h1>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {myMocks.length} created mocks
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {user?.credits || 0} Credits
                            </Badge>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Create New
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    <div className="w-1/3 min-w-[280px] max-w-[320px]">
                        <div className="sticky top-24">
                            <Card className="border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-purple-600" />
                                        Filter by Category
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Browse your mocks by category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <ScrollArea className="h-[calc(100vh-350px)]">
                                        <div className="space-y-1">
                                            {
                                                MOCK_CATEGORIES.map((category) => {
                                                    const count = category.value === 'ALL'
                                                        ? myMocks.length
                                                        : (categoryStats[category.value] || 0)
                                                    const isActive = selectedCategory === category.value

                                                    return (
                                                        <button
                                                            key={category.value}
                                                            onClick={() => setSelectedCategory(category.value as MockCategory | 'ALL')}
                                                            className={cn(
                                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all",
                                                                isActive
                                                                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="text-lg">{category.icon}</span>
                                                                <span className="text-sm">{category.label}</span>
                                                            </div>
                                                            <Badge
                                                                variant="secondary"
                                                                className={cn(
                                                                    "text-xs min-w-[24px] justify-center",
                                                                    isActive
                                                                        ? "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
                                                                        : "bg-neutral-200 dark:bg-neutral-700"
                                                                )}
                                                            >
                                                                {count}
                                                            </Badge>
                                                        </button>
                                                    )
                                                })
                                            }
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                            <Card className="mt-4 border-neutral-200 dark:border-neutral-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-600 dark:text-neutral-400">Total Mocks</span>
                                        <span className="font-medium">{myMocks.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-600 dark:text-neutral-400">Public</span>
                                        <span className="font-medium">{myMocks.filter(m => m.isPublic).length}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-600 dark:text-neutral-400">Private</span>
                                        <span className="font-medium">{myMocks.filter(m => !m.isPublic).length}</span>
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
                                    placeholder="Search your mocks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                />
                            </div>
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                                    <SelectValue placeholder="Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        MOCK_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={cn(
                                        "p-2 transition-colors",
                                        viewMode === 'grid'
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    )}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "p-2 transition-colors",
                                        viewMode === 'list'
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                {categoryIcons[selectedCategory] || <Target className="w-5 h-5" />}
                                {MOCK_CATEGORIES.find(c => c.value === selectedCategory)?.label || 'All Categories'}
                                <Badge variant="secondary" className="ml-2">
                                    {filteredMocks.length} mocks
                                </Badge>
                            </h2>
                        </div>
                        {
                            loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                                        <p className="text-neutral-600 dark:text-neutral-400">Loading your mocks...</p>
                                    </div>
                                </div>
                            ) : filteredMocks.length === 0 ? (
                                <Card className="border-dashed border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                    <CardContent className="flex flex-col items-center justify-center py-16">
                                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                                            <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                            {searchQuery || selectedLevel !== 'ALL' ? 'No mocks found' : 'No mocks created yet'}
                                        </h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mb-6 max-w-sm">
                                            {searchQuery || selectedLevel !== 'ALL'
                                                ? 'Try adjusting your filters or search query'
                                                : 'Create your first custom mock interview tailored to your needs'}
                                        </p>
                                        {
                                            !searchQuery && selectedLevel === 'ALL' && (
                                                <Button
                                                    onClick={() => setIsCreateOpen(true)}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Create Your First Mock
                                                </Button>
                                            )
                                        }
                                    </CardContent>
                                </Card>
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${selectedCategory}-${viewMode}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={cn(
                                            viewMode === 'grid'
                                                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                                                : "space-y-3"
                                        )}
                                    >
                                        {
                                            filteredMocks.map((mock, index) => (
                                                <motion.div
                                                    key={mock.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <MockInterviewCard
                                                        mock={{
                                                            id: mock.id,
                                                            title: mock.title,
                                                            description: mock.description,
                                                            category: mock.category,
                                                            level: mock.level,
                                                            duration: mock.duration,
                                                            questionsCount: mock.questionsCount,
                                                            creditsRequired: mock.creditsRequired,
                                                            tags: mock.tags,
                                                            isPublic: mock.isPublic,
                                                            byAdmin: mock.byAdmin,
                                                            popularity: mock.popularity,
                                                            totalSessions: mock.totalSessions,
                                                            averageRating: mock.averageRating ?? undefined
                                                        }}
                                                        showAdminBadge={mock.byAdmin}
                                                        variant={viewMode === 'list' ? 'compact' : 'default'}
                                                    />
                                                </motion.div>
                                            ))
                                        }
                                    </motion.div>
                                </AnimatePresence>
                            )
                        }
                    </div>
                </div>
            </div>

            <CreateMockSheet
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                userCredits={user?.credits || 0}
            />
        </div>
    )
}