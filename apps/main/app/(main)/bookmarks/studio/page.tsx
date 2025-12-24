"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    GraduationCap, ChevronRight, Rocket, PlayCircle, Award
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";

export default function StudioBookmarksPage() {
    return (
        <div className="min-h-screen">
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    Saved Courses
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Your bookmarked studio courses
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <div className="max-w-6xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />

                            <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-xl">
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                                    <Rocket className="h-10 w-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                                    Coming Soon
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    Studio courses with bookmarking are being developed. You&apos;ll be able to save courses to watch later!
                                </p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                        <PlayCircle className="h-5 w-5 text-purple-500" />
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Save courses for later
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-left p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                        <Award className="h-5 w-5 text-purple-500" />
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Track your wishlist
                                        </span>
                                    </div>
                                </div>
                                <Button asChild className="mt-6 rounded-full">
                                    <Link href="/bookmarks">
                                        Back to Bookmarks
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}