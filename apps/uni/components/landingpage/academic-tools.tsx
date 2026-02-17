"use client"

import { motion } from "framer-motion"
import {
    FileQuestion, Code2, Presentation, Lightbulb
} from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

const tools = [
    {
        title: "Quiz Assessments",
        desc: "MCQs & Learnual validation. Auto-graded instantly.",
        icon: FileQuestion,
        tags: ["Auto-Grading", "Analytics"],
        colSpan: "lg:col-span-1"
    },
    {
        title: "Code Sandbox",
        desc: "Production-grade environment with test case validation and multi-language support.",
        icon: Code2,
        tags: ["Live Execution", "Test Cases", "Anti-Cheat"],
        colSpan: "lg:col-span-1"
    },
    {
        title: "AI Interviewer",
        desc: "Autonomous mock interviews with voice and code analysis for placement prep.",
        icon: Presentation,
        tags: ["Voice Analysis", "Feedback Loop"],
        colSpan: "lg:col-span-1"
    },
    {
        title: "Learning Modules",
        desc: "Self-paced interactive content delivery system.",
        icon: Lightbulb,
        tags: ["Progress Tracking", "Rich Media"],
        colSpan: "lg:col-span-1"
    }
]

export default function AcademicTools() {
    return (
        <div className="py-24 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Modules
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Evaluation Engine
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-6">
                    {tools.map((tool, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "group p-8 rounded-2xl transition-all duration-300",
                                "bg-white dark:bg-neutral-950",
                                "border border-neutral-200 dark:border-neutral-800",
                                "hover:border-neutral-400 dark:hover:border-neutral-600"
                            )}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                                    <tool.icon className="w-6 h-6" />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                {tool.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-sm leading-relaxed">
                                {tool.desc}
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {tool.tags.map((tag, t) => (
                                    <span key={t} className="px-2 py-1 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono uppercase tracking-wide text-neutral-500">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}