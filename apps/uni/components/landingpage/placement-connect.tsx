"use client"

import { motion } from "framer-motion"
import {
    Briefcase, Building2, TrendingUp, Users, CheckCircle
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function PlacementConnect() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                            Hiring Pipeline
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                            Direct Industry <br /> Connection
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                            Refer partner companies to post jobs exclusively for your verified students.
                            Create a private job board ecosystem.
                        </p>
                        <div className="space-y-4 mb-8">
                            {
                                [
                                    "Private Job Listings",
                                    "Placement Analytics",
                                    "Partner Company Portal",
                                    "Campus Drive Management"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-neutral-900 dark:text-white shrink-0" />
                                        <span className="text-neutral-700 dark:text-neutral-300 font-medium">{item}</span>
                                    </div>
                                ))
                            }
                        </div>
                        <Link href="/register">
                            <Button className="h-12 px-8 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black font-bold">
                                Setup Placement Cell
                            </Button>
                        </Link>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {
                            [
                                { icon: Briefcase, value: "5k+", label: "Active Jobs" },
                                { icon: Building2, value: "500+", label: "Partners" },
                                { icon: Users, value: "10k+", label: "Placed" },
                                { icon: TrendingUp, value: "85%", label: "Success Rate" },
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                                >
                                    <stat.icon className="w-6 h-6 text-neutral-900 dark:text-white mb-4" />
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs font-mono uppercase text-neutral-500 mt-1">
                                        {stat.label}
                                    </div>
                                </div>
                            ))
                        }
                    </motion.div>
                </div>
            </div>
        </div>
    )
}