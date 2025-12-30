"use client"

import { motion } from "framer-motion"
import { Building2, UserCheck, GraduationCap, Briefcase } from "lucide-react"

const steps = [
    {
        step: "01",
        icon: Building2,
        title: "Register Your University",
        description: "Sign up with your university details and get verified by our team. Takes less than 24 hours."
    },
    {
        step: "02",
        icon: UserCheck,
        title: "Invite Faculty & Staff",
        description: "Add department heads, professors, and placement officers. Each role has tailored permissions."
    },
    {
        step: "03",
        icon: GraduationCap,
        title: "Students Get Verified",
        description: "Students verify with their university email. They get credits allocated to their account."
    },
    {
        step: "04",
        icon: Briefcase,
        title: "Connect to Opportunities",
        description: "Post exclusive jobs, track placements, and connect students directly to hiring partners."
    }
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
                    <span className="px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400">
                        How It Works
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Get Started in 4 Steps
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        From registration to your first placement, we make the onboarding process seamless.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((item, index) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-[60%] w-full h-px bg-gradient-to-r from-violet-300 to-transparent dark:from-violet-700" />
                            )}

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                                    <item.icon className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-xs font-mono text-violet-600 dark:text-violet-400 mb-2">
                                    Step {item.step}
                                </span>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}