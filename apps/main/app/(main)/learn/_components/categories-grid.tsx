"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Category {
    id: string;
    name: string;
    description?: string;
    _count: {
        learns: number;
    };
}

interface CategoriesGridProps {
    categories: Category[];
}

// Helper to get a consistent color from a string
function getCategoryColor(category: string) {
    const colors = [
        { color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30", emoji: "🌐" },
        { color: "text-cyan-600", bgColor: "bg-cyan-50 dark:bg-cyan-950/30", emoji: "📱" },
        { color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30", emoji: "🗂️" },
        { color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", emoji: "🧮" },
        { color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30", emoji: "🏗️" },
        { color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", emoji: "🗃️" },
        { color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30", emoji: "🔧" },
        { color: "text-sky-600", bgColor: "bg-sky-50 dark:bg-sky-950/30", emoji: "☁️" },
        { color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-950/30", emoji: "🤖" },
        { color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/30", emoji: "🧠" },
        { color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30", emoji: "🔐" },
        { color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", emoji: "⛓️" },
        { color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30", emoji: "📚" },
        { color: "text-violet-600", bgColor: "bg-violet-50 dark:bg-violet-950/30", emoji: "🏛️" },
        { color: "text-teal-600", bgColor: "bg-teal-50 dark:bg-teal-950/30", emoji: "🔌" },
        { color: "text-lime-600", bgColor: "bg-lime-50 dark:bg-lime-950/30", emoji: "🧪" },
        { color: "text-fuchsia-600", bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30", emoji: "📝" },
    ];

    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
    if (!categories || categories.length === 0) return null;

    // Sort by count
    const sortedCategories = [...categories].sort((a, b) => (b._count?.learns || 0) - (a._count?.learns || 0));
    const displayCategories = sortedCategories.slice(0, 8);

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                        Browse by Category
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                        Explore Learns organized by topic
                    </p>
                </div>
                <Link
                    href="/learn"
                    className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-white hover:underline"
                >
                    View all
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {
                    displayCategories.map((cat, index) => {
                        const style = getCategoryColor(cat.name);
                        return (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Link href={`/learn?mainCategory=${cat.id}`}>
                                    <div
                                        className="group p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-200 cursor-pointer h-full"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-12 h-12 rounded-xl ${style?.bgColor} flex items-center justify-center`}>
                                                <span className="text-2xl">{style?.emoji}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors line-clamp-1">
                                            {cat.name}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                            {cat._count?.learns || 0} Learns
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })
                }
            </div>
            <div className="mt-6 text-center">
                <Link href="/learn">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Explore all {categories.length} categories
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </Link>
            </div>
        </section>
    );
}