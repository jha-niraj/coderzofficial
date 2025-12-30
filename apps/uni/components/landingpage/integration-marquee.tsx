"use client"

import { motion } from "framer-motion"

const integrations = [
    "Coding Studio", "AI Interviewer", "LMS Sync",
    "Open Source", "Private Jobs", "Code Editor",
    "Video Rooms", "Analytics Core", "Calendar API",
    "Audit Logs", "Report Gen", "SSO Auth"
]

export default function IntegrationMarquee() {
    return (
        <div className="py-16 bg-neutral-50 dark:bg-neutral-900 overflow-hidden border-y border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Platform Architecture
                </span>
            </div>
            <div className="relative">
                <div className="flex overflow-hidden">
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 40,
                                ease: "linear",
                            },
                        }}
                        className="flex gap-8 pr-8"
                    >
                        {
                            [...integrations, ...integrations, ...integrations].map((item, idx) => (
                                <div key={idx} className="whitespace-nowrap">
                                    <span className="text-lg font-bold text-neutral-300 dark:text-neutral-700 uppercase tracking-tight">
                                        {item}
                                    </span>
                                </div>
                            ))
                        }
                    </motion.div>
                </div>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-neutral-50 dark:from-neutral-900 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-neutral-50 dark:from-neutral-900 to-transparent pointer-events-none" />
            </div>
        </div>
    )
}