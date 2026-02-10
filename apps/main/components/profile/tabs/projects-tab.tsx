"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import {
    Search, Grid3X3, List, ExternalLink, Github, CheckCircle2,
    Clock3, Circle, FolderKanban, Eye, EyeOff, Globe, Calendar
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import Image from "next/image";

// PortfolioProject type matching the database model
interface PortfolioProject {
    id: string;
    projectName: string;
    projectType: string;
    description: string | null;
    status: string;
    visibility: string;
    technologies: string[];
    startDate: Date;
    endDate: Date | null;
    thumbnailUrl: string | null;
    projectLinks?: Array<{
        id: string;
        linkType: string;
        url: string;
        description: string | null;
    }>;
}

interface ProjectsTabProps {
    user: {
        portfolioProjects?: PortfolioProject[];
    };
    isOwnProfile?: boolean;
}

const defaultStatusConfig = {
    color: "text-gray-500 bg-gray-100",
    icon: Circle,
    label: "Planned",
};

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
    COMPLETED: {
        color: "text-green-600 bg-green-100",
        icon: CheckCircle2,
        label: "Completed",
    },
    IN_PROGRESS: {
        color: "text-blue-600 bg-blue-100",
        icon: Clock3,
        label: "In Progress",
    },
    PLANNED: defaultStatusConfig,
};

const defaultVisibilityConfig = { icon: Globe, label: "Public", color: "text-green-600" };

const visibilityConfig: Record<string, { icon: typeof Globe; label: string; color: string }> = {
    PUBLIC: defaultVisibilityConfig,
    PRIVATE: { icon: EyeOff, label: "Private", color: "text-gray-500" },
    UNLISTED: { icon: Eye, label: "Unlisted", color: "text-yellow-600" },
};

