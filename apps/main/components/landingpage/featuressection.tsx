"use client"

import {
    BrainCircuit, Code2, GraduationCap, BarChart3, GitMerge, FileCode, ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion';
import { Button } from '@repo/ui/components/ui/button';
import Link from 'next/link';

const features = [
    {
        icon: BrainCircuit,
        title: "Adaptive Learning",
        description: "AI that adjusts problem difficulty based on your real-time performance metrics."
    },
    {
        icon: Code2,
        title: "Polyglot Sandbox",
        description: "Execute Python, Java, C++, and JS code directly in the browser with near-native performance."
    },
    {
        icon: BarChart3,
        title: "Skill Telemetry",
        description: "Detailed analytics on your coding velocity, error rates, and algorithmic efficiency."
    },
    {
        icon: GitMerge,
        title: "Open Source Guide",
        description: "Step-by-step walkthroughs for forking, cloning, and pushing to enterprise repos."
    },
    {
        icon: GraduationCap,
        title: "Verified Certs",
        description: "Blockchain-verified certificates that you can export directly to LinkedIn."
    },
    {
        icon: FileCode,
        title: "Project Portfolio",
        description: "Build full-stack applications with guided specs, not just copy-paste tutorials."
    }
]

export default function FeaturesSection() {
    return (
        <section className="py-24 w-full bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-white tracking-tight">
                        The Full Stack.
                    </h2>
                    <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-light">
                        A complete ecosystem designed to take you from &quot;Hello World&quot; to Senior Engineer.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {
                        features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors duration-300"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-6 text-neutral-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            )
                        })
                    }
                </div>
                <div className="mt-12 text-center">
                    <Link href="/explore">
                        <Button variant="ghost" className="text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            Explore Technical Resources <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}