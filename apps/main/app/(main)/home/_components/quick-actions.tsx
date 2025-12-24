"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import {
    FolderKanban, BookOpen, Code2, MessageSquare, Gamepad2, Rocket, ArrowRight
} from "lucide-react";
import Link from "next/link";

const quickActions = [
    {
        title: "Start Project",
        description: "Build real-world projects",
        icon: FolderKanban,
        href: "/projects",
        color: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
        title: "New Studio",
        description: "AI-powered notes & quizzes",
        icon: BookOpen,
        href: "/studio",
        color: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
        title: "Practice DSA",
        description: "Solve coding problems",
        icon: Code2,
        href: "/dsa",
        color: "from-green-500 to-emerald-500",
        bgColor: "bg-green-500/10 hover:bg-green-500/20",
    },
    {
        title: "AI Chat",
        description: "Get learning assistance",
        icon: MessageSquare,
        href: "/ai-chat",
        color: "from-orange-500 to-red-500",
        bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    },
    {
        title: "Mock Interview",
        description: "Practice interviews",
        icon: Gamepad2,
        href: "/mock-interview",
        color: "from-yellow-500 to-amber-500",
        bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
    },
    {
        title: "Roadmaps",
        description: "Learning paths",
        icon: Rocket,
        href: "/roadmaps",
        color: "from-indigo-500 to-violet-500",
        bgColor: "bg-indigo-500/10 hover:bg-indigo-500/20",
    },
];

export default function QuickActions() {
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

    return (
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
                    {
                        quickActions.map((action) => (
                            <motion.div key={action.title} variants={itemVariants}>
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
                            </motion.div>
                        ))
                    }
                </motion.div>
            </CardContent>
        </Card>
    );
}