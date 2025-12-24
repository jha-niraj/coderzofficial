"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    FolderKanban, ExternalLink, Filter, Grid3X3, List, Pin, Clock,
    CheckCircle2, PlayCircle, Circle, Github, Search
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Input } from "@repo/ui/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import Link from "next/link";

interface ProjectsTabProps {
    user: {
        id: string;
        projects: Array<{
            id: string;
            name: string;
            description: string;
            category: string;
            difficulty: string;
            tags: string[];
            tier: string;
            estimatedTime: string;
        }>;
        userProfile?: {
            pinnedProjects: Array<{
                projectId: string;
            }>;
        } | null;
    };
    projectProgress?: Array<{
        projectId: string;
        status: string;
        startedAt: Date | null;
        completedAt: Date | null;
        xpEarned: number;
        githubUrl: string | null;
        liveUrl: string | null;
    }>;
    isOwnProfile: boolean;
    onPinProject?: (projectId: string) => void;
    onUnpinProject?: (projectId: string) => void;
}

// Status config
const statusConfig: Record<
    string,
    { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
    Completed: {
        icon: CheckCircle2,
        color: "text-green-500 bg-green-500/10",
        label: "Completed",
    },
    InProgress: {
        icon: PlayCircle,
        color: "text-blue-500 bg-blue-500/10",
        label: "In Progress",
    },
    NotStarted: {
        icon: Circle,
        color: "text-gray-400 bg-gray-500/10",
        label: "Not Started",
    },
};

