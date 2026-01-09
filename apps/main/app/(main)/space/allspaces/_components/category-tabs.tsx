"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/ui/lib/utils';

const categories = [
    { value: 'all', label: 'All', emoji: '🌟', href: '/space/allspaces' },
    { value: 'FRONTEND', label: 'Frontend', emoji: '🎨', href: '/space/category/frontend' },
    { value: 'BACKEND', label: 'Backend', emoji: '⚙️', href: '/space/category/backend' },
    { value: 'DSA', label: 'DSA', emoji: '🧮', href: '/space/category/dsa' },
    { value: 'SYSTEM_DESIGN', label: 'System Design', emoji: '🏗️', href: '/space/category/system-design' },
    { value: 'AI_ML', label: 'AI/ML', emoji: '🤖', href: '/space/category/ai-ml' },
    { value: 'DEVOPS', label: 'DevOps', emoji: '🔧', href: '/space/category/devops' },
    { value: 'MOBILE', label: 'Mobile', emoji: '📱', href: '/space/category/mobile' },
    { value: 'INTERVIEW_PREP', label: 'Interview', emoji: '💼', href: '/space/category/interview-prep' },
    { value: 'PROJECT_BASED', label: 'Projects', emoji: '🎯', href: '/space/category/project-based' },
];

export default function CategoryTabs() {
    const pathname = usePathname();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
        >
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {
                    categories.map((category) => {
                        const isActive = pathname === category.href ||
                            (category.value === 'all' && pathname === '/space/allspaces');

                        return (
                            <Link
                                key={category.value}
                                href={category.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium",
                                    isActive
                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                )}
                            >
                                <span>{category.emoji}</span>
                                <span>{category.label}</span>
                            </Link>
                        );
                    })
                }
            </div>
        </motion.div>
    );
}