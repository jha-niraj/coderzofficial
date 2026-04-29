"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { 
    Users, CheckCircle, Clock, Gift, Copy, Check 
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { 
    Card, CardContent 
} from "@repo/ui/components/ui/card"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious
} from "@repo/ui/components/ui/pagination"
import { getReferralStats, getReferrals } from "@/actions/(main)/user/referral.action"
import toast from "@repo/ui/components/ui/sonner"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"

interface ReferralStats {
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalXpEarned: number;
    referralCode: string;
}

interface Referral {
    id: string;
    referralCode: string;
    pointsAwarded: boolean;
    createdAt: string;
    referredUser: {
        name: string | null;
        email: string | null;
        image: string | null;
        onboardingCompleted: boolean;
        createdAt: string;
    };
}

export default function ReferralsPage() {
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingReferrals, setLoadingReferrals] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchReferrals = useCallback(async () => {
        setLoadingReferrals(true)
        const result = await getReferrals(currentPage, 10, "all")
        if (result.success) {
            setReferrals(result.referrals as Referral[])
            setTotalPages(result.totalPages)
        }
        setLoadingReferrals(false)
    }, [currentPage])

    useEffect(() => {
        fetchReferrals()
    }, [currentPage, fetchReferrals])

    const fetchStats = async () => {
        const result = await getReferralStats()
        if (result.success && result.stats) {
            setStats(result.stats)
        }
        setLoading(false)
    }

    const copyReferralLink = () => {
        if (!stats?.referralCode) return
        const referralLink = `${window.location.origin}/register?ref=${stats.referralCode}`
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        toast.success("Referral link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    const statCards = [
        {
            title: "Total Referrals",
            value: stats?.totalReferrals || 0,
            icon: Users,
            gradient: "from-blue-500 to-cyan-500"
        },
        // {
        //     title: "Successful",
        //     value: stats?.successfulReferrals || 0,
        //     icon: CheckCircle,
        //     gradient: "from-green-500 to-emerald-500"
        // },
        // {
        //     title: "Pending",
        //     value: stats?.pendingReferrals || 0,
        //     icon: Clock,
        //     gradient: "from-amber-500 to-orange-500"
        // },
        {
            title: "Total XP Earned",
            value: stats?.totalXpEarned || 0,
            icon: Gift,
            gradient: "from-purple-500 to-pink-500"
        }
    ]

    return (
        <div className="">
            <div className="container max-w-7xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400 mb-2">
                        Referral Tracking
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Track your referrals and rewards • Earn 300 XP per successful referral
                    </p>
                </motion.div>
                {
                    loading ? (
                        <Skeleton className="h-16 w-full mb-8" />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-8"
                        >
                            <Card className="bg-white dark:bg-neutral-900 shadow-2xl rounded-2xl border-0">
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-black dark:text-white font-semibold mb-1">Your Referral Link</h3>
                                            <p className="text-neutral-900 dark:text-neutral-100 text-sm break-all">
                                                {window.location.origin}/register?ref={stats?.referralCode}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={copyReferralLink}
                                            className="bg-white hover:bg-neutral-100 text-blue-600 font-semibold"
                                        >
                                            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                            {copied ? "Copied!" : "Copy Link"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )
                }
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {
                        statCards.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.1 }}
                            >
                                {
                                    loading ? (
                                        <Skeleton className="h-32" />
                                    ) : (
                                        <Card className="bg-white/50 dark:bg-neutral-900/50 shadow-2xl rounded-2xl backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-center mb-4">
                                                    <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl`}>
                                                        <stat.icon className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                                                    {stat.value}
                                                </h3>
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                    {stat.title}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )
                                }
                            </motion.div>
                        ))
                    }
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-white/50 dark:bg-neutral-900/50 shadow-2xl rounded-2xl backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                        <CardContent className="p-6">
                            <div className="mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                    Your Referrals
                                </h2>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    Track everyone you&apos;ve invited to join TheCoderz
                                </p>
                            </div>
                            <div className="space-y-4">
                                {
                                    loadingReferrals ? (
                                        <div className="space-y-3">
                                            {
                                                [1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                                        <Skeleton className="w-14 h-14 rounded-full" />
                                                        <div className="flex-1 space-y-2">
                                                            <Skeleton className="h-4 w-1/3" />
                                                            <Skeleton className="h-3 w-1/2" />
                                                            <Skeleton className="h-3 w-1/4" />
                                                        </div>
                                                        <Skeleton className="h-8 w-28" />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ) : referrals.length > 0 ? (
                                        <div className="space-y-3">
                                            {
                                                referrals.map((referral, index) => (
                                                    <motion.div
                                                        key={referral.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="group flex items-center gap-4 p-4 bg-gradient-to-r from-white to-blue-50/30 dark:from-slate-800/80 dark:to-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 cursor-default"
                                                    >
                                                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-900 group-hover:ring-4 transition-all duration-300">
                                                            {
                                                                referral.referredUser.image ? (
                                                                    <Image
                                                                        src={referral.referredUser.image}
                                                                        alt={referral.referredUser.name || "User"}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                                                                        {referral.referredUser.name?.charAt(0) || "?"}
                                                                    </div>
                                                                )
                                                            }
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                                {referral.referredUser.name || "Anonymous"}
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                                                {referral.referredUser.email}
                                                            </p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Joined {formatDistanceToNow(new Date(referral.referredUser.createdAt), { addSuffix: true })}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {
                                                                referral.referredUser.onboardingCompleted ? (
                                                                    <>
                                                                        <span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            Successful
                                                                        </span>
                                                                        <span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-full border border-purple-200 dark:border-purple-800">
                                                                            <Gift className="w-3 h-3" />
                                                                            +300 XP
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-800">
                                                                        <Clock className="w-3 h-3" />
                                                                        Pending
                                                                    </span>
                                                                )
                                                            }
                                                        </div>
                                                    </motion.div>
                                                ))
                                            }
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                                <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                                                No referrals yet
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                                                Share your referral link above to invite friends and start earning rewards together!
                                            </p>
                                        </div>
                                    )
                                }
                                {
                                    totalPages > 1 && (
                                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationItem>
                                                        <PaginationPrevious
                                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                        />
                                                    </PaginationItem>

                                                    {
                                                        Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                            if (
                                                                page === 1 ||
                                                                page === totalPages ||
                                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                                            ) {
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
                                                            } else if (
                                                                page === currentPage - 2 ||
                                                                page === currentPage + 2
                                                            ) {
                                                                return (
                                                                    <PaginationItem key={page}>
                                                                        <PaginationEllipsis />
                                                                    </PaginationItem>
                                                                )
                                                            }
                                                            return null
                                                        })
                                                    }

                                                    <PaginationItem>
                                                        <PaginationNext
                                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )
                                }
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}