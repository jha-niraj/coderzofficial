"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { cn } from "@repo/ui/lib/utils"

const testimonials = [
    { name: "Priya Sharma", role: "VP Engineering", company: "TechCorp", content: "We stopped filtering resumes. We just look at the code quality reports now." },
    { name: "Rahul Mehta", role: "CTO", company: "DevStream", content: "The Open Source Sandbox gave us the only signal that actually correlated with job performance." },
    { name: "Ananya Patel", role: "Head of Talent", company: "FinGrid", content: "Automated assessments cut our engineering hours spent on hiring by 70%." },
    { name: "David Kim", role: "Founder", company: "AI Labs", content: "Candidates prefer this. They hate whiteboard interviews. They love building real features." },
    { name: "Sarah Jenkins", role: "Lead Dev", company: "CloudScale", content: "The ability to see commit history and architectural decisions is invaluable." },
    { name: "Vikram Singh", role: "Engineering Mgr", company: "DataFlow", content: "We hired our best senior engineer through the Assignment Studio in 3 days." },
]

export default function TestimonialsSection() {
    return (
        <section id="testimonials" className="py-32 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Validation
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                        System Efficiency Reports
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-900",
                                "border border-neutral-200 dark:border-neutral-800",
                                "hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                            )}
                        >
                            <div className="flex gap-1 mb-6 text-neutral-900 dark:text-white">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                                &ldquo;{t.content}&rdquo;
                            </p>
                            <div>
                                <div className="font-bold text-neutral-900 dark:text-white text-sm">{t.name}</div>
                                <div className="text-xs font-mono text-neutral-500 uppercase mt-1">
                                    {t.role} {"//"} {t.company}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}