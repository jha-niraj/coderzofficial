"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    ArrowRight, GitBranch, GitMerge, Terminal, Banknote, ShieldCheck
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"

const tracks = [
    {
        title: "Community Track",
        description: "Start here. Pick up 'Good First Issues', improve documentation, and get your first PR merged into the ecosystem.",
        icon: GitBranch,
        badge: "Open Access",
        stats: "150+ Issues Available",
        href: "/opensource/community"
    },
    {
        title: "Bounty Program",
        description: "Solve complex architectural challenges and critical bugs. Bounties are paid out upon successful merge and review.",
        icon: Banknote,
        badge: "Paid Contributions",
        stats: "Avg. Bounty: $150",
        href: "/opensource/bounties"
    },
    {
        title: "Core Maintainer",
        description: "Invite-only access for top contributors. Manage repositories, review PRs, and shape the technical roadmap.",
        icon: ShieldCheck,
        badge: "Invite Only",
        stats: "Equity & Retainers",
        href: "/opensource/maintainers"
    },
]

export default function OpenSourceSection() {
    return (
        <section id="open-source" className="w-full bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 relative py-24">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <Badge variant="outline" className="px-3 py-1 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-xs mb-6 uppercase tracking-wider">
                            <GitMerge className="w-3 h-3 mr-2" />
                            Contribution Ecosystem
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white tracking-tight">
                            Build real software. <br />
                            <span className="text-neutral-400 dark:text-neutral-600">Get real rewards.</span>
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light leading-relaxed max-w-xl">
                            Stop building to-do apps. Contribute to production-grade open source software used by thousands.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="flex gap-8 text-sm font-medium text-neutral-500"
                    >
                        <div>
                            <span className="block text-2xl font-bold text-neutral-900 dark:text-white">500+</span>
                            <span>Active Issues</span>
                        </div>
                        <div>
                            <span className="block text-2xl font-bold text-neutral-900 dark:text-white">$50k+</span>
                            <span>Bounties Paid</span>
                        </div>
                    </motion.div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {
                        tracks.map((track, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="group relative h-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white">
                                                <track.icon className="w-6 h-6" />
                                            </div>
                                            <Badge variant="secondary" className="bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                                {track.badge}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                                            {track.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                                            {track.description}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono text-neutral-400">
                                                {track.stats}
                                            </span>
                                            <Link href={track.href} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                                                <ArrowRight className="w-4 h-4 text-neutral-900 dark:text-white" />
                                            </Link>
                                        </div>
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
                    className="mt-16 bg-neutral-900 rounded-2xl p-8 md:p-12 relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-green-400 font-mono text-sm mb-4">
                                <Terminal className="w-4 h-4" />
                                <span>git commit -m &quot;feat: first contribution&quot;</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Ready to ship code?</h3>
                            <p className="text-neutral-400 max-w-lg">
                                Join 10,000+ developers building the future. Start with our &quot;Good First Issue&quot; filter.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button className="bg-white text-neutral-900 hover:bg-neutral-100 rounded-full h-12 px-8">
                                View Issues
                            </Button>
                            <Button variant="outline" className="bg-transparent text-white border-neutral-700 hover:bg-neutral-800 rounded-full h-12 px-8">
                                Read Guide
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}