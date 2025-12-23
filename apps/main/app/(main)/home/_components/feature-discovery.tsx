"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles, FolderKanban, BookOpen, Code2, MessageSquare, Gamepad2, Map,
    Wrench, GraduationCap, Palette, FileText, Briefcase, GitBranch, ChevronRight
} from "lucide-react";
import Link from "next/link";

interface Feature {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    bgColor: string;
    status: "available" | "coming-soon" | "beta";
}

const features: Feature[] = [
    {
        title: "Projects V2",
        description: "Build real-world projects with guidance",
        icon: FolderKanban,
        href: "/projects",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        status: "available",
    },
    {
        title: "Studio",
        description: "AI notes, quizzes & flashcards",
        icon: BookOpen,
        href: "/studio",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        status: "available",
    },
    {
        title: "DSA Practice",
        description: "Master data structures & algorithms",
        icon: Code2,
        href: "/dsa",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        status: "available",
    },
    {
        title: "AI Chat",
        description: "Learning assistant powered by AI",
        icon: MessageSquare,
        href: "/ai-chat",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        status: "available",
    },
    {
        title: "Mock Interviews",
        description: "Practice with AI interviewer",
        icon: Gamepad2,
        href: "/mock-interview",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        status: "available",
    },
    {
        title: "Roadmaps",
        description: "Guided learning paths",
        icon: Map,
        href: "/roadmaps",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        status: "available",
    },
    {
        title: "AI Tools",
        description: "Code review, converter & more",
        icon: Wrench,
        href: "/ai-tools",
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
        status: "available",
    },
    {
        title: "Open Source",
        description: "Contribute to open source projects",
        icon: GitBranch,
        href: "/open-source",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        status: "coming-soon",
    },
    {
        title: "Resume Builder",
        description: "Create ATS-friendly resumes",
        icon: FileText,
        href: "/resume-builder",
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        status: "coming-soon",
    },
    {
        title: "Portfolio Builder",
        description: "Showcase your work beautifully",
        icon: Palette,
        href: "/portfolio-builder",
        color: "text-violet-500",
        bgColor: "bg-violet-500/10",
        status: "coming-soon",
    },
    {
        title: "Mentorship",
        description: "1:1 guidance from experts",
        icon: GraduationCap,
        href: "/mentorship",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        status: "coming-soon",
    },
    {
        title: "Career Counseling",
        description: "Plan your tech career",
        icon: Briefcase,
        href: "/career-counseling",
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
        status: "coming-soon",
    },
];

export default function FeatureDiscovery() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "coming-soon":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-yellow-500/50 text-yellow-500 bg-yellow-500/10"
                    >
                        Coming Soon
                    </Badge>
                );
            case "beta":
                return (
                    <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-blue-500/50 text-blue-500 bg-blue-500/10"
                    >
                        Beta
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Discover Features</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                        {
                            features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex-shrink-0 w-[200px]"
                                >
                                    <Link
                                        href={feature.status === "coming-soon" ? "#" : feature.href}
                                        className={
                                            feature.status === "coming-soon"
                                                ? "cursor-not-allowed"
                                                : ""
                                        }
                                    >
                                        <div
                                            className={`p-4 rounded-xl border ${feature.status === "coming-soon"
                                                    ? "opacity-60"
                                                    : "hover:shadow-lg"
                                                } transition-all group ${feature.bgColor}`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div
                                                    className={`p-2 rounded-lg ${feature.bgColor}`}
                                                >
                                                    <feature.icon
                                                        className={`h-5 w-5 ${feature.color}`}
                                                    />
                                                </div>
                                                {getStatusBadge(feature.status)}
                                            </div>
                                            <h3 className="font-semibold text-sm mb-1">
                                                {feature.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {feature.description}
                                            </p>
                                            {
                                                feature.status !== "coming-soon" && (
                                                    <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span>Explore</span>
                                                        <ChevronRight className="h-3 w-3" />
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        }
                    </div>

                    <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
                </div>
            </CardContent>
        </Card>
    );
}