"use client";

import { motion } from "framer-motion";
import { Mic, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";

export default function MockVoiceSection() {
    return (
        <Link href="/mock/voice">
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-4 cursor-pointer group"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                            <Mic className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-base">Mock Voice Interview</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Practice real interview scenarios with AI-powered voice feedback. Record responses and improve your communication skills.
                </p>
                <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                    Start Practice
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </motion.div>
        </Link>
    );
}
