"use client";

import { motion } from 'framer-motion';
import {
    LayoutDashboard, Sparkles, Rocket, Target
} from 'lucide-react';
import CreateSpaceButton from './create-space-button';

export default function SpaceDashboardHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                            <LayoutDashboard className="w-8 h-8 text-white" />
                        </div>
                        Space Dashboard
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        Your collaborative learning hub. Track progress, join communities, and build your journey together.
                    </p>
                </div>
                <CreateSpaceButton size="lg" className="shrink-0" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                <QuickActionCard
                    icon={<Sparkles className="w-5 h-5" />}
                    title="Create a Space"
                    description="Start a new learning journey"
                    gradient="from-violet-500 to-purple-600"
                />
                <QuickActionCard
                    icon={<Rocket className="w-5 h-5" />}
                    title="Explore Public"
                    description="Discover community spaces"
                    gradient="from-blue-500 to-cyan-600"
                    href="/space/allspaces"
                />
                <QuickActionCard
                    icon={<Target className="w-5 h-5" />}
                    title="Track Progress"
                    description="See your learning stats"
                    gradient="from-emerald-500 to-teal-600"
                />
            </motion.div>
        </motion.div>
    );
}

function QuickActionCard({
    icon,
    title,
    description,
    gradient,
    href
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
    href?: string;
}) {
    const Wrapper = href ? 'a' : 'div';

    return (
        <Wrapper
            href={href}
            className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
            </div>
        </Wrapper>
    );
}