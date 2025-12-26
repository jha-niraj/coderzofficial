"use client";

import { motion } from "framer-motion";
import { Card } from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Zap, TrendingUp, Coins, Flame, Sparkles
} from "lucide-react";

interface GreetingHeaderProps {
    user: {
        id: string;
        name: string | null;
        image: string | null;
        credits: number;
        currentXp: number;
        totalXp: number;
        currentLevel: number;
        currentStreak: number;
        longestStreak: number;
        _count: {
            followers: number;
            following: number;
        };
    } | null;
}

export default function GreetingHeader({ user }: GreetingHeaderProps) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const firstName = user?.name?.split(" ")[0] || "Coder";

    const stats = [
        {
            icon: Zap,
            label: "Total XP",
            value: user?.totalXp?.toLocaleString() || "0",
            color: "from-yellow-500 to-orange-500",
            bgColor: "bg-yellow-500/10",
        },
        {
            icon: TrendingUp,
            label: "Level",
            value: user?.currentLevel?.toString() || "1",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-500/10",
        },
        {
            icon: Coins,
            label: "Credits",
            value: user?.credits?.toLocaleString() || "0",
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-500/10",
        },
        {
            icon: Flame,
            label: "Streak",
            value: `${user?.currentStreak || 0} days`,
            color: "from-red-500 to-pink-500",
            bgColor: "bg-red-500/10",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                    <AvatarFallback className="text-lg font-bold">
                        {firstName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold">
                            {getGreeting()}, {firstName}!
                        </h1>
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                        >
                            <Sparkles className="h-6 w-6 text-yellow-500" />
                        </motion.div>
                    </div>
                    <p className="text-muted-foreground">
                        Ready to continue your learning journey?
                    </p>
                </div>
            </motion.div>
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                {
                    stats.map((stat) => (
                        <motion.div key={stat.label} variants={itemVariants}>
                            <Card
                                className={`relative overflow-hidden p-4 ${stat.bgColor} border-0 backdrop-blur-sm`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                    <div
                                        className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}
                                    >
                                        <stat.icon className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                                <div
                                    className={`absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-xl`}
                                />
                            </Card>
                        </motion.div>
                    ))
                }
            </motion.div>
        </motion.div>
    );
}