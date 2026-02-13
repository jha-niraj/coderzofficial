"use client";

import { motion } from "framer-motion";
import { Mic, ChevronRight } from "lucide-react";
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

export default function MockVoicePreview({ sessions }: MockVoicePreviewProps) {
    const displaySessions = sessions.slice(0, 4);

    return (
        <div className="rounded-xl border border-amber-500/20 bg-card/50 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                        <Mic className="h-4 w-4 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-base">Mock Voice</h3>
                </div>
                <Link
                    href="/mock/voice"
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-0.5"
                >
                    View all
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>
            {displaySessions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {displaySessions.map((session) => (
                        <Link
                            key={session.id}
                            href={`/mock/voice/results/${session.id}`}
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-sm font-medium transition-colors"
                            >
                                <span className="truncate max-w-[160px]">
                                    {session.mock.title}
                                </span>
                                <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                        No mock sessions yet. Start practicing!
                    </p>
                    <Link href="/mock/voice">
                        <motion.span
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-sm font-medium cursor-pointer"
                        >
                            Start Practice
                            <ChevronRight className="h-3 w-3" />
                        </motion.span>
                    </Link>
                </div>
            )}
        </div>
    );
}
