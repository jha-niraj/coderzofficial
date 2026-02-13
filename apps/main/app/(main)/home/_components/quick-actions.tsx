"use client";

import { useState } from "react";
import { useKnowmeSheet } from "./knowme-sheet-provider";
import { motion } from "framer-motion";
import {
    FolderKanban, Mic, Briefcase, FileText, BookOpen, ClipboardCheck,
    Bot, Layout, Users, Map, Lock, Rocket
} from "lucide-react";
import Link from "next/link";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@repo/ui/components/ui/tooltip";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, 
    DialogTitle
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
            <div className="rounded-xl border border-primary/10 bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Rocket className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Quick Actions</h3>
                </div>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center"
                >
                        {activeActions.map((action) => (
                            <motion.div key={action.title} variants={itemVariants} className="w-full max-w-[140px]">
                                {action.isKnowme && onKnowmeClick ? (
                                    <div
                                        onClick={handleKnowmeClick}
                                        className={`p-4 rounded-xl ${action.bgColor} transition-all duration-200 cursor-pointer group flex flex-col items-center text-center`}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-black/10 mb-2`}
                                        >
                                            <action.icon className="h-6 w-6 text-white" strokeWidth={2} />
                                        </div>
                                        <p className="font-semibold text-sm">{action.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                            {action.description}
                                        </p>
                                    </div>
                                ) : (
                                    <Link href={action.href} className="block">
                                        <div
                                            className={`p-4 rounded-xl ${action.bgColor} transition-all duration-200 cursor-pointer group flex flex-col items-center text-center h-full`}
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg shadow-black/10 mb-2`}
                                            >
                                                <action.icon className="h-6 w-6 text-white" strokeWidth={2} />
                                            </div>
                                            <p className="font-semibold text-sm">{action.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                {action.description}
                                            </p>
                                        </div>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                        <TooltipProvider>
                            {lockedActions.map((action) => (
                                <motion.div key={action.title} variants={itemVariants} className="w-full max-w-[140px]">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                onClick={() => handleLockedClick(action.title)}
                                                className="p-4 rounded-xl bg-muted/50 opacity-75 cursor-not-allowed hover:opacity-90 transition-all group border border-dashed border-muted-foreground/30 flex flex-col items-center text-center"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-2">
                                                    <Lock className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <p className="font-semibold text-sm text-muted-foreground">
                                                    {action.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {action.description}
                                                </p>
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
                </div>

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
