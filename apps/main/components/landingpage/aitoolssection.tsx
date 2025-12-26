"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    Briefcase, LayoutTemplate, GitPullRequest, ShieldCheck,
    ScanSearch, BrainCircuit, ArrowRight, Lock, Sparkles, Clock
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"

const tools = [
    {
        icon: Briefcase,
        title: "Interview Assistant",
        description: "Context-aware simulation that ingests your specific resume and job description to generate high-probability questions.",
        status: "Live",
        href: "/ai/interview-assistant"
    },
    {
        icon: LayoutTemplate,
        title: "System Architect",
        description: "Input a project idea and get a complete database schema, API endpoint structure, and tech stack recommendation.",
        status: "Coming Soon",
        href: "#"
    },
    {
        icon: GitPullRequest,
        title: "Open Source Scout",
        description: "Analyze your tech stack to find 'Good First Issues' in reputable repositories that actually match your skill level.",
        status: "Coming Soon",
        href: "#"
    },
    {
        icon: ShieldCheck,
        title: "Tech Stack Defender",
        description: "A hostile AI Senior Architect that ruthlessly questions your technology choices to prepare you for defense.",
        status: "Coming Soon",
        href: "#"
    },
    {
        icon: ScanSearch,
        title: "Portfolio Audit",
        description: "Scans your GitHub and Portfolio site to identify red flags, missing projects, and weak case studies.",
        status: "Coming Soon",
        href: "#"
    },
    {
        icon: BrainCircuit,
        title: "Project Scoper",
        description: "Turns a vague startup idea into a structured 4-week Sprint plan with user stories and MVP requirements.",
        status: "Coming Soon",
        href: "#"
    }
]

export default function AIToolsSection() {
    return (
        <section id="ai-tools" className="w-full relative py-24 overflow-hidden bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-neutral-100 dark:bg-neutral-900 blur-[100px] opacity-50" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="max-w-3xl"
                    >
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm backdrop-blur-sm mb-6">
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-neutral-900 dark:text-white" />
                            Intelligence Engine
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white tracking-tight">
                            Tools that make you <span className="text-neutral-400 dark:text-neutral-600">dangerous.</span>
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-2xl">
                            We don&apos;t build generic wrappers. We build specialized agents that help you architect systems, contribute to open source, and land high-impact roles.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Button variant="outline" asChild className="h-12 px-6 rounded-full border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900">
                            <Link href="/ai">
                                View Full Roster <ArrowRight className="ml-2 w-4 h-4" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {
                        tools.map((tool, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-neutral-900/5 dark:hover:shadow-black/50 transition-all duration-500 flex flex-col justify-between">
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 via-neutral-900 to-neutral-200 dark:from-neutral-800 dark:via-white dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className="p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                                                <tool.icon className="w-6 h-6" />
                                            </div>
                                            {
                                                tool.status === "Live" ? (
                                                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0 px-3">
                                                        Live
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-0 px-3">
                                                        Dev
                                                    </Badge>
                                                )
                                            }
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                                                {tool.title}
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                                {tool.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="px-8 pb-8 pt-0">
                                        {
                                            tool.status === "Live" ? (
                                                <Link href={tool.href} className="inline-flex items-center text-sm font-bold text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-1 hover:border-neutral-900 dark:hover:border-white transition-all">
                                                    Launch Tool <ArrowRight className="ml-2 w-4 h-4" />
                                                </Link>
                                            ) : (
                                                <div className="flex items-center text-sm font-medium text-neutral-400 cursor-not-allowed">
                                                    <Lock className="w-3.5 h-3.5 mr-2" />
                                                    Notify Me <Clock className="w-3.5 h-3.5 ml-auto opacity-50" />
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    }
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-16 relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
                >
                    <div className="absolute inset-0 bg-neutral-900 dark:bg-white/5"></div>
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                    <div className="relative p-10 md:p-16 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium mb-6">
                            <Sparkles className="w-3 h-3" />
                            <span>One Subscription</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                            Access the full <br className="hidden md:block" /> Engineering Intelligence Suite
                        </h3>
                        <p className="text-neutral-400 mb-10 max-w-lg mx-auto leading-relaxed">
                            Stop using generic tools. Get access to the entire suite of specialized developer agents with a single plan.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-full h-12 px-8">
                                Get Started Free
                            </Button>
                            <Button variant="outline" size="lg" className="bg-transparent text-white border-white/20 hover:bg-white/10 rounded-full h-12 px-8">
                                View Pricing
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}