// Difficulty colors
const difficultyColors: Record<string, string> = {
    easy: "bg-green-500/10 text-green-600 border-green-500/20",
    beginner: "bg-green-500/10 text-green-600 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-600 border-red-500/20",
    advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function ProjectsTab({
    user,
    projectProgress = [],
    isOwnProfile,
    onPinProject,
    onUnpinProject,
}: ProjectsTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const pinnedProjectIds = new Set(
        user.userProfile?.pinnedProjects?.map((p) => p.projectId) || []
    );

    // Get progress for a project
    const getProgress = (projectId: string) => {
        return projectProgress.find((p) => p.projectId === projectId);
    };

    // Get all unique categories
    const categories = [...new Set(user.projects.map((p) => p.category))];

    // Filter projects
    const filteredProjects = user.projects.filter((project) => {
        const progress = getProgress(project.id);
        const status = progress?.status || "NotStarted";

        // Search filter
        if (
            searchQuery &&
            !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !project.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }

        // Status filter
        if (statusFilter !== "all" && status !== statusFilter) {
            return false;
        }

        // Category filter
        if (categoryFilter !== "all" && project.category !== categoryFilter) {
            return false;
        }

        return true;
    });

    // Sort: pinned first, then by status
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        const aPinned = pinnedProjectIds.has(a.id);
        const bPinned = pinnedProjectIds.has(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        const aProgress = getProgress(a.id);
        const bProgress = getProgress(b.id);
        if (aProgress?.status === "InProgress" && bProgress?.status !== "InProgress")
            return -1;
        if (aProgress?.status !== "InProgress" && bProgress?.status === "InProgress")
            return 1;

        return 0;
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="InProgress">In Progress</SelectItem>
                                    <SelectItem value="NotStarted">Not Started</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {
                                        categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                    className="rounded-r-none"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === "list" ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                    className="rounded-l-none"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    {
                        (statusFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {
                                    searchQuery && (
                                        <Badge variant="secondary" className="gap-1">
                                            Search: {searchQuery}
                                            <button onClick={() => setSearchQuery("")} className="ml-1">
                                                ×
                                            </button>
                                        </Badge>
                                    )
                                }
                                {
                                    statusFilter !== "all" && (
                                        <Badge variant="secondary" className="gap-1">
                                            {statusFilter}
                                            <button onClick={() => setStatusFilter("all")} className="ml-1">
                                                ×
                                            </button>
                                        </Badge>
                                    )
                                }
                                {
                                    categoryFilter !== "all" && (
                                        <Badge variant="secondary" className="gap-1">
                                            {categoryFilter}
                                            <button onClick={() => setCategoryFilter("all")} className="ml-1">
                                                ×
                                            </button>
                                        </Badge>
                                    )
                                }
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("all");
                                        setCategoryFilter("all");
                                    }}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )
                    }
                </CardContent>
            </Card>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Showing {sortedProjects.length} of {user.projects.length} projects
                </span>
            </div>
            {
                sortedProjects.length > 0 ? (
                    <div
                        className={cn(
                            viewMode === "grid"
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                : "space-y-3"
                        )}
                    >
                        {
                            sortedProjects.map((project, index) => {
                                const progress = getProgress(project.id);
                                const status = progress?.status || "NotStarted";
                                const config = statusConfig[status] || statusConfig.NotStarted;
                                const StatusIcon = config.icon;
                                const isPinned = pinnedProjectIds.has(project.id);

                                if (viewMode === "list") {
                                    return (
                                        <motion.div
                                            key={project.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                        >
                                            <Card className="hover:shadow-sm transition-shadow">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div
                                                            className={cn(
                                                                "p-2 rounded-lg flex-shrink-0",
                                                                config.color.split(" ")[1]
                                                            )}
                                                        >
                                                            <StatusIcon
                                                                className={cn("w-5 h-5", config.color.split(" ")[0])}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Link
                                                                            href={`/projects/${project.id}`}
                                                                            className="font-medium hover:text-primary transition-colors"
                                                                        >
                                                                            {project.name}
                                                                        </Link>
                                                                        {
                                                                            isPinned && (
                                                                                <Pin className="w-3 h-3 text-primary" />
                                                                            )
                                                                        }
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                                        {project.description}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    {
                                                                        progress?.githubUrl && (
                                                                            <Link
                                                                                href={progress.githubUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                    <Github className="w-4 h-4" />
                                                                                </Button>
                                                                            </Link>
                                                                        )
                                                                    }
                                                                    {
                                                                        progress?.liveUrl && (
                                                                            <Link
                                                                                href={progress.liveUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                    <ExternalLink className="w-4 h-4" />
                                                                                </Button>
                                                                            </Link>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={difficultyColors[project.difficulty.toLowerCase()]}
                                                                >
                                                                    {project.difficulty}
                                                                </Badge>
                                                                <Badge variant="secondary">{project.category}</Badge>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {project.estimatedTime}
                                                                </span>
                                                                {
                                                                    (progress?.xpEarned ?? 0) > 0 && (
                                                                        <span className="text-xs text-yellow-600">
                                                                            +{progress?.xpEarned} XP
                                                                        </span>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                    >
                                        <Card className="h-full hover:shadow-md transition-shadow group">
                                            <CardContent className="p-4 flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div
                                                        className={cn(
                                                            "p-2 rounded-lg",
                                                            config.color.split(" ")[1]
                                                        )}
                                                    >
                                                        <StatusIcon
                                                            className={cn("w-5 h-5", config.color.split(" ")[0])}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {isPinned && <Pin className="w-4 h-4 text-primary" />}
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-xs",
                                                                difficultyColors[project.difficulty.toLowerCase()]
                                                            )}
                                                        >
                                                            {project.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/projects/${project.id}`}
                                                    className="font-medium mb-1 group-hover:text-primary transition-colors"
                                                >
                                                    {project.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                                                    {project.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-3 mb-3">
                                                    {
                                                        project.tags.slice(0, 3).map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))
                                                    }
                                                    {
                                                        project.tags.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{project.tags.length - 3}
                                                            </Badge>
                                                        )
                                                    }
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {project.estimatedTime}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {
                                                            progress?.githubUrl && (
                                                                <Link
                                                                    href={progress.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <Github className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                            )
                                                        }
                                                        {
                                                            progress?.liveUrl && (
                                                                <Link
                                                                    href={progress.liveUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
                                                            )
                                                        }
                                                        {
                                                            isOwnProfile && onPinProject && onUnpinProject && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7"
                                                                    onClick={() =>
                                                                        isPinned
                                                                            ? onUnpinProject(project.id)
                                                                            : onPinProject(project.id)
                                                                    }
                                                                >
                                                                    <Pin
                                                                        className={cn(
                                                                            "w-4 h-4",
                                                                            isPinned ? "text-primary fill-primary" : ""
                                                                        )}
                                                                    />
                                                                </Button>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        }
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                            <h3 className="font-medium mb-2">No projects found</h3>
                            <p className="text-sm text-muted-foreground">
                                {
                                    searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                                        ? "Try adjusting your filters"
                                        : "No projects to display"
                                }
                            </p>
                        </CardContent>
                    </Card>
                )
            }
        </div>
    );
}