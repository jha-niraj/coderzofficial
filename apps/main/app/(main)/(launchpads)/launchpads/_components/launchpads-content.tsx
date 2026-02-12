"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Rocket, Users, Star, Eye, ThumbsUp,
    MessageSquare, Zap, Brain, ArrowUpRight,
    Sparkles, Trophy, TrendingUp
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useLaunchpadsStore } from "@/app/store/launchpadsStore"
import type { LaunchpadsContentProps, LaunchpadProduct } from "@/types/launchpads"

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
    LEARNING: <Brain className="w-4 h-4" />,
    PRODUCTIVITY: <Zap className="w-4 h-4" />,
    CAREER: <TrendingUp className="w-4 h-4" />,
    COMMUNITY: <Users className="w-4 h-4" />,
    DEVELOPER_TOOLS: <Rocket className="w-4 h-4" />,
    AI_POWERED: <Sparkles className="w-4 h-4" />,
    OTHER: <Star className="w-4 h-4" />
}

function ProductCard({ product, isSelected }: { product: LaunchpadProduct; isSelected?: boolean }) {
    return (
        <Link href={`/launchpads/${product.slug}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className={`
                    p-4 rounded-xl border transition-all cursor-pointer group
                    ${isSelected
                        ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50'
                    }
                `}
            >
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        {
                            product.logo ? (
                                <Image
                                    src={product.logo}
                                    alt={product.name}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center">
                                    <span className="text-lg font-bold text-neutral-600 dark:text-neutral-300">
                                        {product.name.charAt(0)}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                                        {product.name}
                                    </h3>
                                    {
                                        product.isFeatured && (
                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] px-1.5 py-0">
                                                <Trophy className="w-2.5 h-2.5 mr-0.5" />
                                                Featured
                                            </Badge>
                                        )
                                    }
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                                    {product.tagline}
                                </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {product.viewCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {product.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {product.commentCount}
                            </span>
                            <Badge variant="secondary" className="ml-auto text-[10px] px-2 py-0 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                {categoryIcons[product.category]}
                                <span className="ml-1 capitalize">{product.category.toLowerCase().replace('_', ' ')}</span>
                            </Badge>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

function FeaturedProductCard({ product }: { product: LaunchpadProduct }) {
    return (
        <Link href={`/launchpads/${product.slug}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950 p-6 cursor-pointer group"
            >
                <div className="absolute top-3 right-3">
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Trophy className="w-3 h-3 mr-1" />
                        Featured
                    </Badge>
                </div>
                <div className="flex items-start gap-4">
                    {
                        product.logo ? (
                            <Image
                                src={product.logo}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-2xl object-cover shadow-lg"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 dark:from-neutral-200 dark:to-neutral-300 flex items-center justify-center shadow-lg">
                                <span className="text-2xl font-bold text-white dark:text-neutral-900">
                                    {product.name.charAt(0)}
                                </span>
                            </div>
                        )
                    }

                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                            {product.tagline}
                        </p>

                        <div className="flex items-center gap-4 mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {product.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {product.commentCount}
                            </span>
                            <ArrowUpRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

function EmptyState({ type }: { type: 'coderz' | 'community' }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                {
                    type === 'coderz' ? (
                        <Rocket className="w-8 h-8 text-neutral-400" />
                    ) : (
                        <Users className="w-8 h-8 text-neutral-400" />
                    )
                }
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {type === 'coderz' ? 'No products yet' : 'No community products yet'}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">
                {
                    type === 'coderz'
                        ? 'We are working on exciting new products. Stay tuned!'
                        : 'Be the first to submit your product to the community.'
                }
            </p>
        </div>
    )
}

export function LaunchpadsContent({
    coderzProducts: initialCoderzProducts,
    communityProducts: initialCommunityProducts,
    featuredProducts: initialFeaturedProducts
}: LaunchpadsContentProps) {
    const {
        coderzProducts, communityProducts, featuredProducts,
        activeTab, setActiveTab, initialize
    } = useLaunchpadsStore()

    // Initialize store with props
    useEffect(() => {
        initialize(initialCoderzProducts, initialCommunityProducts, initialFeaturedProducts)
    }, [initialCoderzProducts, initialCommunityProducts, initialFeaturedProducts, initialize])

    // Use store data (falls back to initial if store not yet hydrated)
    const displayCoderzProducts = coderzProducts.length > 0 ? coderzProducts : initialCoderzProducts
    const displayCommunityProducts = communityProducts.length > 0 ? communityProducts : initialCommunityProducts
    const displayFeaturedProducts = featuredProducts.length > 0 ? featuredProducts : initialFeaturedProducts
    const currentProducts = activeTab === 'coderz' ? displayCoderzProducts : displayCommunityProducts

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="w-full md:w-[400px] lg:w-[450px] border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="flex-shrink-0 p-4 border-b border-neutral-100 dark:border-neutral-800">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'coderz' | 'community')}>
                        <TabsList className="w-full bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                            <TabsTrigger
                                value="community"
                                className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Community
                                <Badge variant="secondary" className="ml-2 bg-neutral-200 dark:bg-neutral-700 text-xs">
                                    {displayCommunityProducts.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="coderz"
                                className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm"
                            >
                                <Rocket className="w-4 h-4 mr-2" />
                                Coderz Labs
                                <Badge variant="secondary" className="ml-2 bg-neutral-200 dark:bg-neutral-700 text-xs">
                                    {displayCoderzProducts.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-3">
                        <AnimatePresence mode="wait">
                            {
                                currentProducts.length === 0 ? (
                                    <EmptyState type={activeTab} />
                                ) : (
                                    currentProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))
                                )
                            }
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </div>
            <div className="hidden md:flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="flex-1">
                    <div className="p-8">
                        <div className="text-center mb-10">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 flex items-center justify-center shadow-xl mb-6">
                                <Rocket className="w-10 h-10 text-white dark:text-neutral-900" />
                            </div>
                            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
                                Welcome to Launchpads
                            </h2>
                            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                                Discover innovative products built by Coderz and the community.
                                Select a product from the left to see details.
                            </p>
                        </div>

                        {
                            displayFeaturedProducts.length > 0 && (
                                <div className="mt-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                            Featured Products
                                        </h3>
                                    </div>
                                    <div className="grid gap-4">
                                        {
                                            displayFeaturedProducts.map((product) => (
                                                <FeaturedProductCard key={product.id} product={product} />
                                            ))
                                        }
                                    </div>
                                </div>
                            )
                        }

                        <div className="mt-10 grid grid-cols-3 gap-4">
                            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
                                <Users className="w-8 h-8 mx-auto text-neutral-700 dark:text-neutral-300 mb-3" />
                                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {displayCommunityProducts.length}
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Community Products
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
                                <Rocket className="w-8 h-8 mx-auto text-neutral-700 dark:text-neutral-300 mb-3" />
                                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {displayCoderzProducts.length}
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Coderz Products
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
                                <Trophy className="w-8 h-8 mx-auto text-amber-500 mb-3" />
                                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {displayFeaturedProducts.length}
                                </div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Featured
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}