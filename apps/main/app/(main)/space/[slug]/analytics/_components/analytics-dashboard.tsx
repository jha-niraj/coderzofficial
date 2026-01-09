"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    BarChart3, Users, Eye, TrendingUp, Clock, CheckCircle2, ArrowLeft,
    Download, GitBranch, MessageSquare, Heart, Activity,
    Target
} from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card';
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar';
import { Progress } from '@repo/ui/components/ui/progress';
import { getSpaceAnalytics } from '@/actions/(main)/space/analytics.action';

interface AnalyticsDashboardProps {
    spaceId: string;
    spaceSlug: string;
    spaceTitle: string;
}

interface SpaceAnalytics {
    overview: {
        totalMembers: number;
        activeMembers: number;
        totalViews: number;
        totalSteps: number;
        totalBranches: number;
        totalComments: number;
        totalLikes: number;
        averageProgress: number;
        averageTimeSpent: number;
        completionRate: number;
    };
    memberProgress: Array<{
        id: string;
        user: {
            id: string;
            name: string | null;
            username: string | null;
            image: string | null;
        };
        progressPercent: number;
        completedSteps: string[];
        totalTimeSpent: number;
        lastActiveAt: Date;
        isActive: boolean;
    }>;
    stepAnalytics: Array<{
        id: string;
        title: string;
        order: number;
        completionCount: number;
        averageTimeSpent: number | null;
        completionRate: number;
    }>;
    recentActivities: Array<{
        id: string;
        type: string;
        user: {
            id: string;
            name: string | null;
            username: string | null;
            image: string | null;
        };
        createdAt: Date;
    }>;
}

