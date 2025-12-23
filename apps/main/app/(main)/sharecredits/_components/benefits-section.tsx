"use client"

import { motion } from "framer-motion"
import { 
    Users, Trophy, Zap 
} from "lucide-react"

export default function BenefitsSection() {
    const benefits = [
        {
            icon: Users,
            title: "Build Your Network",
            description: "Support peers and create a collaborative learning environment. Learning together beats learning alone.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Zap,
            title: "Unlock AI Tools",
            description: "Credits give access to premium AI generators, mock interviews, and personalized roadmaps.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            icon: Trophy,
            title: "Community Rewards",
            description: "Top contributors get recognized. Earn badges and exclusive perks for helping others succeed.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
    ]

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Why Share Credits?</h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                    Our credit system is designed to make education accessible and collaborative.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {
                benefits.map((benefit, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white dark:bg-neutral-800 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    >
                        <div className={`h-12 w-12 rounded-xl ${benefit.bg} flex items-center justify-center mb-6`}>
                            <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">{benefit.title}</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {benefit.description}
                        </p>
                    </motion.div>
                ))
                }
            </div>
        </section>
    )
}