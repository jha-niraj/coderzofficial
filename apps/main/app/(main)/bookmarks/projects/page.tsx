"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    FolderKanban, ChevronRight, Loader2, Clock, Users, ListTodo
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { getProjectBookmarks } from "@/actions/(main)/bookmarks/bookmarks.action";
import { cn } from "@repo/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";

const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ADVANCED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface TechStack {
    id: string;
    name: string;
}

interface BookmarkProject {
    id: string;
    slug?: string;
    title: string;
    description?: string;
    coverImage?: string;
    category?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string;
    memberCount?: number;
    taskCount: number;
    techStack?: TechStack[];
    savedAt: string | Date;
    type?: string;
    folder?: string | null;
    notes?: string | null;
    estimatedTime?: string | null;
}

export default function ProjectBookmarksPage() {
    const [projects, setProjects] = useState<BookmarkProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getProjectBookmarks();
                if (result.success && result.data) {
                    setProjects(result.data);
                }
            } catch (error) {
                console.error("Error loading project bookmarks:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="min-h-screen">
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-orange-50 to-white dark:from-orange-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                <FolderKanban className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    Saved Projects
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {projects.length} projects bookmarked
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                {
                    isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        </div>
                    ) : projects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <FolderKanban className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No project bookmarks
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Save projects to join them later
                            </p>
                            <Button asChild>
                                <Link href="/projects">
                                    Browse Projects
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {
                                    projects.map((project, index) => (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link href={`/projects/${project.slug || project.id}`}>
                                                <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                                    <div className="relative h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20">
                                                        {
                                                            project.coverImage && (
                                                                <Image
                                                                    src={project.coverImage}
                                                                    alt={project.title}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            )
                                                        }
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                                            {
                                                                project.difficulty && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className={cn(
                                                                            "text-xs rounded-full",
                                                                            difficultyColors[project.difficulty as keyof typeof difficultyColors]
                                                                        )}
                                                                    >
                                                                        {project.difficulty}
                                                                    </Badge>
                                                                )
                                                            }
                                                            <div className="text-xs text-white/80 flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {formatDistanceToNow(new Date(project.savedAt), { addSuffix: true })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        {
                                                            project.category && (
                                                                <Badge variant="outline" className="text-xs rounded-full mb-2">
                                                                    {project.category.replace(/_/g, " ")}
                                                                </Badge>
                                                            )
                                                        }

                                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                                                            {project.title}
                                                        </h3>

                                                        {
                                                            project.description && (
                                                                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                                                                    {project.description}
                                                                </p>
                                                            )
                                                        }

                                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3.5 w-3.5" />
                                                                {project.memberCount ?? 0} members
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <ListTodo className="h-3.5 w-3.5" />
                                                                {project.taskCount} tasks
                                                            </span>
                                                        </div>

                                                        {
                                                            project.techStack && project.techStack?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-3">
                                                                    {
                                                                        project.techStack.slice(0, 3).map((tech) => (
                                                                            <Badge
                                                                                key={tech.id}
                                                                                variant="secondary"
                                                                                className="text-xs rounded-full"
                                                                            >
                                                                                {tech.name}
                                                                            </Badge>
                                                                        ))
                                                                    }
                                                                    {
                                                                        project.techStack.length > 3 && (
                                                                            <Badge variant="secondary" className="text-xs rounded-full">
                                                                                +{project.techStack.length - 3}
                                                                            </Badge>
                                                                        )
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                }
                            </AnimatePresence>
                        </div>
                    )
                }
            </div>
        </div>
    );
}