"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@repo/ui/lib/utils';
import {
    Orbit, Folder, LayoutGrid
} from 'lucide-react';

const tabs = [
    {
        value: 'myspaces',
        label: 'My Spaces',
        icon: Folder,
        href: '/space/myspaces',
        description: 'Your created and joined spaces'
    },
    {
        value: 'allspaces',
        label: 'Discover',
        icon: Orbit,
        href: '/space/allspaces',
        description: 'Explore public spaces'
    },
    {
        value: 'home',
        label: 'Dashboard',
        icon: LayoutGrid,
        href: '/space',
        description: 'Space overview'
    },
];

export default function SpaceTabs() {
    const pathname = usePathname();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
        >
            <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
                {
                    tabs.map((tab) => {
                        const isActive = pathname === tab.href;
                        const Icon = tab.icon;

                        return (
                            <Link
                                key={tab.value}
                                href={tab.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
                                    isActive
                                        ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </Link>
                        );
                    })
                }
            </div>
        </motion.div>
    );
}