export default function AnalyticsDashboard({ spaceId, spaceSlug, spaceTitle }: AnalyticsDashboardProps) {
    const [analytics, setAnalytics] = useState<SpaceAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            const result = await getSpaceAnalytics(spaceId);
            if (result.success && result.data) {
                setAnalytics(result.data as SpaceAnalytics);
            }
            setLoading(false);
        }
        fetchAnalytics();
    }, [spaceId]);

    if (loading) {
        return <AnalyticsLoading />;
    }

    if (!analytics) {
        return (
            <div className="text-center py-12">
                <p className="text-neutral-600 dark:text-neutral-400">
                    Unable to load analytics. Please try again later.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        href={`/space/${spaceSlug}`}
                        className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-3 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Space
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                            <BarChart3 className="w-7 h-7 text-white" />
                        </div>
                        Analytics
                    </h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                        {spaceTitle}
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export Report
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Members"
                    value={analytics.overview.totalMembers}
                    icon={Users}
                    color="blue"
                    change={`${analytics.overview.activeMembers} active`}
                />
                <StatCard
                    title="Total Views"
                    value={analytics.overview.totalViews}
                    icon={Eye}
                    color="emerald"
                />
                <StatCard
                    title="Avg Progress"
                    value={`${Math.round(analytics.overview.averageProgress)}%`}
                    icon={TrendingUp}
                    color="violet"
                />
                <StatCard
                    title="Completion Rate"
                    value={`${Math.round(analytics.overview.completionRate)}%`}
                    icon={CheckCircle2}
                    color="amber"
                />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <MiniStatCard
                    title="Steps"
                    value={analytics.overview.totalSteps}
                    icon={Target}
                />
                <MiniStatCard
                    title="Branches"
                    value={analytics.overview.totalBranches}
                    icon={GitBranch}
                />
                <MiniStatCard
                    title="Comments"
                    value={analytics.overview.totalComments}
                    icon={MessageSquare}
                />
                <MiniStatCard
                    title="Likes"
                    value={analytics.overview.totalLikes}
                    icon={Heart}
                />
                <MiniStatCard
                    title="Avg Time"
                    value={formatTime(analytics.overview.averageTimeSpent)}
                    icon={Clock}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Member Progress
                        </CardTitle>
                        <CardDescription>
                            Track individual member progress through the space
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {
                                analytics.memberProgress.length > 0 ? (
                                    analytics.memberProgress.map((member, index) => (
                                        <motion.div
                                            key={member.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900"
                                        >
                                            <div className="relative">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={member.user.image || undefined} />
                                                    <AvatarFallback>
                                                        {member.user.name?.charAt(0) || member.user.username?.charAt(0) || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {
                                                    member.isActive && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-neutral-900" />
                                                    )
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-medium text-neutral-900 dark:text-white truncate">
                                                        {member.user.name || member.user.username || 'Anonymous'}
                                                    </p>
                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        {Math.round(member.progressPercent)}%
                                                    </span>
                                                </div>
                                                <Progress value={member.progressPercent} className="h-2" />
                                                <div className="flex items-center justify-between mt-1 text-xs text-neutral-500">
                                                    <span>{member.completedSteps.length} steps completed</span>
                                                    <span>{formatTime(member.totalTimeSpent)} spent</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-neutral-500">
                                        No members yet. Share your space to get started!
                                    </div>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-emerald-500" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest actions in your space
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {
                                analytics.recentActivities.length > 0 ? (
                                    analytics.recentActivities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-start gap-3"
                                        >
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={activity.user.image || undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {activity.user.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-medium text-neutral-900 dark:text-white">
                                                        {activity.user.name || activity.user.username || 'Someone'}
                                                    </span>{' '}
                                                    <span className="text-neutral-600 dark:text-neutral-400">
                                                        {formatActivityType(activity.type)}
                                                    </span>
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-0.5">
                                                    {formatTimeAgo(activity.createdAt)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-neutral-500">
                                        No recent activity
                                    </div>
                                )
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-500" />
                        Step Performance
                    </CardTitle>
                    <CardDescription>
                        See how learners are progressing through each step
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {
                            analytics.stepAnalytics.length > 0 ? (
                                analytics.stepAnalytics.map((step, index) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                            {step.order}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-neutral-900 dark:text-white">
                                                {step.title}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    {step.completionCount} completed
                                                </span>
                                                {
                                                    step.averageTimeSpent && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {formatTime(step.averageTimeSpent)} avg
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {Math.round(step.completionRate)}%
                                            </div>
                                            <div className="text-xs text-neutral-500">completion</div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-neutral-500">
                                    No steps added yet. Add steps to track progress!
                                </div>
                            )
                        }
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    color,
    change
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'emerald' | 'violet' | 'amber';
    change?: string;
}) {
    const colors = {
        blue: 'from-blue-500 to-cyan-500',
        emerald: 'from-emerald-500 to-teal-500',
        violet: 'from-violet-500 to-purple-500',
        amber: 'from-amber-500 to-orange-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5"
        >
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors[color]}`} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
                    {
                        change && (
                            <p className="text-xs text-neutral-500 mt-1">{change}</p>
                        )
                    }
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
        </motion.div>
    );
}

function MiniStatCard({
    title,
    value,
    icon: Icon
}: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
}) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <Icon className="w-5 h-5 text-neutral-500" />
            <div>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-xs text-neutral-500">{title}</p>
            </div>
        </div>
    );
}

function AnalyticsLoading() {
    return (
        <div className="space-y-8">
            <div className="h-20 bg-neutral-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />
                    ))
                }
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-neutral-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />
                <div className="h-96 bg-neutral-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />
            </div>
        </div>
    );
}

function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

function formatActivityType(type: string): string {
    const types: Record<string, string> = {
        JOINED: 'joined the space',
        COMPLETED_STEP: 'completed a step',
        CREATED_BRANCH: 'created a branch',
        ADDED_CONTENT: 'added content',
        COMMENTED: 'left a comment',
        LIKED: 'liked something',
        STARTED_PROJECT: 'started a project',
        COMPLETED_PROJECT: 'completed a project',
    };
    return types[type] || 'performed an action';
}