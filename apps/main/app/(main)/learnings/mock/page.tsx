"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Mic, ChevronRight, Loader2, Calendar, PlayCircle, CheckCircle2, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMockLearnings } from "@/actions/(main)/learnings/learnings.action";
import { cn } from "../../lib/utils";

const statusStyles = {
    COMPLETED: {
        icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-100 dark:bg-green-900/30",
        label: "Completed"
    },
    IN_PROGRESS: {
        icon: PlayCircle,
        color: "text-blue-500",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        label: "In Progress"
    },
    ABANDONED: {
        icon: XCircle,
        color: "text-neutral-500",
        bg: "bg-neutral-100 dark:bg-neutral-800",
        label: "Abandoned"
    },
};

export default function MockLearningsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getMockLearnings();
                if (result.success && result.data) {
                    setSessions(result.data);
                }
            } catch (error) {
                console.error("Error loading mock sessions:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const avgScore = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessions.length)
        : 0;

    return (
        <div className="min-h-screen">
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Mic className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    Mock Interviews
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {sessions.length} sessions · {avgScore}% average score
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            {
                sessions.length > 0 && (
                    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                        <div className="max-w-6xl mx-auto px-4 py-6">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {sessions.length}
                                    </div>
                                    <div className="text-sm text-neutral-500">Total Sessions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {avgScore}%
                                    </div>
                                    <div className="text-sm text-neutral-500">Avg. Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {sessions.filter(s => s.status === "COMPLETED").length}
                                    </div>
                                    <div className="text-sm text-neutral-500">Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                {
                    isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Mic className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No mock interviews yet
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Practice your interview skills with AI-powered mock interviews
                            </p>
                            <Button asChild>
                                <Link href="/mock-interview">
                                    Start a Mock Interview
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {
                                    sessions.map((session, index) => {
                                        const statusConfig = statusStyles[session.status as keyof typeof statusStyles] || statusStyles.IN_PROGRESS;
                                        const StatusIcon = statusConfig.icon;

                                        return (
                                            <motion.div
                                                key={session.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link href={`/mock-interview/${session.id}`}>
                                                    <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex items-start gap-4 flex-1">
                                                                <div className={cn(
                                                                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                                                    statusConfig.bg
                                                                )}>
                                                                    <StatusIcon className={cn("h-6 w-6", statusConfig.color)} />
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                                            {session.jobRole || "Mock Interview"}
                                                                        </h3>
                                                                        <Badge variant="secondary" className="text-xs rounded-full">
                                                                            {session.experienceLevel}
                                                                        </Badge>
                                                                    </div>

                                                                    {
                                                                        session.jobDescription && (
                                                                            <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                                                                                {session.jobDescription}
                                                                            </p>
                                                                        )
                                                                    }

                                                                    {
                                                                        session.techStack && session.techStack.length > 0 && (
                                                                            <div className="flex flex-wrap gap-1 mb-3">
                                                                                {
                                                                                    session.techStack.slice(0, 5).map((tech: string, i: number) => (
                                                                                        <Badge
                                                                                            key={i}
                                                                                            variant="outline"
                                                                                            className="text-xs rounded-full"
                                                                                        >
                                                                                            {tech}
                                                                                        </Badge>
                                                                                    ))
                                                                                }
                                                                            </div>
                                                                        )
                                                                    }

                                                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="h-3.5 w-3.5" />
                                                                            {new Date(session.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {
                                                                session.overallScore !== null && (
                                                                    <div className="text-center shrink-0">
                                                                        <div className={cn(
                                                                            "text-3xl font-bold",
                                                                            session.overallScore >= 80 && "text-green-600",
                                                                            session.overallScore >= 60 && session.overallScore < 80 && "text-amber-600",
                                                                            session.overallScore < 60 && "text-red-600"
                                                                        )}>
                                                                            {session.overallScore}%
                                                                        </div>
                                                                        <div className="text-xs text-neutral-500">Score</div>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })
                                }
                            </AnimatePresence>
                        </div>
                    )
                }
            </div>
        </div>
    );
}