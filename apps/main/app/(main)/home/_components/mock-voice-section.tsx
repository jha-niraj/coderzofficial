"use client";

import { motion } from "framer-motion";
import { Mic, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";

export default function MockVoiceSection() {
    return (
        <Link href="/mock/voice">
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 overflow-hidden cursor-pointer group">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                                    <Mic className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-lg">Mock Voice Interview</CardTitle>
                            </div>
                            <ArrowRight className="h-5 w-5 text-amber-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Practice real interview scenarios with AI-powered voice feedback. Get instant responses and improve your communication skills.
                        </p>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            Start Practice
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    );
}
