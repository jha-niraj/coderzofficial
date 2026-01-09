"use client";

import { motion } from 'framer-motion';
import { Folder, FileText, BookOpen, Code } from 'lucide-react';
import CreateStudioSheet from '../../_components/create-studio-sheet';

export default function MyStudiosHeader() {
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
                            <Folder className="w-8 h-8 text-white" />
                        </div>
                        My Studios
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        All your personal learning workspaces in one place. Organize, manage, and continue your learning journey.
                    </p>
                </div>
                <CreateStudioSheet />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4"
            >
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            All Studios
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Your complete collection of learning workspaces
                    </p>
                </div>
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Quizzes Created
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        AI-powered assessments across studios
                    </p>
                </div>
                <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-950 rounded-lg">
                            <Code className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Code Snippets
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Saved code blocks and examples
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}


