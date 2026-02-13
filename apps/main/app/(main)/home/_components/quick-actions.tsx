"use client";

import { useState } from "react";
import { useKnowmeSheet } from "./knowme-sheet-provider";
import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import {
    FolderKanban, Mic, Briefcase, FileText, BookOpen, ClipboardCheck,
    Bot, Layout, Users, Map, Lock, ArrowRight, Rocket
} from "lucide-react";
import Link from "next/link";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@repo/ui/components/ui/tooltip";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog";

const activeActions = [
    {
        title: "Projects",
        description: "Build real-world projects",
        icon: FolderKanban,
        href: "/projects",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
        title: "Mock Interview",
        description: "Practice voice interviews",
        icon: Mic,
        href: "/mock/voice",
        color: "from-amber-500 to-orange-500",
        bgColor: "bg-amber-500/10 hover:bg-amber-500/20",
    },
    {
        title: "Job Interview",
        description: "AI-powered interview prep",
        icon: Briefcase,
        href: "/ai/jobinterviewassistant",
        color: "from-violet-500 to-purple-600",
        bgColor: "bg-violet-500/10 hover:bg-violet-500/20",
    },
    {
        title: "Resume Creator",
        description: "Create ATS-friendly resumes",
        icon: FileText,
        href: "/ai/resumecreator",
        color: "from-pink-500 to-rose-500",
        bgColor: "bg-pink-500/10 hover:bg-pink-500/20",
    },
    {
        title: "Open Source Learn",
        description: "Learn Git & contribute",
        icon: BookOpen,
        href: "/opensource/learn",
        color: "from-emerald-500 to-teal-500",
        bgColor: "bg-emerald-500/10 hover:bg-emerald-500/20",
    },
    {
        title: "Open Source Exam",
        description: "Get certified",
        icon: ClipboardCheck,
        href: "/opensource/exam",
        color: "from-cyan-500 to-blue-500",
        bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
    },
    {
        title: "KnowMe",
        description: "Chat with your AI portfolio",
        icon: Bot,
        href: "/knowme",
        color: "from-indigo-500 to-violet-500",
        bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
        isKnowme: true,
    },
];

const lockedActions = [
    {
        title: "Studio",
        description: "AI notes & dashboards",
        icon: Layout,
    },
    {
        title: "Spaces",
        description: "Collaborative workspaces",
        icon: Users,
    },
    {
        title: "Pathfinder",
        description: "Learning paths & goals",
        icon: Map,
    },
];

export default function QuickActions({
    onKnowmeClick: onKnowmeClickProp,
}: {
    onKnowmeClick?: () => void;
}) {
    const onKnowmeFromContext = useKnowmeSheet();
    const onKnowmeClick = onKnowmeClickProp ?? onKnowmeFromContext ?? undefined;
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [comingSoonTitle, setComingSoonTitle] = useState("");

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
    };

    const handleLockedClick = (title: string) => {
        setComingSoonTitle(title);
        setShowComingSoon(true);
    };

    const handleKnowmeClick = (e: React.MouseEvent) => {
        if (onKnowmeClick) {
            e.preventDefault();
            onKnowmeClick();
        }
    };

    return (
        <>
            <Card className="border-primary/10">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Rocket className="h-4 w-4 text-primary" />
                        </div>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                        {activeActions.map((action) => (
                            <motion.div key={action.title} variants={itemVariants}>
                                {action.isKnowme && onKnowmeClick ? (
                                    <div
                                        onClick={handleKnowmeClick}
                                        className={`p-4 rounded-xl ${action.bgColor} transition-all duration-200 cursor-pointer group`}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}
                                            >
                                                <action.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1">
                                                    <p className="font-semibold text-sm">{action.title}</p>
                                                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link href={action.href}>
                                        <div
                                            className={`p-4 rounded-xl ${action.bgColor} transition-all duration-200 cursor-pointer group`}
                                        >
                                            <div className="flex flex-col gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}
                                                >
                                                    <action.icon className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p className="font-semibold text-sm">
                                                            {action.title}
                                                        </p>
                                                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                        <TooltipProvider>
                            {lockedActions.map((action) => (
                                <motion.div key={action.title} variants={itemVariants}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                onClick={() => handleLockedClick(action.title)}
                                                className="p-4 rounded-xl bg-muted/50 opacity-75 cursor-not-allowed hover:opacity-90 transition-all group border border-dashed border-muted-foreground/30"
                                            >
                                                <div className="flex flex-col gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                                        <Lock className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-muted-foreground">
                                                            {action.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Coming soon</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </motion.div>
                            ))}
                        </TooltipProvider>
                    </motion.div>
                </CardContent>
            </Card>

            <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Coming Soon</DialogTitle>
                        <DialogDescription>
                            {comingSoonTitle} is under development. Stay tuned!
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}
