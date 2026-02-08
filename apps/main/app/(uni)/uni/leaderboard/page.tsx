"use client"

import { motion } from "framer-motion"
import { Trophy, Medal, Star, TrendingUp, Users, Crown } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"

export default function UniLeaderboardPage() {
    // Placeholder data - will be replaced with real data later
    const leaderboard = [
        { rank: 1, name: "Student 1", score: 980, avatar: null },
        { rank: 2, name: "Student 2", score: 875, avatar: null },
        { rank: 3, name: "Student 3", score: 820, avatar: null },
        { rank: 4, name: "Student 4", score: 750, avatar: null },
        { rank: 5, name: "Student 5", score: 720, avatar: null },
    ]

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-5 h-5 text-amber-500" />
            case 2:
                return <Medal className="w-5 h-5 text-neutral-400" />
            case 3:
                return <Medal className="w-5 h-5 text-amber-700" />
            default:
                return <span className="text-sm font-bold text-neutral-500">#{rank}</span>
        }
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-violet-500" />
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                        Leaderboard
                    </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    University Leaderboard
                </h1>
                <p className="text-neutral-500 mt-1">
                    See how you rank among your peers
                </p>
            </motion.div>

            {/* Your Rank Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-violet-200 text-sm mb-1">Your Current Rank</p>
                        <h2 className="text-4xl font-bold flex items-center gap-3">
                            <TrendingUp className="w-8 h-8" />
                            --
                        </h2>
                        <p className="text-violet-200 text-sm mt-2">
                            Complete assignments to climb the leaderboard!
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-violet-200 text-sm mb-1">Your Score</p>
                        <p className="text-3xl font-bold">0</p>
                        <p className="text-violet-200 text-xs">points</p>
                    </div>
                </div>
            </motion.div>

            {/* Coming Soon Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-800 dark:text-amber-200">Leaderboard Coming Soon</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            The leaderboard will show rankings once your university admin enables this feature and students start completing assignments.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Placeholder Leaderboard */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-violet-600" />
                            <h2 className="font-bold text-neutral-900 dark:text-white">Top Students</h2>
                        </div>
                        <span className="text-xs text-neutral-500">Preview</span>
                    </div>
                </div>

                <div className="divide-y divide-neutral-200 dark:divide-neutral-800 opacity-50">
                    {leaderboard.map((student, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                            <div className="w-8 flex items-center justify-center">
                                {getRankIcon(student.rank)}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                <span className="text-sm font-medium text-neutral-500">?</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-neutral-900 dark:text-white">{student.name}</p>
                                <p className="text-xs text-neutral-500">Placeholder</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-neutral-900 dark:text-white">{student.score}</p>
                                <p className="text-xs text-neutral-500">points</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
