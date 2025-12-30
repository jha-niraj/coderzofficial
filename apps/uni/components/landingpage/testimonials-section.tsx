"use client"

import { motion } from "framer-motion"
import { 
    Star 
} from "lucide-react"

const testimonials = [
    { name: "Dr. P. Sharma", role: "HOD CSE", institution: "DTU", content: "Auto-grading saves us 20 hours/week." },
    { name: "Prof. R. Kumar", role: "Placement Cell", institution: "IIT Roorkee", content: "Placement rates up by 40%." },
    { name: "Dr. A. Desai", role: "Dean", institution: "BITS Pilani", content: "Centralized management is a game changer." }
]

export default function TestimonialsSection() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Feedback Loop
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Academic Partners
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {
                        testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                            >
                                <div className="flex gap-1 mb-4 text-neutral-900 dark:text-white">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                                    &quot;{t.content}&quot;
                                </p>
                                <div>
                                    <div className="font-bold text-sm text-neutral-900 dark:text-white">{t.name}</div>
                                    <div className="text-xs font-mono text-neutral-500 uppercase mt-1">
                                        {t.role} {t.institution}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}