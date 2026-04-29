"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Trophy, Medal, Award, Flame, Code, Users, Gift, ChevronUp, 
    ChevronDown, TrendingUp
} from "lucide-react"
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs"
import { Card, CardContent } from "@repo/ui/components/ui/card"
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { cn } from "@repo/ui/lib/utils"
import SmoothScroll from "@/components/smoothscroll"

// Sample data for the leaderboard
const leaderboardData = {
    streak: [
        { id: 1, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40", rank: 1, score: 42, change: 2 },
        { id: 2, name: "Jamie Smith", avatar: "/placeholder.svg?height=40&width=40", rank: 2, score: 39, change: 1 },
        { id: 3, name: "Taylor Brown", avatar: "/placeholder.svg?height=40&width=40", rank: 3, score: 36, change: -1 },
        { id: 4, name: "Morgan Davis", avatar: "/placeholder.svg?height=40&width=40", rank: 4, score: 31, change: 0 },
        { id: 5, name: "Casey Wilson", avatar: "/placeholder.svg?height=40&width=40", rank: 5, score: 28, change: 3 },
        { id: 6, name: "Riley Moore", avatar: "/placeholder.svg?height=40&width=40", rank: 6, score: 26, change: -2 },
        { id: 7, name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40", rank: 7, score: 24, change: 1 },
        { id: 8, name: "Avery Clark", avatar: "/placeholder.svg?height=40&width=40", rank: 8, score: 22, change: 0 },
        { id: 9, name: "Quinn Roberts", avatar: "/placeholder.svg?height=40&width=40", rank: 9, score: 19, change: -1 },
        { id: 10, name: "Reese Turner", avatar: "/placeholder.svg?height=40&width=40", rank: 10, score: 17, change: 2 },
    ],
    projects: [
        { id: 1, name: "Taylor Brown", avatar: "/placeholder.svg?height=40&width=40", rank: 1, score: 87, change: 0 },
        { id: 2, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40", rank: 2, score: 82, change: 1 },
        { id: 3, name: "Morgan Davis", avatar: "/placeholder.svg?height=40&width=40", rank: 3, score: 76, change: 1 },
        { id: 4, name: "Jamie Smith", avatar: "/placeholder.svg?height=40&width=40", rank: 4, score: 71, change: -2 },
        { id: 5, name: "Riley Moore", avatar: "/placeholder.svg?height=40&width=40", rank: 5, score: 65, change: 0 },
        { id: 6, name: "Casey Wilson", avatar: "/placeholder.svg?height=40&width=40", rank: 6, score: 59, change: 2 },
        { id: 7, name: "Avery Clark", avatar: "/placeholder.svg?height=40&width=40", rank: 7, score: 54, change: -1 },
        { id: 8, name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40", rank: 8, score: 48, change: 1 },
        { id: 9, name: "Quinn Roberts", avatar: "/placeholder.svg?height=40&width=40", rank: 9, score: 43, change: 0 },
        { id: 10, name: "Reese Turner", avatar: "/placeholder.svg?height=40&width=40", rank: 10, score: 39, change: 3 },
    ],
    referrals: [
        { id: 1, name: "Morgan Davis", avatar: "/placeholder.svg?height=40&width=40", rank: 1, score: 63, change: 1 },
        { id: 2, name: "Casey Wilson", avatar: "/placeholder.svg?height=40&width=40", rank: 2, score: 58, change: -1 },
        { id: 3, name: "Jamie Smith", avatar: "/placeholder.svg?height=40&width=40", rank: 3, score: 52, change: 0 },
        { id: 4, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40", rank: 4, score: 47, change: 2 },
        { id: 5, name: "Taylor Brown", avatar: "/placeholder.svg?height=40&width=40", rank: 5, score: 41, change: -2 },
        { id: 6, name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40", rank: 6, score: 36, change: 1 },
        { id: 7, name: "Riley Moore", avatar: "/placeholder.svg?height=40&width=40", rank: 7, score: 32, change: 0 },
        { id: 8, name: "Quinn Roberts", avatar: "/placeholder.svg?height=40&width=40", rank: 8, score: 28, change: 3 },
        { id: 9, name: "Avery Clark", avatar: "/placeholder.svg?height=40&width=40", rank: 9, score: 24, change: -1 },
        { id: 10, name: "Reese Turner", avatar: "/placeholder.svg?height=40&width=40", rank: 10, score: 21, change: 0 },
    ],
    contributors: [
        { id: 1, name: "Jamie Smith", avatar: "/placeholder.svg?height=40&width=40", rank: 1, score: 124, change: 0 },
        { id: 2, name: "Riley Moore", avatar: "/placeholder.svg?height=40&width=40", rank: 2, score: 118, change: 1 },
        { id: 3, name: "Alex Johnson", avatar: "/placeholder.svg?height=40&width=40", rank: 3, score: 112, change: -1 },
        { id: 4, name: "Taylor Brown", avatar: "/placeholder.svg?height=40&width=40", rank: 4, score: 103, change: 2 },
        { id: 5, name: "Morgan Davis", avatar: "/placeholder.svg?height=40&width=40", rank: 5, score: 97, change: 0 },
        { id: 6, name: "Avery Clark", avatar: "/placeholder.svg?height=40&width=40", rank: 6, score: 91, change: 1 },
        { id: 7, name: "Casey Wilson", avatar: "/placeholder.svg?height=40&width=40", rank: 7, score: 86, change: -2 },
        { id: 8, name: "Reese Turner", avatar: "/placeholder.svg?height=40&width=40", rank: 8, score: 79, change: 3 },
        { id: 9, name: "Jordan Lee", avatar: "/placeholder.svg?height=40&width=40", rank: 9, score: 73, change: -1 },
        { id: 10, name: "Quinn Roberts", avatar: "/placeholder.svg?height=40&width=40", rank: 10, score: 68, change: 0 },
    ],
}

export default function Leaderboard() {
    const [timeFilter, setTimeFilter] = useState<"month" | "lifetime">("month")

    // Get rank icon based on position
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-5 w-5 text-yellow-500" />
            case 2:
                return <Medal className="h-5 w-5 text-neutral-400" />
            case 3:
                return <Award className="h-5 w-5 text-amber-700" />
            default:
                return <span className="flex h-5 w-5 items-center justify-center font-semibold text-neutral-600 dark:text-neutral-400">{rank}</span>
        }
    }

    // Get change indicator
    const getChangeIndicator = (change: number) => {
        if (change > 0) {
            return (
                <div className="flex items-center text-green-500">
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-xs font-medium">{change}</span>
                </div>
            )
        } else if (change < 0) {
            return (
                <div className="flex items-center text-red-500">
                    <ChevronDown className="h-4 w-4" />
                    <span className="text-xs font-medium">{Math.abs(change)}</span>
                </div>
            )
        } else {
            return (
                <div className="flex items-center text-neutral-400">
                    <span className="text-xs">-</span>
                </div>
            )
        }
    }

    return (
        <SmoothScroll>
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 pb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-6 sm:flex-row sm:items-end sm:justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                            Leaderboard
                        </h1>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            Compete with developers worldwide and climb the ranks.
                        </p>
                    </div>
                    <Badge variant="outline" className="w-fit px-3 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm">
                        <Trophy className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
                        Top Performers
                    </Badge>
                </motion.div>
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex justify-start"
                    >
                        <div className="inline-flex rounded-full border border-neutral-200 dark:border-neutral-800 p-1 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-sm">
                                <Button
                                    variant={timeFilter === "month" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setTimeFilter("month")}
                                    className={cn(
                                        "rounded-full px-6 transition-all duration-200",
                                        timeFilter === "month"
                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                    )}
                                >
                                    This Month
                                </Button>
                                <Button
                                    variant={timeFilter === "lifetime" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setTimeFilter("lifetime")}
                                    className={cn(
                                        "rounded-full px-6 transition-all duration-200",
                                        timeFilter === "lifetime"
                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                    )}
                                >
                                    Lifetime
                                </Button>
                        </div>
                    </motion.div>
                    <Tabs defaultValue="streak" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                                <TabsTrigger value="streak" className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                                    <Flame className="h-4 w-4" />
                                    <span className="hidden sm:inline">Visit Streak</span>
                                    <span className="inline sm:hidden">Streak</span>
                                </TabsTrigger>
                                <TabsTrigger value="projects" className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                                    <Code className="h-4 w-4" />
                                    <span className="hidden sm:inline">Projects</span>
                                    <span className="inline sm:hidden">Projects</span>
                                </TabsTrigger>
                                <TabsTrigger value="referrals" className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                                    <Gift className="h-4 w-4" />
                                    <span>Referrals</span>
                                </TabsTrigger>
                                <TabsTrigger value="contributors" className="flex items-center gap-2 rounded-xl py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800">
                                    <Users className="h-4 w-4" />
                                    <span className="hidden sm:inline">Contributors</span>
                                    <span className="inline sm:hidden">Contrib</span>
                                </TabsTrigger>
                        </TabsList>
                        {
                            Object.entries(leaderboardData).map(([category, data]) => (
                                    <TabsContent key={category} value={category} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {
                                                data.slice(0, 3).map((user, index) => (
                                                    <motion.div
                                                        key={user.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    >
                                                        <Card
                                                            className={cn(
                                                                "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
                                                                user.rank === 1
                                                                    ? "border-yellow-500 bg-gradient-to-br from-yellow-50/80 to-orange-50/80 dark:from-yellow-950/20 dark:to-orange-950/20"
                                                                    : user.rank === 2
                                                                        ? "border-neutral-400 bg-gradient-to-br from-neutral-50/80 to-gray-50/80 dark:from-neutral-900/40 dark:to-gray-900/40"
                                                                        : "border-amber-700 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20"
                                                            )}
                                                        >
                                                            {
                                                                user.rank === 1 && (
                                                                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
                                                                )
                                                            }
                                                            <CardContent className="p-6">
                                                                <div className="flex flex-col items-center text-center space-y-4">
                                                                    <div className="relative">
                                                                        <Avatar className="h-20 w-20 border-4 border-white dark:border-neutral-800 shadow-lg">
                                                                            <AvatarImage src={user.avatar} alt={user.name} />
                                                                            <AvatarFallback className="text-xl font-bold">{user.name.charAt(0)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 shadow-lg">
                                                                            {getRankIcon(user.rank)}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-1">{user.name}</h3>
                                                                        <div className="flex items-center justify-center gap-2">
                                                                            <Badge className={cn(
                                                                                "font-semibold",
                                                                                user.rank === 1 ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white" :
                                                                                    user.rank === 2 ? "bg-neutral-500 text-white" :
                                                                                        "bg-gradient-to-r from-amber-700 to-orange-700 text-white"
                                                                            )}>
                                                                                {user.score} points
                                                                            </Badge>
                                                                            {getChangeIndicator(user.change)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                ))
                                            }
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 }}
                                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl"
                                        >
                                            <div className="space-y-2">
                                                {
                                                    data.slice(3).map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className="group flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 p-4 transition-all duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:shadow-md hover:scale-[1.01]"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                                                    {getRankIcon(user.rank)}
                                                                </div>
                                                                <Avatar className="h-10 w-10 border-2 border-white dark:border-neutral-800">
                                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                                    <AvatarFallback className="font-semibold">{user.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="font-semibold text-neutral-900 dark:text-white">{user.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <Badge variant="secondary" className="font-semibold">
                                                                    {user.score} pts
                                                                </Badge>
                                                                {getChangeIndicator(user.change)}
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </motion.div>
                                    </TabsContent>
                                ))
                            }
                        </Tabs>
                    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {
                                [
                                    { icon: Users, label: "Active Users", value: "12.5K", iconColor: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
                                    { icon: Trophy, label: "Total Points", value: "2.4M", iconColor: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
                                    { icon: Flame, label: "Longest Streak", value: "365 days", iconColor: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
                                    { icon: TrendingUp, label: "Growing", value: "+23%", iconColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`rounded-xl p-2.5 ${stat.iconColor}`}>
                                                <stat.icon className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                                        </div>
                                        <p className="mt-3 text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                                            {stat.value}
                                        </p>
                                    </motion.div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </SmoothScroll>
    )
}