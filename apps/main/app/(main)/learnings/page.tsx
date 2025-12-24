"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    GraduationCap, FolderKanban, Lightbulb, Film, Mic2, Users,
    ChevronRight, Flame, Clock, Trophy, TrendingUp, Loader2,
    CheckCircle2, Play
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { getLearningsSummary } from "@/actions/(main)/learnings/learnings.action";
import { cn } from "@repo/ui/lib/utils";

const moduleConfig = {
    projects: {
        icon: FolderKanban,
        label: "Projects",
        href: "/learnings/projects",
        gradient: "from-orange-500 to-red-500",
        bg: "bg-orange-500/10",
    },
    concepts: {
        icon: Lightbulb,
        label: "Concepts",
        href: "/learnings/concepts",
        gradient: "from-blue-500 to-cyan-500",
        bg: "bg-blue-500/10",
    },
    studio: {
        icon: Film,
        label: "Studio",
        href: "/learnings/studio",
        gradient: "from-purple-500 to-pink-500",
        bg: "bg-purple-500/10",
    },
    mock: {
        icon: Mic2,
        label: "Mock Interviews",
        href: "/learnings/mock",
        gradient: "from-green-500 to-emerald-500",
        bg: "bg-green-500/10",
    },
    collectives: {
        icon: Users,
        label: "Communities",
        href: "/learnings/communities",
        gradient: "from-amber-500 to-yellow-500",
        bg: "bg-amber-500/10",
    },
};

export default function LearningsPage() {
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getLearningsSummary();
                if (result.success && result.data) {
                    setSummary(result.data);
                }
            } catch (error) {
                console.error("Error loading learnings:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-200 opacity-20 blur-[100px] dark:bg-blue-800" />

                <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-neutral-300 dark:border-neutral-700">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            Your Learning Journey
                        </Badge>

                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
                            My Learnings
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            Track your progress across all modules. Keep learning, keep growing.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Overview */}
            <section className="max-w-6xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        {
                            label: "In Progress",
                            value: summary?.totalItemsInProgress || 0,
                            icon: Play,
                            color: "text-blue-500",
                            bg: "bg-blue-500/10",
                        },
                        {
                            label: "Completed",
                            value: summary?.totalCompleted || 0,
                            icon: CheckCircle2,
                            color: "text-green-500",
                            bg: "bg-green-500/10",
                        },
                        {
                            label: "Day Streak",
                            value: summary?.currentStreak || 0,
                            icon: Flame,
                            color: "text-orange-500",
                            bg: "bg-orange-500/10",
                        },
                        {
                            label: "Learning Time",
                            value: `${Math.round((summary?.totalLearningTime || 0) / 60)}m`,
                            icon: Clock,
                            color: "text-purple-500",
                            bg: "bg-purple-500/10",
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                        >
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                            </div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {stat.value}
                            </p>
                            <p className="text-sm text-neutral-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Module Cards */}
            <section className="max-w-6xl mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                        Learning Modules
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(moduleConfig).map(([key, config], index) => {
                        const moduleData = summary?.modules?.[key as keyof typeof summary.modules];
                        const Icon = config.icon;

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                            >
                                <Link href={config.href}>
                                    <div className="group p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center", config.gradient)}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                                        </div>

                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                            {config.label}
                                        </h3>

                                        {key === "projects" && moduleData && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                    <span>{moduleData.inProgress} in progress</span>
                                                    <span>{moduleData.completed} completed</span>
                                                </div>
                                                {moduleData.recent?.[0] && (
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                        Recent: {moduleData.recent[0].title}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {key === "concepts" && moduleData && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                    <span>{moduleData.learning} learning</span>
                                                    <span>{moduleData.completed} completed</span>
                                                </div>
                                                {moduleData.recent?.[0] && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                                                            <span>{moduleData.recent[0].title}</span>
                                                            <span>{moduleData.recent[0].progress}%</span>
                                                        </div>
                                                        <Progress value={moduleData.recent[0].progress} className="h-1.5" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {key === "mock" && moduleData && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                    <span>{moduleData.sessions} sessions</span>
                                                    <span>Avg: {moduleData.avgScore}%</span>
                                                </div>
                                            </div>
                                        )}

                                        {key === "collectives" && moduleData && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                    <span>{moduleData.memberships} communities</span>
                                                </div>
                                            </div>
                                        )}

                                        {key === "studio" && (
                                            <p className="text-sm text-neutral-500">
                                                Coming soon
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Recent Activity */}
            <section className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                        Recent Activity
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
                >
                    {summary?.recentActivity?.length > 0 ? (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {summary.recentActivity.map((activity: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                        activity.type === "concept" && "bg-blue-500/10",
                                        activity.type === "project" && "bg-orange-500/10",
                                        activity.type === "mock" && "bg-green-500/10",
                                    )}>
                                        {activity.type === "concept" && <Lightbulb className="h-5 w-5 text-blue-500" />}
                                        {activity.type === "project" && <FolderKanban className="h-5 w-5 text-orange-500" />}
                                        {activity.type === "mock" && <Mic2 className="h-5 w-5 text-green-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-neutral-900 dark:text-white truncate">
                                            {activity.title}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {activity.action === "completed" && "Completed"}
                                            {activity.action === "learning" && `${activity.progress}% progress`}
                                            {activity.action === "working" && "Working on"}
                                        </p>
                                    </div>
                                    <p className="text-xs text-neutral-400">
                                        {new Date(activity.date).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <TrendingUp className="h-12 w-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                                No activity yet
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Start learning to see your progress here
                            </p>
                            <Button asChild>
                                <Link href="/concepts">
                                    Start Learning
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </motion.div>
            </section>
        </div>
    );
}
