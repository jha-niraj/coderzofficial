"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, Clock, Shield, CheckCircle
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
    Card, CardContent
} from "@repo/ui/components/ui/card";

interface ConceptPendingGateProps {
    concept: {
        id: string;
        slug: string;
        title: string;
        description: string;
        iconEmoji: string | null;
        creator: {
            name: string | null;
            username: string | null;
        };
    };
}

export default function ConceptPendingGate({ concept }: ConceptPendingGateProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </div>
                </div>
            </div>
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
                        <CardContent className="p-12">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                                Concept Under Review
                            </h1>
                            <div className="mb-6">
                                <span className="text-4xl">{concept.iconEmoji || "📚"}</span>
                                <h2 className="text-lg font-semibold mt-2">{concept.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    by {concept.creator.name || concept.creator.username || "Creator"}
                                </p>
                            </div>
                            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                This concept has been submitted for review and is pending verification
                                by our team. Please check back later!
                            </p>
                            <div className="space-y-3 max-w-sm mx-auto mb-8">
                                {
                                    [
                                        { icon: Shield, text: "Ensuring quality content" },
                                        { icon: CheckCircle, text: "Verifying accuracy" },
                                        { icon: Clock, text: "Usually completed within 24 hours" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                                <item.icon className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                                            </div>
                                            {item.text}
                                        </div>
                                    ))
                                }
                            </div>
                            <Button
                                onClick={() => router.push("/concepts")}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                            >
                                Browse Other Concepts
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}