"use client"

import { motion } from "framer-motion"
import {
    BookOpen, Code, Mic, Brain, FolderKanban, Users
} from "lucide-react"

const features = [
    {
        icon: BookOpen,
        title: "Smart Assignments",
        description: "Create quizzes, coding challenges, and projects that auto-grade. Save hours of manual evaluation.",
        color: "from-violet-500 to-purple-500"
    },
    {
        icon: Code,
        title: "Studio Projects",
        description: "Assign real-world coding projects with live preview. Students build, you track progress.",
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: Mic,
        title: "Mock Interviews",
        description: "AI-powered mock interviews for placement preparation. Get your students interview-ready.",
        color: "from-emerald-500 to-teal-500"
    },
    {
        icon: Brain,
        title: "Concept Spaces",
        description: "Interactive learning spaces for any topic. Visual, engaging, and self-paced learning.",
        color: "from-orange-500 to-amber-500"
    },
    {
        icon: FolderKanban,
        title: "Progress Tracking",
        description: "Real-time analytics on student performance. Identify at-risk students early.",
        color: "from-pink-500 to-rose-500"
    },
    {
        icon: Users,
        title: "Class Management",
        description: "Organize by semester, section, and department. Effortless student enrollment.",
        color: "from-indigo-500 to-violet-500"
    },
]

export default function FeaturesSection() {
    return (
        <div className="py-24 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400">
                        Platform Features
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Everything Your University Needs
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        From assignment creation to placement preparation, we&apos;ve got you covered with tools designed for technical education.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-6 rounded-2xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all hover:shadow-lg hover:shadow-violet-500/5"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}