export function ProjectsTab({
    user,
    isOwnProfile = false,
}: ProjectsTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const projects = user.portfolioProjects || [];

    // Get unique project types for filter
    const projectTypes = useMemo(() => {
        return [...new Set(projects.map((p) => p.projectType))];
    }, [projects]);

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            // For non-owners, only show public projects
            if (!isOwnProfile && project.visibility !== "PUBLIC") return false;

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    project.projectName.toLowerCase().includes(query) ||
                    (project.description?.toLowerCase().includes(query) ?? false) ||
                    project.technologies.some((tech) => tech.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            if (statusFilter !== "all" && project.status !== statusFilter) return false;
            if (typeFilter !== "all" && project.projectType !== typeFilter) return false;

            return true;
        });
    }, [projects, searchQuery, statusFilter, typeFilter, isOwnProfile]);

    // Sort: In Progress first, then Completed, then Planned
    const sortedProjects = useMemo(() => {
        return [...filteredProjects].sort((a, b) => {
            const statusOrder: Record<string, number> = { IN_PROGRESS: 0, COMPLETED: 1, PLANNED: 2 };
            return (statusOrder[a.status] || 2) - (statusOrder[b.status] || 2);
        });
    }, [filteredProjects]);

    // Helper to get project links by type
    const getLink = (project: PortfolioProject, type: string) => {
        return project.projectLinks?.find((link) => link.linkType === type)?.url;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
        });
    };

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
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="PLANNED">Planned</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {
                                        projectTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
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
                        (statusFilter !== "all" || typeFilter !== "all" || searchQuery) && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {
                                    searchQuery && (
                                        <Badge variant="secondary" className="gap-1">
                                            Search: {searchQuery}
                                            <button onClick={() => setSearchQuery("")} className="ml-1">×</button>
                                        </Badge>
                                    )
                                }
                                {
                                    statusFilter !== "all" && (
                                        <Badge variant="secondary" className="gap-1">
                                            {statusConfig[statusFilter]?.label || statusFilter}
                                            <button onClick={() => setStatusFilter("all")} className="ml-1">×</button>
                                        </Badge>
                                    )
                                }
                                {
                                    typeFilter !== "all" && (
                                        <Badge variant="secondary" className="gap-1">
                                            {typeFilter}
                                            <button onClick={() => setTypeFilter("all")} className="ml-1">×</button>
                                        </Badge>
                                    )
                                }
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("all");
                                        setTypeFilter("all");
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
                    Showing {sortedProjects.length} of {projects.length} projects
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
                                const config = statusConfig[project.status] ?? defaultStatusConfig;
                                const StatusIcon = config.icon;
                                const visibilityConf = visibilityConfig[project.visibility] ?? defaultVisibilityConfig;
                                const VisibilityIcon = visibilityConf.icon;
                                const githubUrl = getLink(project, "GITHUB");
                                const liveUrl = getLink(project, "LIVE");

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
                                                        {
                                                            project.thumbnailUrl && (
                                                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                                                    <Image
                                                                        src={project.thumbnailUrl}
                                                                        alt={project.projectName}
                                                                        width={64}
                                                                        height={64}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                        {
                                                            !project.thumbnailUrl && (
                                                                <div
                                                                    className={cn(
                                                                        "p-2 rounded-lg flex-shrink-0",
                                                                        config?.color.split(" ")[1]
                                                                    )}
                                                                >
                                                                    <StatusIcon
                                                                        className={cn("w-5 h-5", config?.color.split(" ")[0])}
                                                                    />
                                                                </div>
                                                            )
                                                        }

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-medium">
                                                                            {project.projectName}
                                                                        </span>
                                                                        {
                                                                            isOwnProfile && (
                                                                                <VisibilityIcon className={cn("w-3 h-3", visibilityConf?.color)} />
                                                                            )
                                                                        }
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                                        {project.description || "No description"}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    {
                                                                        githubUrl && (
                                                                            <Link
                                                                                href={githubUrl}
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
                                                                        liveUrl && (
                                                                            <Link
                                                                                href={liveUrl}
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
                                                                <Badge variant="outline" className={config?.color}>
                                                                    {config?.label}
                                                                </Badge>
                                                                <Badge variant="secondary">{project.projectType}</Badge>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {formatDate(project.startDate)}
                                                                    {project.endDate && ` - ${formatDate(project.endDate)}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                }

                                // Grid view
                                return (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.02 }}
                                    >
                                        <Card className="h-full hover:shadow-md transition-shadow group">
                                            {
                                                project.thumbnailUrl && (
                                                    <div className="w-full h-36 overflow-hidden rounded-t-lg bg-muted">
                                                        <Image
                                                            src={project.thumbnailUrl}
                                                            alt={project.projectName}
                                                            width={400}
                                                            height={144}
                                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                                        />
                                                    </div>
                                                )
                                            }

                                            <CardContent className="p-4 flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div
                                                        className={cn(
                                                            "p-2 rounded-lg",
                                                            config?.color.split(" ")[1]
                                                        )}
                                                    >
                                                        <StatusIcon
                                                            className={cn("w-5 h-5", config?.color.split(" ")[0])}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {
                                                            isOwnProfile && (
                                                                <VisibilityIcon className={cn("w-4 h-4", visibilityConf?.color)} />
                                                            )
                                                        }
                                                        <Badge variant="outline" className="text-xs">
                                                            {project.projectType}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <span className="font-medium mb-1 group-hover:text-primary transition-colors">
                                                    {project.projectName}
                                                </span>
                                                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                                                    {project.description || "No description"}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-3 mb-3">
                                                    {
                                                        project.technologies.slice(0, 3).map((tech) => (
                                                            <Badge key={tech} variant="secondary" className="text-xs">
                                                                {tech}
                                                            </Badge>
                                                        ))
                                                    }
                                                    {
                                                        project.technologies.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{project.technologies.length - 3}
                                                            </Badge>
                                                        )
                                                    }
                                                </div>
                                                <div className="flex items-center justify-between pt-3 border-t">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(project.startDate)}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {
                                                            githubUrl && (
                                                                <Link
                                                                    href={githubUrl}
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
                                                            liveUrl && (
                                                                <Link
                                                                    href={liveUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                        <ExternalLink className="w-4 h-4" />
                                                                    </Button>
                                                                </Link>
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
                                    searchQuery || statusFilter !== "all" || typeFilter !== "all"
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