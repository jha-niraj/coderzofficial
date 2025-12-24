"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    FolderKanban, ChevronRight, Loader2, Users, ListTodo,
    Calendar, ExternalLink, Filter
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { getProjectLearnings } from "@/actions/(main)/learnings/learnings.action";
import { cn } from "@repo/ui/lib/utils";

export default function ProjectLearningsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getProjectLearnings();
                if (result.success && result.data) {
                    setProjects(result.data);
                }
            } catch (error) {
                console.error("Error loading projects:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredProjects = projects.filter(p => {
        if (filter === "all") return true;
        return p.status === filter;
    });

    return (
        <div className="min-h-screen">
            {/* Header */}
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
                                    My Projects
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {projects.length} projects you&apos;re working on
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Filters */}
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-16 z-20">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {["all", "InProgress", "Completed", "Planning"].map((status) => (
                                <Button
                                    key={status}
                                    variant={filter === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilter(status)}
                                    className={cn(
                                        "rounded-full",
                                        filter === status
                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                            : "border-neutral-200 dark:border-neutral-700"
                                    )}
                                >
                                    {status === "all" ? "All" : status === "InProgress" ? "In Progress" : status}
                                </Button>
                            ))}
                        </div>
                        <p className="text-sm text-neutral-500">
                            {filteredProjects.length} projects
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <FolderKanban className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                            No projects yet
                        </h3>
                        <p className="text-neutral-500 mb-6">
                            Join or create a project to start learning
                        </p>
                        <Button asChild>
                            <Link href="/projects">
                                Explore Projects
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/projects/${project.slug}`}>
                                        <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                            {/* Cover Image */}
                                            <div className="relative h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20">
                                                {project.coverImage && (
                                                    <Image
                                                        src={project.coverImage}
                                                        alt={project.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <Badge className={cn(
                                                        "rounded-full",
                                                        project.status === "Completed" && "bg-green-500",
                                                        project.status === "InProgress" && "bg-blue-500",
                                                        project.status === "Planning" && "bg-amber-500",
                                                    )}>
                                                        {project.status === "InProgress" ? "In Progress" : project.status}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                                    {project.title}
                                                </h3>
                                                <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                                                    {project.description}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {project.memberCount} members
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ListTodo className="h-3.5 w-3.5" />
                                                        {project.taskCount} tasks
                                                    </span>
                                                </div>

                                                {project.techStack?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-3">
                                                        {project.techStack.slice(0, 3).map((tech: any) => (
                                                            <Badge
                                                                key={tech.id}
                                                                variant="secondary"
                                                                className="text-xs rounded-full"
                                                            >
                                                                {tech.name}
                                                            </Badge>
                                                        ))}
                                                        {project.techStack.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs rounded-full">
                                                                +{project.techStack.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
