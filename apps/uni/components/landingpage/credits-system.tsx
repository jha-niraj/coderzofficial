"use client"

import { motion } from "framer-motion"
import {
    Coins, Users, ArrowRight, Shield, RefreshCw, BarChart
} from "lucide-react"

export default function CreditsSystem() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-orange-600 dark:text-orange-500 mb-2 block">
                        Resource Allocation
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Credit Distribution Protocol
                    </h2>
                </motion.div>
                <div className="relative grid md:grid-cols-3 gap-8 items-stretch">
                    <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-6 shadow-sm">
                            <Coins className="w-8 h-8 text-neutral-900 dark:text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Acquisition</h3>
                        <p className="text-sm text-neutral-500 mb-4">University purchases bulk credit pools.</p>
                        <div className="mt-auto py-2 px-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-lg">
                            <span className="text-2xl font-bold text-orange-600 dark:text-orange-500">500</span>
                            <span className="text-[10px] font-mono uppercase text-orange-600/70 ml-2">Credits / Student</span>
                        </div>
                    </div>
                    <div className="hidden md:flex flex-col items-center justify-center relative z-0">
                        <div className="h-px w-full bg-neutral-200 dark:border-neutral-800 border-t border-dashed border-neutral-300 dark:border-neutral-700 absolute top-1/2 left-0" />
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center relative z-10">
                            <ArrowRight className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="mt-4 text-[10px] font-mono text-neutral-400 uppercase tracking-widest bg-white dark:bg-neutral-950 px-2 relative z-10">
                            Allocation
                        </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center text-center relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-6 shadow-sm">
                            <Users className="w-8 h-8 text-neutral-900 dark:text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Execution</h3>
                        <p className="text-sm text-neutral-500 mb-4">Students utilize credits for tasks.</p>
                        <div className="mt-auto py-2 px-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg w-full">
                            <div className="flex justify-between text-xs font-mono mb-1">
                                <span>ASSIGNMENTS</span>
                                <span>60%</span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-neutral-900 dark:bg-white h-full w-[60%]" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {
                        [
                            { icon: RefreshCw, text: "Auto-Rollover" },
                            { icon: Shield, text: "Audit Logs" },
                            { icon: BarChart, text: "Usage Analytics" },
                            { icon: Coins, text: "Top-up API" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                                <item.icon className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.text}</span>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}