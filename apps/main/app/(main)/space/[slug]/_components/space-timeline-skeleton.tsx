"use client";

import { motion } from 'framer-motion';
import { Skeleton } from '@repo/ui/components/ui/skeleton';

export default function SpaceTimelineSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* Timeline Skeleton */}
            <div className="relative py-4">
                {/* Vertical Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-neutral-200 dark:bg-neutral-800 rounded-full" />

                <div className="relative space-y-6 ml-4">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative flex items-start gap-6"
                        >
                            {/* Node Skeleton */}
                            <div className="relative flex flex-col items-center z-10 shrink-0">
                                <Skeleton className="w-14 h-14 rounded-2xl" />
                                <Skeleton className="mt-2 w-8 h-8 rounded-full" />
                            </div>

                            {/* Card Skeleton */}
                            <div className="flex-1 min-w-0">
                                <div className="p-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                                        <div className="flex-1">
                                            <Skeleton className="h-5 w-3/4 mb-2" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-2/3 mb-3" />
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                        <Skeleton className="h-8 w-16 rounded-md" />
                                        <Skeleton className="h-8 w-24 rounded-md" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
