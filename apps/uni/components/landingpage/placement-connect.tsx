"use client"

import { motion } from "framer-motion"
import { Briefcase, Building2, TrendingUp, Users, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function PlacementConnect() {
    return (
        <div className="py-24 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-neutral-950">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400">
                            Placement Connect
                        </span>
                        <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Bridge Students to{" "}
                            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                Opportunities
                            </span>
                        </h2>
                        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                            Refer companies to our hiring platform. They post jobs visible only to your students.
                            Track placements, manage campus drives, all in one place.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                "Post exclusive jobs for your students only",
                                "Refer companies and track their hiring activity",
                                "Placement analytics and reports",
                                "Direct connection to our hiring partner network"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-violet-600 shrink-0" />
                                    <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href="/register">
                                <Button className="cursor-pointer rounded-full h-12 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold">
                                    Start Connecting
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {[
                            { icon: Briefcase, value: "5,000+", label: "Jobs Posted", color: "from-blue-500 to-cyan-500" },
                            { icon: Building2, value: "500+", label: "Partner Companies", color: "from-emerald-500 to-teal-500" },
                            { icon: Users, value: "10,000+", label: "Students Placed", color: "from-violet-500 to-purple-500" },
                            { icon: TrendingUp, value: "85%", label: "Avg Placement Rate", color: "from-orange-500 to-amber-500" },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="p-6 rounded-2xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-neutral-500 mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
