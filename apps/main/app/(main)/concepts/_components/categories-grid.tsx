"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConceptCategory } from "@prisma/client";

interface Category {
    category: ConceptCategory;
    _count: number;
}

interface CategoriesGridProps {
    categories: Category[];
}

const categoryConfig: Record<
    ConceptCategory,
    { emoji: string; label: string; color: string; bgColor: string }
> = {
    WEB_DEVELOPMENT: { emoji: "🌐", label: "Web Development", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
    MOBILE_DEVELOPMENT: { emoji: "📱", label: "Mobile Development", color: "text-cyan-600", bgColor: "bg-cyan-50 dark:bg-cyan-950/30" },
    DATA_STRUCTURES: { emoji: "🗂️", label: "Data Structures", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30" },
    ALGORITHMS: { emoji: "🧮", label: "Algorithms", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
    SYSTEM_DESIGN: { emoji: "🏗️", label: "System Design", color: "text-orange-600", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
    DATABASE: { emoji: "🗃️", label: "Database", color: "text-yellow-600", bgColor: "bg-yellow-50 dark:bg-yellow-950/30" },
    DEVOPS: { emoji: "🔧", label: "DevOps", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
    CLOUD_COMPUTING: { emoji: "☁️", label: "Cloud Computing", color: "text-sky-600", bgColor: "bg-sky-50 dark:bg-sky-950/30" },
    MACHINE_LEARNING: { emoji: "🤖", label: "Machine Learning", color: "text-pink-600", bgColor: "bg-pink-50 dark:bg-pink-950/30" },
    ARTIFICIAL_INTELLIGENCE: { emoji: "🧠", label: "AI", color: "text-rose-600", bgColor: "bg-rose-50 dark:bg-rose-950/30" },
    CYBERSECURITY: { emoji: "🔐", label: "Cybersecurity", color: "text-red-600", bgColor: "bg-red-50 dark:bg-red-950/30" },
    BLOCKCHAIN: { emoji: "⛓️", label: "Blockchain", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
    PROGRAMMING_FUNDAMENTALS: { emoji: "📚", label: "Fundamentals", color: "text-indigo-600", bgColor: "bg-indigo-50 dark:bg-indigo-950/30" },
    SOFTWARE_ARCHITECTURE: { emoji: "🏛️", label: "Architecture", color: "text-violet-600", bgColor: "bg-violet-50 dark:bg-violet-950/30" },
    API_DESIGN: { emoji: "🔌", label: "API Design", color: "text-teal-600", bgColor: "bg-teal-50 dark:bg-teal-950/30" },
    TESTING: { emoji: "🧪", label: "Testing", color: "text-lime-600", bgColor: "bg-lime-50 dark:bg-lime-950/30" },
    VERSION_CONTROL: { emoji: "📝", label: "Version Control", color: "text-fuchsia-600", bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30" },
    UI_UX_DESIGN: { emoji: "🎨", label: "UI/UX Design", color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
    GAME_DEVELOPMENT: { emoji: "🎮", label: "Game Development", color: "text-green-500", bgColor: "bg-green-50 dark:bg-green-950/30" },
    NETWORKING: { emoji: "🌍", label: "Networking", color: "text-slate-600", bgColor: "bg-slate-50 dark:bg-slate-950/30" },
    OPERATING_SYSTEMS: { emoji: "💻", label: "Operating Systems", color: "text-gray-600", bgColor: "bg-gray-50 dark:bg-gray-950/30" },
    CUSTOM: { emoji: "✨", label: "Custom", color: "text-neutral-600", bgColor: "bg-neutral-50 dark:bg-neutral-950/30" },
};

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
    // Show top 8 categories with counts, plus all others
    const sortedCategories = [...categories].sort((a, b) => b._count - a._count);
    const displayCategories = sortedCategories.slice(0, 8);

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                        Browse by Category
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                        Explore concepts organized by topic
                    </p>
                </div>
                <Link
                    href="/concepts/browse"
                    className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-white hover:underline"
                >
                    View all
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {
                    displayCategories.map((cat, index) => {
                        const config = categoryConfig[cat.category];
                        return (
                            <motion.div
                                key={cat.category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Link href={`/concepts/browse?category=${cat.category}`}>
                                    <div
                                        className="group p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                                                <span className="text-2xl">{config.emoji}</span>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                                            {config.label}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                            {cat._count} concept{cat._count !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })
                }
            </div>
            <div className="mt-6 text-center">
                <Link href="/concepts/browse">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                        Explore all {Object.keys(categoryConfig).length} categories
                        <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </Link>
            </div>
        </section>
    );
}