"use client"

import { motion } from "framer-motion"

const integrations = [
    "Coding Studio", "AI Mock Interviews", "Assessments",
    "Learning Spaces", "Open Source", "Job Board",
    "Code Editor", "Video Calls", "Analytics",
    "Notifications", "Calendar", "Reports"
]

export default function IntegrationMarquee() {
    return (
        <div className="py-16 bg-white dark:bg-neutral-950 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <span className="px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                        Powered By Main Platform
                    </span>
                    <h3 className="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
                        All Features, One Integration
                    </h3>
                </motion.div>
            </div>

            {/* Marquee */}
            <div className="relative">
                <div className="flex overflow-hidden">
                    <motion.div
                        animate={{ x: [0, -1920] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 30,
                                ease: "linear",
                            },
                        }}
                        className="flex gap-4 pr-4"
                    >
                        {[...integrations, ...integrations, ...integrations].map((item, idx) => (
                            <div
                                key={idx}
                                className="px-6 py-3 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 whitespace-nowrap"
                            >
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    {item}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Gradient Overlays */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-neutral-950 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-neutral-950 to-transparent pointer-events-none" />
            </div>
        </div>
    )
}
