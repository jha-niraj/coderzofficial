"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import {
    Tabs, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Rocket, Users, ThumbsUp, MessageSquare, Trophy, ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
    id: string
    slug: string
    name: string
    tagline: string
    logo: string | null
    category: string
    viewCount: number
    likeCount: number
    commentCount: number
    isFeatured: boolean
    type: string
    createdBy?: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
}

interface ProductSidebarProps {
    coderzProducts: Product[]
    communityProducts: Product[]
    currentSlug: string
}

function ProductCard({ product, isSelected }: { product: Product; isSelected?: boolean }) {
    return (
        <Link href={`/launchpads/${product.slug}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className={`
                    p-3 rounded-xl border transition-all cursor-pointer group
                    ${isSelected
                        ? 'border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                    }
                `}
            >
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        {
                            product.logo ? (
                                <Image
                                    src={product.logo}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center">
                                    <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                                        {product.name.charAt(0)}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white'} transition-colors`}>
                                {product.name}
                            </h3>
                            {
                                product.isFeatured && (
                                    <Trophy className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                )
                            }
                            {
                                isSelected && (
                                    <ArrowUpRight className="w-3 h-3 text-neutral-500 flex-shrink-0 ml-auto" />
                                )
                            }
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                            {product.tagline}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                            <span className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {product.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {product.commentCount}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

function EmptyState({ type }: { type: 'coderz' | 'community' }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                {
                    type === 'coderz' ? (
                        <Rocket className="w-6 h-6 text-neutral-400" />
                    ) : (
                        <Users className="w-6 h-6 text-neutral-400" />
                    )
                }
            </div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                {type === 'coderz' ? 'No products yet' : 'No community products'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {
                    type === 'coderz'
                        ? 'Stay tuned for updates!'
                        : 'Be the first to submit.'
                }
            </p>
        </div>
    )
}

export function ProductSidebar({
    coderzProducts,
    communityProducts,
    currentSlug
}: ProductSidebarProps) {
    const [activeTab, setActiveTab] = useState<'coderz' | 'community'>(() => {
        // Determine initial tab based on current product
        const isCurrentCoderz = coderzProducts.some(p => p.slug === currentSlug)
        return isCurrentCoderz ? 'coderz' : 'community'
    })

    const currentProducts = activeTab === 'coderz' ? coderzProducts : communityProducts

    return (
        <div className="w-[320px] lg:w-[360px] border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-950">
            <div className="flex-shrink-0 p-4 border-b border-neutral-100 dark:border-neutral-800">
                <Link href="/launchpads" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4">
                    <Rocket className="w-5 h-5" />
                    <span className="font-semibold">Launchpads</span>
                </Link>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'coderz' | 'community')}>
                    <TabsList className="w-full bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                        <TabsTrigger
                            value="coderz"
                            className="flex-1 text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm"
                        >
                            <Rocket className="w-3.5 h-3.5 mr-1.5" />
                            Coderz
                            <Badge variant="secondary" className="ml-1.5 bg-neutral-200 dark:bg-neutral-700 text-[10px] h-4 px-1.5">
                                {coderzProducts.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger
                            value="community"
                            className="flex-1 text-xs rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-900 data-[state=active]:shadow-sm"
                        >
                            <Users className="w-3.5 h-3.5 mr-1.5" />
                            Community
                            <Badge variant="secondary" className="ml-1.5 bg-neutral-200 dark:bg-neutral-700 text-[10px] h-4 px-1.5">
                                {communityProducts.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    <AnimatePresence mode="wait">
                        {
                            currentProducts.length === 0 ? (
                                <EmptyState type={activeTab} />
                            ) : (
                                currentProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isSelected={product.slug === currentSlug}
                                    />
                                ))
                            )
                        }
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    )
}