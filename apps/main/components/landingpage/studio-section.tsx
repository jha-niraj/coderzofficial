"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import {
    Sparkles, FileText, Brain, Image as ImageIcon, MessageCircle, Code, Save,
    Layers, GraduationCap, CheckCircle2, Zap
} from "lucide-react"

const studioFeatures = [
    {
        icon: FileText,
        title: "Smart Editor",
        description: "Markdown support with intelligent formatting.",
        span: "col-span-1 md:col-span-2"
    },
    {
        icon: Brain,
        title: "Quiz Gen",
        description: "Auto-generate tests from your notes.",
        span: "col-span-1"
    },
    {
        icon: Layers,
        title: "Flashcards",
        description: "Spaced repetition built-in.",
        span: "col-span-1"
    },
    {
        icon: Code,
        title: "Code Sandbox",
        description: "Run snippets in 40+ languages directly in your notes.",
        span: "col-span-1 md:col-span-2"
    },
    {
        icon: ImageIcon,
        title: "AI Visuals",
        description: "Text-to-diagram generation.",
        span: "col-span-1"
    },
    {
        icon: MessageCircle,
        title: "Context Chat",
        description: "Ask your notes questions.",
        span: "col-span-1"
    }
]

export default function StudioSection() {
    return (
        <section className="py-32 relative bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-neutral-100 dark:bg-neutral-900 rounded-[100%] blur-[80px] -z-10 opacity-60" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center justify-center p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-8 border border-neutral-200 dark:border-neutral-700">
                        <Badge variant="secondary" className="px-6 py-2 rounded-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 font-medium text-sm shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                            The Learning OS
                        </Badge>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 text-neutral-900 dark:text-white tracking-tighter">
                        Your Personal <br />
                        <span className="text-neutral-400 dark:text-neutral-600">Learning Studio.</span>
                    </h2>
                    <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
                        A unified workspace that combines note-taking, active recall, and AI assistance into a single, distraction-free environment.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                        {
                            studioFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`${feature.span} group relative p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300`}
                                >
                                    <div className="absolute top-4 right-4 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                        <feature.icon className="w-5 h-5" />
                                    </div>
                                    <div className="mt-8">
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-5 h-full flex flex-col gap-6"
                    >
                        <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-3xl p-8 flex flex-col justify-between min-h-[300px] shadow-2xl shadow-neutral-900/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Save className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-xs font-mono uppercase tracking-widest opacity-70">System Active</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Focus on learning,<br />not saving.</h3>
                                <p className="opacity-70 leading-relaxed text-sm">
                                    Our state-engine captures every keystroke. Close the tab, lose internet, or crash your browser—your work is already preserved in the cloud.
                                </p>
                            </div>
                            <div className="relative z-10 pt-8 border-t border-white/10 dark:border-neutral-900/10 flex items-center gap-4">
                                <Badge className="bg-white/10 text-white dark:bg-neutral-900/10 dark:text-neutral-900 hover:bg-white/20 border-0">
                                    <Zap className="w-3 h-3 mr-2" />
                                    Real-time Sync
                                </Badge>
                                <Badge className="bg-white/10 text-white dark:bg-neutral-900/10 dark:text-neutral-900 hover:bg-white/20 border-0">
                                    <CheckCircle2 className="w-3 h-3 mr-2" />
                                    Version History
                                </Badge>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50 text-center">
                            <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Ready to ship your knowledge?</h4>
                            <p className="text-sm text-neutral-500 mb-6">Join thousands of students building their second brain.</p>
                            <Button asChild size="lg" className="w-full h-12 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity">
                                <Link href="/studio">
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Enter Studio
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}