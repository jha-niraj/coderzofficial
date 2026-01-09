"use client";

import { motion } from 'framer-motion';
import { FileText, Sparkles, BookOpen, Brain } from 'lucide-react';
import CreateStudioSheet from './create-studio-sheet';

export default function StudioDashboardHeader() {
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
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        Studio
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        Your AI-powered learning workspace. Create notes, generate quizzes, flashcards, and more.
                    </p>
                </div>
                <CreateStudioSheet />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
                <QuickActionCard
                    icon={<Sparkles className="w-5 h-5" />}
                    title="Create Studio"
                    description="Start a new learning workspace"
                    gradient="from-blue-500 to-purple-600"
                />
                <QuickActionCard
                    icon={<BookOpen className="w-5 h-5" />}
                    title="Generate Quiz"
                    description="AI-powered quiz creation"
                    gradient="from-emerald-500 to-teal-600"
                />
                <QuickActionCard
                    icon={<Brain className="w-5 h-5" />}
                    title="Flashcards"
                    description="Learn with spaced repetition"
                    gradient="from-amber-500 to-orange-600"
                />
            </motion.div>
        </motion.div>
    );
}

function QuickActionCard({
    icon,
    title,
    description,
    gradient
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <div className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}


