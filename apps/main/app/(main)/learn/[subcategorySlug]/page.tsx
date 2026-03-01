'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    BookOpen, Clock, ChevronRight, Trophy, Users, CheckCircle2,
    BarChart3, ArrowLeft, TrendingUp
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { LearnDifficulty } from "@repo/prisma/client";
import {
    getSubCategoryLearns, getSubCategoryLeaderboard
} from "@/actions/(main)/learn/learn.action";

const difficultyConfig: Record<LearnDifficulty, { label: string; color: string; bg: string }> = {
    BEGINNER: { label: "Beginner", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
    INTERMEDIATE: { label: "Intermediate", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
    ADVANCED: { label: "Advanced", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
    EXPERT: { label: "Expert", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
};

interface LearnItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    difficulty: LearnDifficulty;
    estimatedTime: number | null;
    iconEmoji: string | null;
    unitNumber: number | null;
    unitTitle: string | null;
    tags: string[];
    _count: { steps: number };
    progress?: { progressPercent: number; isCompleted: boolean } | null;
}

interface LeaderboardEntry {
    id: string;
    userId: string;
    totalScore: number;
    quizScore: number;
    challengeScore: number;
    mockScore: number;
    learnsCompleted: number;
    quizzesCompleted?: number;
    rank: number | null;
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    };
}

interface SubCategoryData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    mainCategory: { name: string; slug: string } | null;
}

export default function SubCategoryPage() {
    const params = useParams();
    const subcategorySlug = params.subcategorySlug as string;

    const [isLoading, setIsLoading] = useState(true);
    const [learns, setLearns] = useState<LearnItem[]>([]);
    const [subCategory, setSubCategory] = useState<SubCategoryData | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [stats, setStats] = useState({ totalLearns: 0, totalSteps: 0, usersEnrolled: 0, avgCompletion: 0 });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [learnsResult, leaderboardResult] = await Promise.all([
                getSubCategoryLearns(subcategorySlug),
                getSubCategoryLeaderboard(subcategorySlug),
            ]);

            if (learnsResult.subCategory) setSubCategory(learnsResult.subCategory);
            setLearns(learnsResult.learns || []);
            setLeaderboard(leaderboardResult.leaderboard || []);
            setStats(learnsResult.stats || { totalLearns: 0, totalSteps: 0, usersEnrolled: 0, avgCompletion: 0 });
        } catch (error) {
            console.error("Failed to load subcategory data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [subcategorySlug]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Group learns by unit
    const unitGroups = learns.reduce<Record<string, LearnItem[]>>((acc, learn) => {
        const key = learn.unitTitle || `Unit ${learn.unitNumber || 0}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(learn);
        return acc;
    }, {});

    if (isLoading) return <SubCategorySkeleton />;

    if (!subCategory) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Not Found</h2>
                    <p className="text-muted-foreground mb-4">This course was not found.</p>
                    <Link href="/learn"><Button>Back to Learns</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white dark:bg-neutral-950">
            {/* Main Content - Left 2/3 */}
            <main className="flex-1 overflow-auto w-2/3">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Link href="/learn" className="hover:text-foreground transition-colors flex items-center gap-1">
                                <ArrowLeft className="w-4 h-4" />
                                Learns
                            </Link>
                            {subCategory.mainCategory && (
                                <>
                                    <ChevronRight className="w-3 h-3" />
                                    <span>{subCategory.mainCategory.name}</span>
                                </>
                            )}
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-foreground font-medium">{subCategory.name}</span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                style={{ backgroundColor: `${subCategory.color || '#3B82F6'}20` }}>
                                {subCategory.icon || '📚'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {subCategory.name}
                                </h1>
                                {subCategory.description && (
                                    <p className="text-neutral-500 mt-1">{subCategory.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { icon: BookOpen, label: "Topics", value: stats.totalLearns, color: "text-blue-500" },
                                { icon: BarChart3, label: "Steps", value: stats.totalSteps, color: "text-purple-500" },
                                { icon: Users, label: "Enrolled", value: stats.usersEnrolled, color: "text-green-500" },
                                { icon: TrendingUp, label: "Avg Completion", value: `${stats.avgCompletion}%`, color: "text-orange-500" },
                            ].map((stat, i) => (
                                <Card key={i} className="p-3 bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2">
                                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                                        <div>
                                            <p className="text-lg font-bold">{stat.value}</p>
                                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Units & Learns */}
                    <div className="space-y-8">
                        {Object.entries(unitGroups).map(([unitTitle, unitLearns], unitIdx) => (
                            <motion.div
                                key={unitTitle}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: unitIdx * 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                                        {unitIdx + 1}
                                    </div>
                                    <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                                        {unitTitle}
                                    </h2>
                                    <Badge variant="outline" className="text-xs">{unitLearns.length} topics</Badge>
                                </div>

                                <div className="space-y-3 ml-4 pl-7 border-l-2 border-neutral-200 dark:border-neutral-800">
                                    {unitLearns.map((learn, learnIdx) => {
                                        const isCompleted = learn.progress?.isCompleted;
                                        const inProgress = learn.progress && !learn.progress.isCompleted && learn.progress.progressPercent > 0;
                                        const progressPercent = learn.progress?.progressPercent || 0;

                                        return (
                                            <motion.div
                                                key={learn.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: unitIdx * 0.1 + learnIdx * 0.05 }}
                                            >
                                                <Link href={`/learn/${subcategorySlug}/${learn.slug}`}>
                                                    <Card className={cn(
                                                        "group hover:shadow-md transition-all duration-300 cursor-pointer border-neutral-200 dark:border-neutral-800",
                                                        isCompleted && "border-green-300 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10",
                                                        inProgress && "border-blue-300 dark:border-blue-800"
                                                    )}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-4">
                                                                {/* Status Icon */}
                                                                <div className={cn(
                                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0",
                                                                    isCompleted
                                                                        ? "bg-green-100 dark:bg-green-900/30"
                                                                        : "bg-neutral-100 dark:bg-neutral-800"
                                                                )}>
                                                                    {isCompleted ? (
                                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                                    ) : (
                                                                        <span>{learn.iconEmoji || '📖'}</span>
                                                                    )}
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                                                                            {learn.title}
                                                                        </h3>
                                                                    </div>
                                                                    <p className="text-xs text-neutral-500 line-clamp-1 mb-2">
                                                                        {learn.description}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                                        <Badge className={cn(difficultyConfig[learn.difficulty].bg, difficultyConfig[learn.difficulty].color, "text-[10px] h-5")}>
                                                                            {difficultyConfig[learn.difficulty].label}
                                                                        </Badge>
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {learn.estimatedTime || 15}m
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <BookOpen className="w-3 h-3" />
                                                                            {learn._count.steps} steps
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Progress */}
                                                                <div className="shrink-0 w-24">
                                                                    {inProgress ? (
                                                                        <div className="space-y-1">
                                                                            <div className="flex justify-between text-xs">
                                                                                <span className="text-blue-600">In Progress</span>
                                                                                <span className="font-medium">{Math.round(progressPercent)}%</span>
                                                                            </div>
                                                                            <Progress value={progressPercent} className="h-1.5" />
                                                                        </div>
                                                                    ) : isCompleted ? (
                                                                        <div className="text-center">
                                                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Done
                                                                            </Badge>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-center">
                                                                            <Button size="sm" variant="outline" className="text-xs h-7">
                                                                                Start
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Leaderboard - Right 1/3 */}
            <aside className="w-1/3 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-auto hidden lg:block">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-bold">Leaderboard</h2>
                    </div>

                    {/* Top 3 Podium */}
                    {leaderboard.length >= 3 && (
                        <div className="flex items-end justify-center gap-3 mb-6">
                            {/* 2nd Place */}
                            <div className="text-center">
                                <Avatar className="w-12 h-12 mx-auto ring-2 ring-neutral-300 mb-1">
                                    <AvatarImage src={leaderboard[1]?.user.image || ''} />
                                    <AvatarFallback className="bg-neutral-200 text-sm">{leaderboard[1]?.user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-t-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-xs font-bold">🥈</p>
                                        <p className="text-[10px] font-semibold">{leaderboard[1]?.totalScore}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] mt-1 truncate max-w-16">{leaderboard[1]?.user.name}</p>
                            </div>
                            {/* 1st Place */}
                            <div className="text-center">
                                <Avatar className="w-14 h-14 mx-auto ring-2 ring-yellow-400 mb-1">
                                    <AvatarImage src={leaderboard[0]?.user.image || ''} />
                                    <AvatarFallback className="bg-yellow-100 text-sm">{leaderboard[0]?.user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="w-16 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-t-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-sm font-bold">🥇</p>
                                        <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{leaderboard[0]?.totalScore}</p>
                                    </div>
                                </div>
                                <p className="text-xs mt-1 font-semibold truncate max-w-16">{leaderboard[0]?.user.name}</p>
                            </div>
                            {/* 3rd Place */}
                            <div className="text-center">
                                <Avatar className="w-12 h-12 mx-auto ring-2 ring-amber-600 mb-1">
                                    <AvatarImage src={leaderboard[2]?.user.image || ''} />
                                    <AvatarFallback className="bg-amber-100 text-sm">{leaderboard[2]?.user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="w-16 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-t-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-xs font-bold">🥉</p>
                                        <p className="text-[10px] font-semibold">{leaderboard[2]?.totalScore}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] mt-1 truncate max-w-16">{leaderboard[2]?.user.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Full List */}
                    <div className="space-y-2">
                        {leaderboard.map((entry, idx) => (
                            <div
                                key={entry.id}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                    idx < 3 ? "bg-yellow-50/50 dark:bg-yellow-950/10" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                )}
                            >
                                <span className={cn(
                                    "w-6 text-center font-bold text-sm",
                                    idx === 0 ? "text-yellow-500" : idx === 1 ? "text-neutral-400" : idx === 2 ? "text-amber-600" : "text-neutral-500"
                                )}>
                                    {idx + 1}
                                </span>
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={entry.user.image || ''} />
                                    <AvatarFallback className="text-xs">{entry.user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{entry.user.name}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        <span>{entry.learnsCompleted} completed</span>
                                        <span>·</span>
                                        <span>{entry.quizzesCompleted || 0} quizzes</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{entry.totalScore}</p>
                                    <p className="text-[10px] text-muted-foreground">pts</p>
                                </div>
                            </div>
                        ))}

                        {leaderboard.length === 0 && (
                            <div className="text-center py-12">
                                <Trophy className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-neutral-500">No rankings yet</p>
                                <p className="text-xs text-neutral-400 mt-1">Complete quizzes and challenges to appear here!</p>
                            </div>
                        )}
                    </div>

                    {/* Course Stats */}
                    <div className="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-500" /> Course Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Topics</span>
                                <span className="font-medium">{stats.totalLearns}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Steps</span>
                                <span className="font-medium">{stats.totalSteps}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Students Enrolled</span>
                                <span className="font-medium">{stats.usersEnrolled}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Avg Completion</span>
                                <span className="font-medium">{stats.avgCompletion}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function SubCategorySkeleton() {
    return (
        <div className="flex h-screen">
            <main className="flex-1 p-8 space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-16 w-full" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
            </main>
            <aside className="w-1/3 border-l p-6 space-y-4 hidden lg:block">
                <Skeleton className="h-6 w-32" />
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14" />)}
            </aside>
        </div>
    );
}