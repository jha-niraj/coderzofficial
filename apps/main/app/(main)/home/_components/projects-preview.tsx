"use client";

import { motion } from "framer-motion";
import { FolderKanban, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";

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
    if (projects.length === 0) return null;

    const displayProjects = projects.slice(0, 3);

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <FolderKanban className="h-4 w-4 text-blue-500" />
                        </div>
                        <CardTitle className="text-base">My Projects</CardTitle>
                    </div>
                    <Link
                        href="/projects"
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
                    >
                        View all
                        <ChevronRight className="h-3 w-3" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {displayProjects.map((progress) => (
                        <Link
                            key={progress.id}
                            href={`/projects/${progress.project.slug}`}
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-sm font-medium transition-colors"
                            >
                                <span className="truncate max-w-[140px]">
                                    {progress.project.title}
                                </span>
                                <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
