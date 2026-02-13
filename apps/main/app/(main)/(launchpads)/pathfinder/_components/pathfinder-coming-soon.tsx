"use client";

import { motion } from "framer-motion";
import { Map, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";

export default function PathfinderComingSoon() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <Card className="border-primary/10 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary to-purple-500" />
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4">
                            <Map className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Pathfinder</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                            Learning paths & goals
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <div className="rounded-lg bg-muted/50 p-4">
                            <p className="text-sm font-medium">Coming Soon</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Pathfinder is under development. Stay tuned for curated learning paths and goal tracking!
                            </p>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/home" className="flex items-center justify-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Home
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
