"use client"

import { motion } from "framer-motion"
import {
    Building2, UserCheck, GraduationCap, Briefcase
} from "lucide-react"

const steps = [
    { id: "01", icon: Building2, title: "Register Entity", desc: "Institutional verification process." },
    { id: "02", icon: UserCheck, title: "Grant Access", desc: "Provision faculty and staff roles." },
    { id: "03", icon: GraduationCap, title: "Onboard Students", desc: "Bulk import or email domain sync." },
    { id: "04", icon: Briefcase, title: "Connect Partners", desc: "Enable direct hiring pipelines." }
]

export default function HowItWorksSection() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Deployment Protocol
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                        Implementation Logic
                    </h2>
                </motion.div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {
                        steps.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                {
                                    index < steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-neutral-200 dark:bg-neutral-800" />
                                    )
                                }
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-6 shadow-sm">
                                        <item.icon className="w-6 h-6 text-neutral-900 dark:text-white" />
                                    </div>
                                    <span className="text-xs font-mono text-neutral-400 mb-2 block">
                                        Step {item.id}
                                    </span>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-[200px] mx-auto">
                                        {item.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}