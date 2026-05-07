"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function LearnBookmarksPage() {
    return (
        <div className="min-h-screen">
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Lightbulb className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Saved Concepts</h1>
                                <p className="text-neutral-600 dark:text-neutral-400">0 concepts bookmarked</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                    <Lightbulb className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No concept bookmarks</h3>
                    <p className="text-neutral-500">Concept bookmarks will appear here</p>
                </motion.div>
            </div>
        </div>
    );
}
