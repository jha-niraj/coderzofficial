"use client";

import { motion } from "framer-motion";
import { TrendingUp, Crown, Users, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

interface LeaderboardPositionProps {
    rank: {
        position: number;
        totalUsers: number;
        percentile: number;
    };
}

export default function LeaderboardPosition({ rank }: LeaderboardPositionProps) {
    const getRankEmoji = (p: number) => p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : "🏆";
    const getRankGradient = (p: number) =>
        p === 1 ? "from-yellow-500 to-amber-400"
        : p === 2 ? "from-slate-400 to-slate-500"
        : p === 3 ? "from-orange-400 to-orange-500"
        : "from-blue-500 to-indigo-500";
    const topPercent = 100 - rank.percentile;
    const isTopTen = rank.position <= 10;

    return (
        <div className="h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                    </div>
                    <span className="font-semibold text-sm">Leaderboard</span>
                </div>
                <Link href="/leaderboard" className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Full board <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Rank hero card */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20 p-5">
                <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
                <div className="relative flex items-center gap-4">
                    <motion.span
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="text-4xl select-none"
                    >
                        {getRankEmoji(rank.position)}
                    </motion.span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                                #{rank.position}
                            </span>
                            {isTopTen && <Crown className="h-5 w-5 text-yellow-500" />}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">Your current rank</p>
                    </div>
                </div>
            </div>

            {/* Percentile bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{rank.totalUsers.toLocaleString()} developers</span>
                    </div>
                    <span className={`text-sm font-bold bg-gradient-to-r ${getRankGradient(rank.position)} bg-clip-text text-transparent`}>
                        Top {topPercent}%
                    </span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rank.percentile}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                        className={`h-full bg-gradient-to-r ${getRankGradient(rank.position)} rounded-full`}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>Bottom</span>
                    <span>Top 1%</span>
                </div>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <Link href="/leaderboard">
                    <div className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                                <Zap className="h-3 w-3 text-amber-500" />
                            </div>
                            <span className="text-xs text-neutral-600 dark:text-neutral-400">Keep practicing to climb</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-white transition-colors" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
