"use client"

import { motion } from "framer-motion"
import { Coins, Users, ArrowRightLeft, Shield } from "lucide-react"

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
                    <span className="px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        Credit System
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Simple, Transparent Credits
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Purchase credits for your university. Students use them for assignments and can explore freely with extras.
                    </p>
                </motion.div>

                {/* Credit Flow Visualization */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                        {/* University Purchase */}
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 mx-auto">
                                <Coins className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-2">
                                University Purchases
                            </h3>
                            <p className="text-center text-neutral-600 dark:text-neutral-400">
                                Buy credits in bulk for your students. Volume discounts available.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-3xl font-bold text-amber-600">500</span>
                                <span className="text-neutral-500 ml-1">credits/student/sem</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                <ArrowRightLeft className="w-6 h-6 text-neutral-400" />
                            </div>
                        </div>

                        {/* Student Receives */}
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-6 mx-auto">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-center text-neutral-900 dark:text-white mb-2">
                                Students Receive
                            </h3>
                            <p className="text-center text-neutral-600 dark:text-neutral-400">
                                After verification, credits appear in student accounts instantly.
                            </p>
                            <div className="mt-4 text-center">
                                <span className="text-3xl font-bold text-violet-600">60%</span>
                                <span className="text-neutral-500 ml-1">for assignments</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Features */}
                    <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: "🎯", text: "Assignments deduct credits automatically" },
                            { icon: "🎨", text: "Extra credits for personal exploration" },
                            { icon: "📊", text: "Real-time usage analytics" },
                            { icon: "♻️", text: "Unused credits roll over (optional)" },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 flex items-center justify-center gap-2 text-neutral-500"
                >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">No hidden fees. Cancel anytime. Full transparency.</span>
                </motion.div>
            </div>
        </div>
    )
}
