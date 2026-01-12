"use client"

import { useEffect, useState } from "react"
import {
    Terminal, Network, ShieldCheck, Zap, Users, Rocket, FolderCode, 
    CheckCircle2, GitCompare
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { useSession } from '@repo/auth/client'
import { useRouter } from "next/navigation"
import { cn } from "@repo/ui/lib/utils"
import { motion, Variants } from "framer-motion"
import { getPlatformStats } from "@/actions/(common)/stats/platform-stats.action"
import { Skeleton } from "@repo/ui/components/ui/skeleton"

interface PlatformStats {
    totalUsers: number
    totalProjects: number
    completedTasks: number
    successRate: number
    totalOpenSourceProjects: number
    totalEvents: number
    totalMockSessions: number
    totalProjectIdeas: number
}

export default function HeroSection() {
    const { data: session } = useSession()
    const router = useRouter()
    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const result = await getPlatformStats()
                if (result.success && result.data) {
                    setStats(result.data as unknown as PlatformStats)
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const handleAuthenticatedAction = (targetUrl: string) => {
        if (session) {
            router.push(targetUrl);
        } else {
            router.push('/signin');
        }
    }

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }

    // Format number for display
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    // Animation Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            }
        }
    }

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    }

    const statItemVariants: Variants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    }

    // Dynamic stats using real data
    const displayStats = [
        {
            label: "Active Developers",
            value: loading ? "..." : formatNumber(stats?.totalUsers || 0),
            icon: Users,
            suffix: "+"
        },
        {
            label: "Projects Built",
            value: loading ? "..." : formatNumber(stats?.totalProjects || 0),
            icon: FolderCode,
            suffix: "+"
        },
        {
            label: "Tasks Completed",
            value: loading ? "..." : formatNumber(stats?.completedTasks || 0),
            icon: CheckCircle2,
            suffix: "+"
        },
        {
            label: "Success Rate",
            value: loading ? "..." : `${stats?.successRate || 94}`,
            icon: Rocket,
            suffix: "%"
        },
        {
            label: "OS Contributions",
            value: loading ? "..." : formatNumber(stats?.totalOpenSourceProjects || 0),
            icon: GitCompare,
            suffix: "+"
        },
        {
            label: "Events Hosted",
            value: loading ? "..." : formatNumber(stats?.totalEvents || 0),
            icon: Network,
            suffix: "+"
        },
        {
            label: "Mock Interviews",
            value: loading ? "..." : formatNumber(stats?.totalMockSessions || 0),
            icon: ShieldCheck,
            suffix: "+"
        },
        {
            label: "Project Ideas",
            value: loading ? "..." : formatNumber(stats?.totalProjectIdeas || 0),
            icon: Zap,
            suffix: "+"
        },
    ]

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-black selection:bg-orange-100 dark:selection:bg-orange-900/30 flex items-center justify-center transition-colors duration-500">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div
                    className={cn(
                        "absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full blur-[100px]",
                        "bg-[radial-gradient(circle,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0)_70%)]",
                        "dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_70%)]"
                    )}
                />
                <div
                    className={cn(
                        "absolute bottom-[-30%] left-1/2 -translate-x-1/2 w-[1400px] h-[900px] rounded-full blur-[150px]",
                        "bg-[radial-gradient(closest-side,rgba(255,200,150,0.25)_0%,rgba(255,240,230,0.1)_40%,rgba(0,0,0,0)_100%)]",
                        "dark:bg-[radial-gradient(closest-side,rgba(255,100,50,0.18)_0%,rgba(200,80,40,0.05)_40%,rgba(0,0,0,0)_100%)]"
                    )}
                />
                <div className="absolute top-[25%] left-[5%] w-96 h-96 rounded-full blur-[120px] animate-pulse-slow bg-orange-100/30 dark:bg-orange-900/10" />
                <div className="absolute top-[20%] right-[10%] w-96 h-96 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000 bg-neutral-100/40 dark:bg-neutral-800/20" />
                <div
                    className={cn(
                        "absolute inset-0 bg-[size:32px_32px]",
                        "bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]",
                        "dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]",
                        "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
                    )}
                />
            </div>
            <div className="relative z-10 w-full px-6 pt-24 lg:px-8">
                <motion.div
                    className="mx-auto max-w-5xl text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        variants={itemVariants}
                        className={cn(
                            "mb-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-mono uppercase tracking-wider shadow-sm",
                            "bg-white/60 dark:bg-white/5 backdrop-blur-md",
                            "border border-orange-200/50 dark:border-white/10",
                            "text-orange-900 dark:text-white/90"
                        )}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                        </span>
                        System Operational
                    </motion.div>
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 drop-shadow-sm text-neutral-900 dark:text-white"
                    >
                        The Engineering <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-white dark:to-neutral-400">
                            Intelligence Suite.
                        </span>
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-6 font-light text-neutral-700 dark:text-neutral-300"
                    >
                        Master system design, open source contribution, and full-stack architecture with a suite of specialized AI agents designed for serious developers.
                    </motion.p>
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-10"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={() => handleAuthenticatedAction("/home")}
                                className={cn(
                                    "cursor-pointer h-14 px-8 text-base rounded-2xl font-bold transition-all duration-300",
                                    "bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-900/10",
                                    "dark:bg-white dark:text-black dark:hover:bg-neutral-200 dark:shadow-[0_0_40px_-10px_rgba(255,150,100,0.2)]"
                                )}
                            >
                                <Terminal className="mr-2 h-5 w-5" />
                                Initialize Environment
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="outline"
                                onClick={() => scrollToSection("pricing")}
                                className={cn(
                                    "cursor-pointer h-14 px-8 text-base rounded-2xl backdrop-blur-md transition-all duration-300",
                                    "border-neutral-300 bg-white/50 text-neutral-900 hover:bg-white/80",
                                    "dark:border-neutral-700 dark:bg-black/50 dark:text-white dark:hover:bg-white/10 dark:hover:border-neutral-500"
                                )}
                            >
                                View Compute Pricing
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* 8 Stats Grid - Real Data */}
                    <motion.div
                        variants={containerVariants}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
                    >
                        {displayStats.map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={statItemVariants}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className={cn(
                                    "group flex flex-col items-center p-5 rounded-2xl transition-all duration-300",
                                    "bg-white/60 border border-orange-100/50 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-100/50",
                                    "dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 dark:hover:border-white/10 dark:hover:shadow-none"
                                )}
                            >
                                <div className="p-2.5 rounded-full mb-2 group-hover:scale-110 transition-transform bg-orange-50 dark:bg-white/5">
                                    <stat.icon className="w-4 h-4 text-orange-800/70 dark:text-neutral-300" />
                                </div>
                                {loading ? (
                                    <Skeleton className="h-8 w-16 mb-1" />
                                ) : (
                                    <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                                        {stat.value}{stat.suffix}
                                    </div>
                                )}
                                <div className="text-[10px] uppercase tracking-widest mt-1 font-medium text-neutral-600 dark:text-neutral-500">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-24 z-20 pointer-events-none bg-gradient-to-t from-white to-transparent dark:from-black dark:to-transparent" />

            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    )
}