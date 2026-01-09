"use client";

import { motion } from 'framer-motion';
import { Globe, Sparkles, TrendingUp, Users } from 'lucide-react';
import CreateStudioSheet from '../../_components/create-studio-sheet';

export default function AllStudiosHeader() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                            <Globe className="w-8 h-8 text-white" />
                        </div>
                        Discover Studios
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        Explore public learning workspaces created by the community. Learn from others and share your knowledge.
                    </p>
                </div>
                <CreateStudioSheet />
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
                            1.2k+
                        </p>
                        <p className="text-xs text-neutral-500">Public Studios</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 border-x border-neutral-200 dark:border-neutral-800">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950 rounded-lg">
                        <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                            5k+
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
                            10k+
                        </p>
                        <p className="text-xs text-neutral-500">Quizzes Created</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}


