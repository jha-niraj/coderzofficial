"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@repo/ui/lib/utils';
import { STUDIO_CATEGORIES } from '@/types/studio';

const categoryColors: Record<string, string> = {
    PROGRAMMING: 'from-blue-500 to-cyan-600',
    WEB_DEVELOPMENT: 'from-emerald-500 to-teal-600',
    DATA_SCIENCE: 'from-purple-500 to-violet-600',
    MOBILE_DEVELOPMENT: 'from-orange-500 to-red-600',
    DEVOPS: 'from-indigo-500 to-blue-600',
    DATABASE: 'from-slate-500 to-gray-600',
    SECURITY: 'from-red-500 to-rose-600',
    AI_ML: 'from-fuchsia-500 to-purple-600',
    CLOUD: 'from-sky-500 to-cyan-600',
    SYSTEM_DESIGN: 'from-amber-500 to-orange-600',
    DSA: 'from-lime-500 to-green-600',
    INTERVIEW_PREP: 'from-pink-500 to-rose-600',
    OTHER: 'from-neutral-500 to-gray-600',
};

export default function CategoryTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category') || 'all';

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === 'all') {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        params.delete('page'); // Reset page when changing category
        router.push(pathname + '?' + params.toString());
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 overflow-x-auto scrollbar-hide"
        >
            <div className="flex gap-2 pb-2">
                <button
                    onClick={() => handleCategoryClick('all')}
                    className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                        currentCategory === 'all'
                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    )}
                >
                    All
                </button>
                {
                    STUDIO_CATEGORIES.map((category) => (
                        <button
                            key={category.value}
                            onClick={() => handleCategoryClick(category.value)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                currentCategory === category.value
                                    ? `bg-gradient-to-r ${categoryColors[category.value]} text-white`
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            )}
                        >
                            {category.label}
                        </button>
                    ))
                }
            </div>
        </motion.div>
    );
}


