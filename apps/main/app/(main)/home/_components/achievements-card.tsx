"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Trophy, Medal, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Achievement {
    id: string;
    achievement: {
        id: string;
        name: string;
        description: string;
        icon: string | null;
        xpReward: number;
        rarity: string;
    };
    unlockedAt: Date;
}

interface AchievementsCardProps {
    achievements: Achievement[];
}

export default function AchievementsCard({ achievements }: AchievementsCardProps) {
    const getRarityColor = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case "common":
                return "bg-gray-500/10 text-gray-500 border-gray-500/30";
            case "uncommon":
                return "bg-green-500/10 text-green-500 border-green-500/30";
            case "rare":
                return "bg-blue-500/10 text-blue-500 border-blue-500/30";
            case "epic":
                return "bg-purple-500/10 text-purple-500 border-purple-500/30";
            case "legendary":
                return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
            default:
                return "bg-gray-500/10 text-gray-500 border-gray-500/30";
        }
    };

    const getAchievementIcon = (icon: string | null, rarity: string) => {
        if (icon) return icon;
        switch (rarity.toLowerCase()) {
            case "legendary":
                return "👑";
            case "epic":
                return "💎";
            case "rare":
                return "🌟";
            case "uncommon":
                return "⭐";
            default:
                return "🏅";
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </div>
                        <CardTitle className="text-lg">Achievements</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/profile?tab=achievements">
                            View all <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {
                    achievements.length === 0 ? (
                        <div className="text-center py-6 space-y-2">
                            <Medal className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">
                                No achievements yet. Keep learning!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {
                                achievements.slice(0, 4).map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="text-2xl">
                                            {
                                                getAchievementIcon(
                                                    item.achievement.icon,
                                                    item.achievement.rarity
                                                )
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm truncate">
                                                    {item.achievement.name}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-1.5 py-0 ${getRarityColor(
                                                        item.achievement.rarity
                                                    )}`}
                                                >
                                                    {item.achievement.rarity}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {item.achievement.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end text-xs">
                                            <span className="text-yellow-500 font-medium">
                                                +{item.achievement.xpReward} XP
                                            </span>
                                            <span className="text-muted-foreground">
                                                {formatDate(item.unlockedAt)}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            }
                        </div>
                    )
                }
            </CardContent>
        </Card>
    );
}