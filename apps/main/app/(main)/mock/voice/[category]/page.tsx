'use client'

import { useState, useEffect, use, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    ArrowLeft, Filter, Plus, Sparkles
} from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'
import { MockInterviewCard } from '../../_components/mock-interview-card'
import { MockCardSkeleton } from '../../_components/mock-card-skeleton'
import { CreateMockSheet } from '../../_components/create-mock-sheet'
import { PurchaseMockSheet } from '../../_components/purchase-mock-sheet'
import { getAllPublicMocks } from '@/actions/(main)/mockvoice/voice.action'
import { MOCK_CATEGORIES, MOCK_LEVELS } from '../_constants/mock-categories'
import { MockCategory } from '@repo/prisma/client'

interface MockData {
    id: string
    title: string
    description: string
    category: string
    level: string
    duration: number
    creditsRequired: number
    popularity?: number
    isPublic?: boolean
    byAdmin?: boolean
    isFeatured?: boolean
    questionsCount?: number
    createdBy?: {
        id?: string | null
        username?: string | null
        name?: string | null
        image?: string | null
    } | null
    totalSessions?: number
    averageRating?: number | null
    tags?: string[]
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const resolvedParams = use(params)
    const { user, credits } = useUserStore()
    const [levelFilter, setLevelFilter] = useState<string>('ALL')
    const [sortBy, setSortBy] = useState<'popularity' | 'duration' | 'credits'>('popularity')
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [purchaseSheetOpen, setPurchaseSheetOpen] = useState(false)
    const [selectedMock, setSelectedMock] = useState<MockData | null>(null)

    // Data states
    const [mocks, setMocks] = useState<MockData[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const category = resolvedParams.category.toUpperCase() as MockCategory
    const categoryInfo = MOCK_CATEGORIES.find(c => c.value === category)
    const userCredits = credits || 0

    // Fetch mocks from database
    const fetchMocks = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getAllPublicMocks({
                category: category,
                level: levelFilter !== 'ALL' ? levelFilter : undefined,
                page,
                limit: 12
            })

            if (result.success && result.mocks) {
                // Transform the data to match MockData interface
                const transformedMocks: MockData[] = result.mocks.map(mock => ({
                    id: mock.id,
                    title: mock.title,
                    description: mock.description,
                    category: mock.category,
                    level: mock.level,
                    duration: mock.duration,
                    creditsRequired: mock.creditsRequired,
                    popularity: mock.popularity,
                    isPublic: mock.isPublic,
                    byAdmin: mock.byAdmin,
                    isFeatured: mock.isFeatured,
                    questionsCount: mock.questionsCount,
                    totalSessions: mock.totalSessions,
                    averageRating: mock.averageRating,
                    tags: mock.tags,
                    createdBy: mock.createdBy
                }))
                setMocks(transformedMocks)
                setTotalPages(result.totalPages || 1)
            }
        } catch (error) {
            console.error('Error fetching mocks:', error)
        } finally {
            setLoading(false)
        }
    }, [category, levelFilter, page])

    useEffect(() => {
        if (categoryInfo) {
            fetchMocks()
        }
    }, [fetchMocks, categoryInfo])

    // Apply client-side sorting
    const sortedMocks = [...mocks].sort((a, b) => {
        switch (sortBy) {
            case 'popularity':
                return (b.popularity || 0) - (a.popularity || 0)
            case 'duration':
                return a.duration - b.duration
            case 'credits':
                return a.creditsRequired - b.creditsRequired
            default:
                return 0
        }
    })

    const handleStartMock = (mockId: string) => {
        const mock = mocks.find(m => m.id === mockId)
        if (mock) {
            setSelectedMock(mock)
            setPurchaseSheetOpen(true)
        }
    }

    const handleScheduleMock = (mockId: string) => {
        const mock = mocks.find(m => m.id === mockId)
        if (mock) {
            setSelectedMock(mock)
            setPurchaseSheetOpen(true)
        }
    }

    if (!categoryInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
                    <Link href="/mock/voice">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Voice Mocks
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/mock/voice">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to All Mocks
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl">{categoryInfo.icon}</span>
                        <div>
                            <h1 className="text-4xl font-bold">{categoryInfo.label} Mocks</h1>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                {loading ? 'Loading...' : `${sortedMocks.length} mock interviews available`}
                            </p>
                        </div>
                    </div>
                    {
                        user && (
                            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <span>Available Credits: <span className="font-semibold text-neutral-900 dark:text-white">{userCredits}</span></span>
                            </div>
                        )
                    }
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-neutral-100 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        <span className="font-semibold">Filters:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="flex-1">
                            <Select
                                value={levelFilter}
                                onValueChange={(value) => {
                                    setLevelFilter(value)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Experience Level" />
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
                        </div>
                        <div className="flex-1">
                            <Select
                                value={sortBy}
                                onValueChange={(value: 'popularity' | 'duration' | 'credits') => setSortBy(value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popularity">Most Popular</SelectItem>
                                    <SelectItem value="duration">Shortest First</SelectItem>
                                    <SelectItem value="credits">Lowest Credits</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={() => setCreateSheetOpen(true)}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                            <Plus className="w-4 h-4" />
                            Create Custom
                        </Button>
                    </div>
                </div>
                {
                    loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {
                                [...Array(6)].map((_, i) => (
                                    <MockCardSkeleton key={i} />
                                ))
                            }
                        </div>
                    ) : sortedMocks.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h2 className="text-2xl font-bold mb-2">No Mocks Found</h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                Try adjusting your filters or create a custom mock
                            </p>
                            <Button onClick={() => setCreateSheetOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Custom Mock
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Showing {sortedMocks.length} {sortedMocks.length === 1 ? 'result' : 'results'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {
                                        levelFilter !== 'ALL' && (
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer"
                                                onClick={() => setLevelFilter('ALL')}
                                            >
                                                {MOCK_LEVELS.find(l => l.value === levelFilter)?.label} ✕
                                            </Badge>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {
                                    sortedMocks.map((mock, index) => (
                                        <motion.div
                                            key={mock.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <MockInterviewCard
                                                mock={mock}
                                                onStart={handleStartMock}
                                                onSchedule={handleScheduleMock}
                                            />
                                        </motion.div>
                                    ))
                                }
                            </div>

                            {
                                totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <span className="flex items-center px-4 text-sm text-neutral-600 dark:text-neutral-400">
                                            Page {page} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            disabled={page === totalPages}
                                            onClick={() => setPage(p => p + 1)}
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
            <CreateMockSheet
                isOpen={createSheetOpen}
                onClose={() => setCreateSheetOpen(false)}
                userCredits={userCredits}
            />
            <PurchaseMockSheet
                isOpen={purchaseSheetOpen}
                onClose={() => setPurchaseSheetOpen(false)}
                mock={selectedMock}
                userCredits={userCredits}
            />
        </main>
    )
}