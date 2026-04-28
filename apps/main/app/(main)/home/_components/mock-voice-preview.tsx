"use client";

import { motion } from "framer-motion";
import { Mic, ArrowRight, Play } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import Link from "next/link";

interface MockSession {
    id: string;
    status: string;
    createdAt: Date;
    mock: {
        id: string;
        title: string;
        category: string;
    };
}

interface MockVoicePreviewProps {
    sessions: MockSession[];
}

const categoryConfig: Record<string, { emoji: string; color: string }> = {
    TECHNICAL:     { emoji: "💻", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"      },
    BEHAVIORAL:    { emoji: "🤝", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"  },
    HR:            { emoji: "👔", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    SYSTEM_DESIGN: { emoji: "🏗️", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
    LEADERSHIP:    { emoji: "👑", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"  },
    CODING:        { emoji: "⌨️", color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
    GENERAL:       { emoji: "📋", color: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20" },
};

const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function MockVoicePreview({ sessions }: MockVoicePreviewProps) {
    const display = sessions.slice(0, 4);

    return (
        <div className="h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Mic className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="font-semibold text-sm">Mock Interviews</span>
                </div>
                <Link href="/mock/voice" className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    View all <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col justify-center">
                {display.length > 0 ? (
                    <div className="space-y-2">
                        {display.map((s, i) => {
                            const cfg = categoryConfig[s.mock.category] ?? categoryConfig.GENERAL!;
                            const isCompleted = s.status === "COMPLETED";
                            return (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <Link href={isCompleted ? `/mock/voice/results/${s.id}` : `/mock/voice/interview/${s.id}`}>
                                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
                                            <span className="text-base flex-shrink-0">{cfg.emoji}</span>
                                            <span className="flex-1 text-sm font-medium truncate text-neutral-800 dark:text-neutral-200">
                                                {s.mock.title}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 flex-shrink-0">
                                                {formatDate(s.createdAt)}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${cfg.color} flex-shrink-0`}>
                                                {isCompleted ? "Done" : "Active"}
                                            </Badge>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
                            <Mic className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No sessions yet</p>
                            <p className="text-xs text-neutral-500 mt-0.5">Practice with an AI interviewer</p>
                        </div>
                        <Link href="/mock/voice" className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-600 transition-colors">
                            <Play className="h-3 w-3" />
                            Start a mock interview
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
