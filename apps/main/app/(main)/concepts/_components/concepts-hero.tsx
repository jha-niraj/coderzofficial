"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
    BookOpen, Lightbulb, Search 
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";

interface ConceptsHeroProps {
    totalConcepts?: number;
    totalSteps?: number;
    totalCategories?: number;
}

export default function ConceptsHero({ totalConcepts = 0, totalSteps = 0, totalCategories = 0 }: ConceptsHeroProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) {
            router.push(`/concepts/browse?search=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-[10%] text-neutral-200 dark:text-neutral-800"
                    animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <BookOpen className="w-16 h-16" />
                </motion.div>
                <motion.div
                    className="absolute top-32 right-[15%] text-neutral-200 dark:text-neutral-800"
                    animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    <Lightbulb className="w-20 h-20" />
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <Badge
                        variant="outline"
                        className="mb-6 px-4 py-1.5 rounded-full border-neutral-300 dark:border-neutral-700"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        {totalConcepts > 0 ? totalConcepts.toLocaleString() : ""} Concepts
                    </Badge>

                    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
                        Master Programming Concepts
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                        Interactive card-based learning with code examples, visualizations, quizzes, and hands-on challenges.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <Input
                                placeholder="Search concepts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-12 h-14 text-lg rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                            />
                        </div>
                    </form>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/concepts/browse">
                            <Button
                                size="lg"
                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 h-12 px-8 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100"
                            >
                                <Lightbulb className="w-5 h-5 mr-2" />
                                Start Learning
                            </Button>
                        </Link>
                        <Link href="/concepts/my-progress">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-neutral-300 dark:border-neutral-700 h-12 px-8 rounded-xl"
                            >
                                My Progress
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-8 mt-12"
                    >
                        <div className="text-center">
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white">{totalConcepts}</div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">Concepts</div>
                        </div>
                        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white">{totalSteps}</div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">Interactive Steps</div>
                        </div>
                        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-neutral-900 dark:text-white">{totalCategories}</div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">Categories</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}