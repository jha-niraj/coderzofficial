"use client";

import { motion } from 'framer-motion';

export default function AnalyticsSkeleton() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-3" />
                    <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-2" />
                    <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {
                    [1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                                    <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                                    <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                                </div>
                                <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {
                    [1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                            <div className="space-y-1">
                                <div className="h-5 w-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                                <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="space-y-2 mb-6">
                        <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        {
                            [1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
                                >
                                    <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between">
                                            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                            <div className="h-4 w-8 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                        </div>
                                        <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                        <div className="flex justify-between">
                                            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="space-y-2 mb-6">
                        <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        {
                            [1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                        <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6">
                <div className="space-y-2 mb-6">
                    <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
                <div className="space-y-4">
                    {
                        [1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
                            >
                                <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="h-8 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                    <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </motion.div>
    );
}