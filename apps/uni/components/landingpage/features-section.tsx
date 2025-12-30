"use client"

import { motion } from "framer-motion"
import {
    BookOpen, Code, Mic, Brain, FolderKanban, Users
} from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

const features = [
    {
        icon: BookOpen,
        title: "Smart Assignments",
        description: "Automated grading pipelines for quizzes and code. Reduce evaluation latency by 90%.",
    },
    {
        icon: Code,
        title: "Studio Projects",
        description: "Live preview environments. Students push code; you review architecture, not just output.",
    },
    {
        icon: Mic,
        title: "AI Interviewer",
        description: "Autonomous mock interviews with voice analysis. Standardized scoring for placement readiness.",
    },
    {
        icon: Brain,
        title: "Concept Spaces",
        description: "Self-paced interactive modules. Visual learning paths for complex technical topics.",
    },
    {
        icon: FolderKanban,
        title: "Progress Telemetry",
        description: "Real-time analytics dashboards. Identify at-risk students before exams.",
    },
    {
        icon: Users,
        title: "Cohort Management",
        description: "Bulk operations for semesters and sections. Seamless student lifecycle management.",
    },
]

export default function FeaturesSection() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Core System
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                        University Operating System
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        A unified technical infrastructure designed to modernize educational delivery.
                    </p>
                </motion.div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {
                        features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "group p-8 rounded-2xl transition-all duration-300",
                                    "bg-neutral-50 dark:bg-neutral-900",
                                    "border border-neutral-200 dark:border-neutral-800",
                                    "hover:border-neutral-400 dark:hover:border-neutral-700"
                                )}
                            >
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-6 h-6 text-neutral-900 dark:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}