"use client";

import { motion } from 'framer-motion';

export default function StudiosListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {
                [1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                    >
                        <div className="h-2 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
                                    <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                                </div>
                                <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                            </div>
                            <div className="mb-4">
                                <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
                                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                {
                                    [1, 2, 3].map((j) => (
                                        <div key={j} className="flex items-center gap-1">
                                            <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                            <div className="w-6 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
                                    <div className="w-20 h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                                </div>
                                <div className="w-16 h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                ))
            }
        </div>
    );
}


