"use client";

import { motion } from "framer-motion";
import {
    Video, Clock
} from "lucide-react";

export default function StudioVideoBlock() {
    return (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-900">
            <div className="p-8 text-center">
                <motion.div
                    className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 mx-auto mb-6 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Video className="h-10 w-10 text-orange-500" />
                </motion.div>
                <div className="flex items-center justify-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                        AI Video Generation
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        Coming Soon
                    </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
                    Generate educational videos, explainers, and visual content with AI.
                    Perfect for creating engaging learning materials.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <Clock className="h-4 w-4" />
                    <span>Expected Q2 2025</span>
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {
                        ["Educational Videos", "Code Walkthroughs", "Concept Explainers", "Animations"].map((feature) => (
                            <span
                                key={feature}
                                className="px-3 py-1 text-xs rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                            >
                                {feature}
                            </span>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}