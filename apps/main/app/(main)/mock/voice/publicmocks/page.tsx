'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@repo/ui/components/ui/select'
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink,
    PaginationNext, PaginationPrevious
} from '@/components/ui/pagination'
import {
    ArrowLeft, Search, Plus, Brain, ChevronRight, Target, Shield, Sparkles
} from 'lucide-react'
import { MockInterviewCard } from '../../_components/mock-interview-card'
import { MockCardSkeleton } from '../../_components/mock-card-skeleton'
import { CreateMockSheet } from '../../_components/create-mock-sheet'
import { PurchaseMockSheet } from '../../_components/purchase-mock-sheet'
import { useUserStore } from '@/app/store/useUserStore'
import { getAllPublicMocks } from '@/actions/(main)/mockvoice/voice.action'
import { MOCK_CATEGORIES, MOCK_LEVELS } from '../_constants/mock-categories'
import { cn } from '@repo/ui/lib/utils'

export default function PublicMocksPage() {
    const { credits } = useUserStore()
    const [mocks, setMocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    // Filters
    const [activeCategory, setActiveCategory] = useState<string>('ALL')
    const [levelFilter, setLevelFilter] = useState<string>('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    // Sheets
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [purchaseSheetOpen, setPurchaseSheetOpen] = useState(false)
    const [selectedMock, setSelectedMock] = useState<any>(null)

    const loadMocks = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getAllPublicMocks({
                page: currentPage,
                limit: 12,
                category: activeCategory !== 'ALL' ? activeCategory : undefined,
                level: levelFilter !== 'ALL' ? levelFilter : undefined,
                search: searchQuery || undefined
            })

            if (result.success) {
                setMocks(result.mocks || [])
                setTotalPages(result.totalPages || 1)
                setTotal(result.total || 0)
            }
        } catch (error) {
            console.error('Error loading mocks:', error)
        } finally {
            setLoading(false)
        }
    }, [currentPage, activeCategory, levelFilter, searchQuery])

    useEffect(() => {
        loadMocks()
    }, [loadMocks])

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [activeCategory, levelFilter, searchQuery])

    const handleStartMock = (mockId: string) => {
        const mock = mocks.find(m => m.id === mockId)
        if (mock) {
            setSelectedMock(mock)
            setPurchaseSheetOpen(true)
        }
    }

    const handleScheduleMock = (mockId: string) => {
        handleStartMock(mockId)
    }

    const categoryInfo = MOCK_CATEGORIES.find(c => c.value === activeCategory)

    return (
        <main className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link href="/mock/voice">
                        <Button variant="ghost" className="mb-4">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Voice Mocks
                        </Button>
                    </Link>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">
                                Public Mock Interviews
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Explore {total} mock interviews from our library and community
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/mock/voice/mymocks">
                                <Button variant="outline" className="border-neutral-300 dark:border-neutral-700">
                                    My Mocks
                                </Button>
                            </Link>
                            <Button
                                onClick={() => setCreateSheetOpen(true)}
                                className="bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your Own
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/3">
                        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sticky top-4">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Categories
                            </h3>
                            <ScrollArea className="h-auto lg:max-h-[400px]">
                                <div className="space-y-1">
                                    {
                                        MOCK_CATEGORIES.map((category) => (
                                            <button
                                                key={category.value}
                                                onClick={() => setActiveCategory(category.value)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all",
                                                    activeCategory === category.value
                                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                                                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                                )}
                                            >
                                                <span className="text-lg">{category.icon}</span>
                                                <span className="font-medium">{category.label}</span>
                                                <ChevronRight className={cn(
                                                    "w-4 h-4 ml-auto transition-transform",
                                                    activeCategory === category.value && "rotate-90"
                                                )} />
                                            </button>
                                        ))
                                    }
                                </div>
                            </ScrollArea>
                            <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                <h4 className="font-medium text-neutral-900 dark:text-white mb-3 text-sm">
                                    Difficulty Level
                                </h4>
                                <Select value={levelFilter} onValueChange={setLevelFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
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
                        </div>
                    </div>
                    <div className="lg:w-2/3">
                        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <Input
                                    placeholder="Search by title or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{categoryInfo?.icon}</span>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {categoryInfo?.label || 'All'} Mocks
                                </h3>
                                <Badge variant="secondary" className="ml-2">
                                    {total} found
                                </Badge>
                            </div>
                        </div>
                        <AnimatePresence mode="wait">
                            {
                                loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="grid md:grid-cols-2 gap-4"
                                    >
                                        {
                                            [...Array(6)].map((_, i) => (
                                                <MockCardSkeleton key={i} />
                                            ))
                                        }
                                    </motion.div>
                                ) : mocks.length === 0 ? (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                                    >
                                        <Brain className="w-16 h-16 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
                                        <h4 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                            {searchQuery || levelFilter !== 'ALL' || activeCategory !== 'ALL'
                                                ? 'No Mocks Found'
                                                : 'No Public Mocks Yet'}
                                        </h4>
                                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                            {searchQuery || levelFilter !== 'ALL' || activeCategory !== 'ALL'
                                                ? 'Try adjusting your filters or search query'
                                                : 'Be the first to create a public mock interview!'}
                                        </p>
                                        <div className="flex gap-3 justify-center">
                                            <Button onClick={() => setCreateSheetOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Public Mock
                                            </Button>
                                            {
                                                (searchQuery || levelFilter !== 'ALL' || activeCategory !== 'ALL') && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSearchQuery('')
                                                            setLevelFilter('ALL')
                                                            setActiveCategory('ALL')
                                                        }}
                                                    >
                                                        Clear Filters
                                                    </Button>
                                                )
                                            }
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={`${activeCategory}-${levelFilter}-${currentPage}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                                            {
                                                mocks.map((mock, index) => (
                                                    <motion.div
                                                        key={mock.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <MockInterviewCard
                                                            mock={mock}
                                                            onStart={handleStartMock}
                                                            onSchedule={handleScheduleMock}
                                                            showAdminBadge={mock.byAdmin}
                                                        />
                                                    </motion.div>
                                                ))
                                            }
                                        </div>

                                        {
                                            totalPages > 1 && (
                                                <Pagination>
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                            />
                                                        </PaginationItem>
                                                        {
                                                            [...Array(Math.min(5, totalPages))].map((_, i) => {
                                                                const page = i + 1
                                                                return (
                                                                    <PaginationItem key={page}>
                                                                        <PaginationLink
                                                                            onClick={() => setCurrentPage(page)}
                                                                            isActive={currentPage === page}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            {page}
                                                                        </PaginationLink>
                                                                    </PaginationItem>
                                                                )
                                                            })
                                                        }
                                                        {
                                                            totalPages > 5 && (
                                                                <PaginationItem>
                                                                    <span className="px-2">...</span>
                                                                </PaginationItem>
                                                            )
                                                        }
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            )
                                        }
                                    </motion.div>
                                )
                            }
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <CreateMockSheet
                isOpen={createSheetOpen}
                onClose={() => setCreateSheetOpen(false)}
                userCredits={credits}
            />
            <PurchaseMockSheet
                isOpen={purchaseSheetOpen}
                onClose={() => setPurchaseSheetOpen(false)}
                mock={selectedMock}
                userCredits={credits}
            />
        </main>
    )
}