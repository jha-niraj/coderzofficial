'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Brain, Sparkles, TrendingUp, Trophy, Users, Zap, ArrowRight, Plus, Target,
    Clock, Star, Mic, Award, Timer, ChevronRight, Shield, Calendar
} from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'
import { MockInterviewCard } from '../_components/mock-interview-card'
import { MockCardSkeleton } from '../_components/mock-card-skeleton'
import { CreateMockSheet } from '../_components/create-mock-sheet'
import { PurchaseMockSheet } from '../_components/purchase-mock-sheet'
import {
    getAdminMocksByCategory, getFeaturedAdminMocks, getFeaturedPublicMocks
} from '@/actions/(main)/mockvoice/voice.action'
import { MOCK_CATEGORIES } from './_constants/mock-categories'
import { cn } from '@repo/ui/lib/utils'
import { MockCategory } from '@repo/prisma/client'

const stats = [
    { icon: <Users className="w-5 h-5" />, value: '15K+', label: 'Completed', icon2: Trophy },
    { icon: <Star className="w-5 h-5" />, value: '4.9/5', label: 'Avg Rating', icon2: Star },
    { icon: <TrendingUp className="w-5 h-5" />, value: '89%', label: 'Success Rate', icon2: Award },
    { icon: <Clock className="w-5 h-5" />, value: '24/7', label: 'Available', icon2: Timer },
]

const features = [
    {
        icon: <Brain className="w-5 h-5" />,
        title: 'Advanced AI Interviewer',
        description: 'Practice with state-of-the-art AI that adapts to your responses.'
    },
    {
        icon: <Zap className="w-5 h-5" />,
        title: 'Real-Time Feedback',
        description: 'Get instant analysis on communication and technical depth.'
    },
    {
        icon: <Target className="w-5 h-5" />,
        title: 'Customizable Scenarios',
        description: 'Create custom mocks tailored to your target role.'
    },
    {
        icon: <Trophy className="w-5 h-5" />,
        title: 'Progress Tracking',
        description: 'Monitor improvement with detailed performance metrics.'
    },
]

interface MockData {
    id: string
    title: string
    description: string
    category?: string
    level: string
    duration: number
    creditsRequired: number
    questionsCount?: number
    isPublic?: boolean
    byAdmin?: boolean
    isFeatured?: boolean
    createdBy?: {
        id: string | null
        username: string | null
        name: string | null
        image: string | null
    } | null
    popularity?: number
    totalSessions?: number
    averageRating?: number | null
    tags?: string[]
}

