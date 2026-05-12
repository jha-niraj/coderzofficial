"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Terminal } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { useRef, useState, useEffect, useCallback } from "react"
import { useSession } from "@repo/auth/client"
import { useRouter } from "next/navigation"
import { cn } from "@repo/ui/lib/utils"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { getPlatformStats } from "@/actions/(common)/stats/platform-stats.action"

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

const ROTATE_WORDS = ["career", "portfolio", "resume", "skillset", "interviews", "journey"]

const SLIDES = [
    { src: "/mainlogo.png", alt: "BuildrHQ Dashboard" },
    { src: "/mainlogo.png", alt: "Resume Builder" },
    { src: "/mainlogo.png", alt: "Mock Interviews" },
    { src: "/mainlogo.png", alt: "Project Studio" },
    { src: "/mainlogo.png", alt: "AI Tools" },
]

const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
}

export default function HeroSection() {
    const reduced = useReducedMotion()
    const { data: session } = useSession()
    const router = useRouter()
    const isLoggedIn = Boolean(session?.user)

    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [wordIdx, setWordIdx] = useState(0)
    const [wordVis, setWordVis] = useState(true)
    const [slideIdx, setSlideIdx] = useState(0)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const result = await getPlatformStats()
                if (result.success && result.data) {
                    setStats(result.data as unknown as PlatformStats)
                }
            } catch {
                // non-critical
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    useEffect(() => {
        const t = setInterval(() => {
            setWordVis(false)
            setTimeout(() => {
                setWordIdx(i => (i + 1) % ROTATE_WORDS.length)
                setWordVis(true)
            }, 280)
        }, 2600)
        return () => clearInterval(t)
    }, [])

    const startAutoplay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            setSlideIdx(i => (i + 1) % SLIDES.length)
        }, 2000)
    }, [])

    useEffect(() => {
        startAutoplay()
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [startAutoplay])

    const goTo = (idx: number) => {
        setSlideIdx(idx)
        startAutoplay()
    }

    const statItems = [
        {
            eyebrow: "Active Developers",
            value: loading ? null : formatNumber(stats?.totalUsers ?? 0),
            desc: "Building on BuildrHQ",
            accent: "bg-orange-500",
        },
        {
            eyebrow: "Projects Built",
            value: loading ? null : formatNumber(stats?.totalProjects ?? 0),
            desc: "Shipped by our community",
            accent: "bg-amber-500",
        },
        {
            eyebrow: "Mock Interviews",
            value: loading ? null : formatNumber(stats?.totalMockSessions ?? 0),
            desc: "Conducted on platform",
            accent: "bg-orange-500",
        },
        {
            eyebrow: "Events Hosted",
            value: loading ? null : formatNumber(stats?.totalEvents ?? 0),
            desc: "Workshops and hackathons",
            accent: "bg-amber-500",
        },
    ]

    return (
        <section className="relative h-screen overflow-hidden bg-[#faf7f2] dark:bg-black">
            {/* subtle grid overlay */}
            <div
                className={cn(
                    "pointer-events-none absolute inset-0 z-0 bg-[size:32px_32px]",
                    "bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)]",
                    "dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)]",
                    "[mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]"
                )}
            />

            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 lg:px-16">

                {/* ── Top row: text left + stats right ─────────────────────── */}
                <div className="flex shrink-0 flex-col items-start gap-10 pt-24 pb-6 lg:flex-row lg:items-center lg:gap-14 lg:pt-28">

                    {/* Left: text */}
                    <motion.div
                        className="flex-1"
                        variants={reduced ? undefined : container}
                        initial={reduced ? false : "hidden"}
                        animate={reduced ? undefined : "show"}
                    >
                        {/* rotating badge */}
                        <motion.div
                            className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 dark:border-white/10 dark:bg-white/5"
                            variants={reduced ? undefined : item}
                        >
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
                            <span className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 dark:text-white/50">
                                Accelerate your
                            </span>
                            <span
                                className="min-w-[68px] text-left text-[11px] font-semibold uppercase tracking-widest text-orange-500"
                                style={{
                                    opacity: wordVis ? 1 : 0,
                                    filter: wordVis ? "blur(0)" : "blur(5px)",
                                    transition: "opacity 200ms, filter 200ms",
                                }}
                            >
                                {ROTATE_WORDS[wordIdx]}
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-[48px] font-bold leading-[1.05] tracking-[-2.5px] text-neutral-950 dark:text-white lg:text-[58px]"
                            variants={reduced ? undefined : item}
                        >
                            The Engineering
                            <br />
                            <span className="text-neutral-400 dark:text-white/30">Intelligence Suite.</span>
                        </motion.h1>

                        <motion.p
                            className="mt-5 max-w-[480px] text-[15px] leading-relaxed text-neutral-500 dark:text-white/45"
                            variants={reduced ? undefined : item}
                        >
                            Master system design, open source contribution, and full-stack
                            architecture with a suite of specialized AI agents designed for
                            serious developers.
                        </motion.p>

                        <motion.div
                            className="mt-8 flex flex-wrap items-center gap-3"
                            variants={reduced ? undefined : item}
                        >
                            {isLoggedIn ? (
                                <button
                                    onClick={() => router.push("/home")}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                                >
                                    <Terminal className="h-4 w-4" />
                                    Go to Dashboard
                                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </button>
                            ) : (
                                <>
                                    <Link
                                        href="/signup"
                                        className="group inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
                                    >
                                        <Terminal className="h-4 w-4" />
                                        Initialize Environment
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </Link>
                                    <Link
                                        href="/signin"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-transparent px-7 py-3.5 text-[14px] font-medium text-neutral-700 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-100 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
                                    >
                                        Sign in
                                        <span className="text-neutral-400 dark:text-white/30">→</span>
                                    </Link>
                                </>
                            )}
                        </motion.div>

                        <motion.div
                            className="mt-5 flex items-center gap-6"
                            variants={reduced ? undefined : item}
                        >
                            <p className="text-[12px] text-neutral-400 dark:text-white/25">
                                Trusted by developers · No credit card required
                            </p>
                            <div className="flex items-center gap-1.5">
                                {SLIDES.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goTo(i)}
                                        aria-label={`Go to slide ${i + 1}`}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            i === slideIdx
                                                ? "w-6 bg-neutral-950 dark:bg-white"
                                                : "w-1.5 bg-neutral-300 hover:bg-neutral-400 dark:bg-white/20 dark:hover:bg-white/40"
                                        }`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: 2×2 stats card */}
                    <motion.div
                        className="w-full flex-1"
                        initial={reduced ? false : { opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-white/10 dark:bg-white/5">
                            <div className="grid grid-cols-2 divide-x divide-y divide-neutral-100 dark:divide-white/10">
                                {statItems.map((s) => (
                                    <div key={s.eyebrow} className="px-6 py-5">
                                        <p className="mb-3 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-500">
                                            <span className={`h-1 w-1 shrink-0 rounded-full ${s.accent}`} />
                                            {s.eyebrow}
                                        </p>
                                        {s.value === null ? (
                                            <Skeleton className="h-10 w-16 mb-1" />
                                        ) : (
                                            <p className="text-[38px] font-bold leading-none tracking-tight text-neutral-900 dark:text-white">
                                                {s.value}
                                                <span className="text-[22px] text-orange-500">+</span>
                                            </p>
                                        )}
                                        <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Image carousel — fills rest, bleeds off bottom ────────── */}
                <motion.div
                    className="relative min-h-0 flex-1"
                    initial={reduced ? false : { opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="absolute inset-0 bottom-[-48px] overflow-hidden rounded-t-2xl border border-b-0 border-neutral-200 bg-white shadow-2xl shadow-neutral-900/10 dark:border-white/10 dark:bg-neutral-900">
                        {SLIDES.map((slide, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 transition-opacity duration-500"
                                style={{ opacity: i === slideIdx ? 1 : 0 }}
                            >
                                <Image
                                    src={slide.src}
                                    alt={slide.alt}
                                    fill
                                    className="object-contain object-center p-12"
                                    priority={i === 0}
                                    sizes="(max-width: 1280px) 100vw, 1280px"
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </section>
    )
}
