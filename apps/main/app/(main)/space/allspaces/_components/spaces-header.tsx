"use client";

import { motion } from 'framer-motion';
import {
    Orbit, Sparkles, TrendingUp, Users
} from 'lucide-react';
import CreateSpaceButton from '../../_components/create-space-button';

interface SpacesHeaderProps {
    stats?: {
        totalSpaces: number;
        totalLearners: number;
        averageCompletion: number;
    };
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
}

export default function SpacesHeader({ stats }: SpacesHeaderProps) {
    const totalSpaces = stats?.totalSpaces ?? 0;
    const totalLearners = stats?.totalLearners ?? 0;
    const avgCompletion = stats?.averageCompletion ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <Orbit className="w-8 h-8 text-white" />
                        </div>
                        Discover Spaces
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        Explore public learning spaces created by the community. Learn together, track progress, and build your journey.
                    </p>
                </div>
                <CreateSpaceButton size="lg" className="shrink-0" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800"
            >
                <div className="flex items-center gap-3 px-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {totalSpaces > 0 ? formatNumber(totalSpaces) : '0'}
                        </p>
                        <p className="text-xs text-neutral-500">Active Spaces</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 border-x border-neutral-200 dark:border-neutral-800">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {totalLearners > 0 ? formatNumber(totalLearners) : '0'}
                        </p>
                        <p className="text-xs text-neutral-500">Learners</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {avgCompletion > 0 ? `${avgCompletion}%` : '0%'}
                        </p>
                        <p className="text-xs text-neutral-500">Avg. Progress</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}