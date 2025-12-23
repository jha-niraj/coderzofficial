"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp, Crown, Users, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface LeaderboardPositionProps {
    rank: {
        position: number;
        totalUsers: number;
        percentile: number;
    };
}

export default function LeaderboardPosition({ rank }: LeaderboardPositionProps) {
    const getRankIcon = (position: number) => {
        if (position === 1) return "🥇";
        if (position === 2) return "🥈";
        if (position === 3) return "🥉";
        return "🏆";
    };

    const getRankColor = (position: number) => {
        if (position === 1) return "from-yellow-500 to-amber-500";
        if (position === 2) return "from-gray-400 to-gray-500";
        if (position === 3) return "from-orange-400 to-orange-600";
        return "from-blue-500 to-indigo-500";
    };

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                        </div>
                        <CardTitle className="text-lg">Leaderboard</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/leaderboard">
                            View <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="text-4xl"
                            >
                                {getRankIcon(rank.position)}
                            </motion.div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold">
                                        #{rank.position}
                                    </span>
                                    {
                                        rank.position <= 10 && (
                                            <Crown className="h-5 w-5 text-yellow-500" />
                                        )
                                    }
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Your current rank
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{rank.totalUsers.toLocaleString()}</span>
                            </div>
                            <p className="text-lg font-semibold text-green-500">
                                Top {100 - rank.percentile}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Top 100%</span>
                            <span>Top 1%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${rank.percentile}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r ${getRankColor(
                                    rank.position
                                )} rounded-full`}
                            />
                        </div>
                    </div>
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl" />
                </motion.div>
            </CardContent>
        </Card>
    );
}