export default function VoiceMockInterviewPage() {
    const { credits } = useUserStore()
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [purchaseSheetOpen, setPurchaseSheetOpen] = useState(false)
    const [selectedMock, setSelectedMock] = useState<MockData | null>(null)

    // Tab-based state
    const [activeCategory, setActiveCategory] = useState<string>('ALL')
    const [categoryMocks, setCategoryMocks] = useState<MockData[]>([])
    const [loadingCategory, setLoadingCategory] = useState(true)

    // Featured and community mocks
    const [featuredMocks, setFeaturedMocks] = useState<MockData[]>([])
    const [communityMocks, setCommunityMocks] = useState<MockData[]>([])
    const [, setLoadingFeatured] = useState(true)
    const [loadingCommunity, setLoadingCommunity] = useState(true)

    // Load featured mocks
    useEffect(() => {
        async function loadFeatured() {
            setLoadingFeatured(true)
            try {
                const result = await getFeaturedAdminMocks(6)
                if (result.success) {
                    setFeaturedMocks(result.mocks || [])
                }
            } catch (error) {
                console.error('Error loading featured mocks:', error)
            } finally {
                setLoadingFeatured(false)
            }
        }
        loadFeatured()
    }, [])

    // Load community mocks
    useEffect(() => {
        async function loadCommunity() {
            setLoadingCommunity(true)
            try {
                const result = await getFeaturedPublicMocks(6)
                if (result.success) {
                    setCommunityMocks(result.mocks || [])
                }
            } catch (error) {
                console.error('Error loading community mocks:', error)
            } finally {
                setLoadingCommunity(false)
            }
        }
        loadCommunity()
    }, [])

    // Load mocks by category
    const loadCategoryMocks = useCallback(async (category: string) => {
        setLoadingCategory(true)
        try {
            const result = await getAdminMocksByCategory(category as MockCategory | 'ALL', 6)
            if (result.success) {
                setCategoryMocks(result.mocks || [])
            }
        } catch (error) {
            console.error('Error loading category mocks:', error)
        } finally {
            setLoadingCategory(false)
        }
    }, [])

    useEffect(() => {
        loadCategoryMocks(activeCategory)
    }, [activeCategory, loadCategoryMocks])

    const handleStartMock = (mockId: string) => {
        const mock = categoryMocks.find(m => m.id === mockId) ||
            featuredMocks.find(m => m.id === mockId) ||
            communityMocks.find(m => m.id === mockId)
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
            <section className="relative overflow-hidden py-16 bg-white dark:bg-neutral-950">
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-6">
                    <motion.div
                        className="text-center space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                            <Badge className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 px-4">
                                <Mic className="w-3 h-3 mr-1.5" />
                                AI Voice Interview
                            </Badge>
                        </motion.div>
                        <motion.h1
                            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            Practice with AI.
                            <br />
                            Interview Like a Pro.
                        </motion.h1>
                        <motion.p
                            className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Get real-time voice-based mock interviews powered by advanced AI.
                            Perfect your responses and land your dream job.
                        </motion.p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button
                                size="lg"
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => document.getElementById('mocks-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Browse Mock Interviews
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Custom Mock
                            </Button>
                        </motion.div>
                        <motion.div
                            className="flex flex-wrap gap-3 justify-center pt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Link href="/mock/voice/allmocks">
                                <Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
                                    <Users className="w-4 h-4 mr-2" />
                                    All Mocks
                                </Button>
                            </Link>
                            <Link href="/mock/voice/mysessions">
                                <Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    My Sessions
                                </Button>
                            </Link>
                            <Link href="/mock/voice/mymocks">
                                <Button variant="ghost" size="sm" className="text-neutral-600 dark:text-neutral-400">
                                    <Target className="w-4 h-4 mr-2" />
                                    My Mocks
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
            <section className="py-8 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {
                            stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="text-center"
                                >
                                    <div className="flex justify-center mb-2">
                                        <stat.icon2 className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            {
                communityMocks.length > 0 && (
                    <section className="py-12 bg-white dark:bg-neutral-950">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                                        🌟 Community Mock Interviews
                                    </h2>
                                    <p className="text-neutral-600 dark:text-neutral-400">
                                        Top-rated mocks created by the community (4+ stars)
                                    </p>
                                </div>
                                <Link href="/mock/voice/allmocks">
                                    <Button variant="outline" className="border-neutral-300 dark:border-neutral-700">
                                        View All
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                            {
                                loadingCommunity ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {
                                            [...Array(3)].map((_, i) => (
                                                <MockCardSkeleton key={i} />
                                            ))
                                        }
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {
                                            communityMocks.slice(0, 6).map((mock, index) => (
                                                <motion.div
                                                    key={mock.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    viewport={{ once: true }}
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
                                )
                            }
                        </div>
                    </section>
                )
            }
            <section id="mocks-section" className="py-12 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                                🎤 Mock Interview Library
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Curated by our team to help you ace your interviews
                            </p>
                        </div>
                        <Button
                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                            onClick={() => setCreateSheetOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Custom
                        </Button>
                    </div>
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-1/3">
                            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 sticky top-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Categories
                                </h3>
                                <ScrollArea className="h-auto lg:max-h-[500px]">
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
                            </div>
                        </div>
                        <div className="lg:w-2/3">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{categoryInfo?.icon}</span>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                        {categoryInfo?.label || 'All'} Mocks
                                    </h3>
                                    {
                                        activeCategory !== 'ALL' && (
                                            <Badge variant="secondary" className="ml-2">
                                                <Shield className="w-3 h-3 mr-1" />
                                                By CoderzHub
                                            </Badge>
                                        )
                                    }
                                </div>
                                {
                                    activeCategory !== 'ALL' && (
                                        <Link href={`/mock/voice/${activeCategory.toLowerCase()}`}>
                                            <Button variant="ghost" size="sm">
                                                View All
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </Link>
                                    )
                                }
                            </div>
                            <AnimatePresence mode="wait">
                                {
                                    loadingCategory ? (
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
                                    ) : categoryMocks.length === 0 ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-16 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                                        >
                                            <Sparkles className="w-12 h-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-700" />
                                            <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                                No Mocks in This Category Yet
                                            </h4>
                                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                                Be the first to create one!
                                            </p>
                                            <Button onClick={() => setCreateSheetOpen(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Create Mock
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={activeCategory}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="grid md:grid-cols-2 gap-4"
                                        >
                                            {
                                                categoryMocks.map((mock, index) => (
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
                                        </motion.div>
                                    )
                                }
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-12 bg-white dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
                            Why Voice Mock Interviews?
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Experience realistic interview scenarios and get instant feedback
                        </p>
                    </motion.div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {
                            features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="p-6 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
                                >
                                    <div className="p-2.5 bg-white dark:bg-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 w-fit mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-10 border border-neutral-200 dark:border-neutral-800 text-center"
                    >
                        <Brain className="w-14 h-14 mx-auto mb-6 text-neutral-700 dark:text-neutral-300" />
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                            Ready to Start Practicing?
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-xl mx-auto">
                            Join thousands of developers improving their interview skills with AI-powered voice mock interviews.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                onClick={() => document.getElementById('mocks-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Browse Mocks
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700"
                                onClick={() => setCreateSheetOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Custom
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <CreateMockSheet
                open={createSheetOpen}
                onOpenChange={setCreateSheetOpen}
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