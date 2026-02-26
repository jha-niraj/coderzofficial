"use client";

import { motion } from "framer-motion";
import {
    FolderKanban, ChevronRight
} from "lucide-react";
import Link from "next/link";

interface Project {
    id: string;
    project: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        difficulty: string;
    };
}

interface ProjectsPreviewProps {
    projects: Project[];
}

export default function ProjectsPreview({ projects }: ProjectsPreviewProps) {
    const displayProjects = projects.slice(0, 4);

    return (
        <div className="rounded-xl border border-primary/10 bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                        <FolderKanban className="h-4 w-4 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-base">My Projects</h3>
                </div>
                <Link
                    href="/projects"
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
                >
                    View all
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
            {
                displayProjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {
                            displayProjects.map((progress) => (
                                <Link
                                    key={progress.id}
                                    href={`/projects/${progress.project.slug}`}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-medium transition-colors"
                                    >
                                        <span className="truncate max-w-[160px]">
                                            {progress.project.title}
                                        </span>
                                        <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />
                                    </motion.div>
                                </Link>
                            ))
                        }
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                            No projects in progress
                        </p>
                        <Link href="/projects">
                            <motion.span
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-medium cursor-pointer"
                            >
                                Show My Projects
                                <ChevronRight className="h-3 w-3" />
                            </motion.span>
                        </Link>
                    </div>
                )
            }
        </div>
    );
}