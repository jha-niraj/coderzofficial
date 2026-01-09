"use client";

import { motion } from 'framer-motion';
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card';
import { Progress } from '@repo/ui/components/ui/progress';
import {
    Users, Flame, BookOpen, Target, Award, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface MetricsData {
    spacesCreated: number;
    spacesJoined: number;
    averageProgress: number;
    completedSteps?: number;
    streak?: number;
}

interface SpacesMetricsProps {
    userId?: string;
    metrics?: MetricsData;
}

// This is a client component wrapper - data should be passed from parent
export default function SpacesMetrics({ userId, metrics }: SpacesMetricsProps) {
    if (!userId) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <Card className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-500" />
                            Your Journey
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                            Sign in to track your learning progress and metrics
                        </p>
                        <Link
                            href="/signin"
                            className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
                        >
                            Sign in →
                        </Link>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // Default metrics if not provided
    const data: MetricsData = metrics || {
        spacesCreated: 0,
        spacesJoined: 0,
        averageProgress: 0,
        completedSteps: 0,
        streak: 0
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
        >
            <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        Your Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                Overall Progress
                            </span>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                {Math.round(data.averageProgress)}%
                            </span>
                        </div>
                        <Progress
                            value={data.averageProgress}
                            className="h-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <MetricItem
                            icon={<BookOpen className="w-4 h-4" />}
                            label="Created"
                            value={data.spacesCreated}
                            color="violet"
                        />
                        <MetricItem
                            icon={<Users className="w-4 h-4" />}
                            label="Joined"
                            value={data.spacesJoined}
                            color="blue"
                        />
                        <MetricItem
                            icon={<Target className="w-4 h-4" />}
                            label="Steps Done"
                            value={data.completedSteps || 0}
                            color="emerald"
                        />
                        <MetricItem
                            icon={<Flame className="w-4 h-4" />}
                            label="Day Streak"
                            value={data.streak || 0}
                            color="orange"
                        />
                    </div>
                </CardContent>
            </Card>
            <Card className="border-neutral-200 dark:border-neutral-800">
                <CardContent className="pt-4">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Quick Tips
                    </h4>
                    <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <li className="flex items-start gap-2">
                            <span className="text-emerald-500">•</span>
                            Complete steps daily to maintain your streak
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            Create branches to personalize your learning
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-violet-500">•</span>
                            Share progress to motivate others
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function MetricItem({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: 'violet' | 'blue' | 'emerald' | 'orange';
}) {
    const colorClasses = {
        violet: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
        blue: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
        orange: 'bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400',
    };

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
            <div className={`p-1.5 rounded ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-xs text-neutral-500">{label}</p>
            </div>
        </div>
    );
}