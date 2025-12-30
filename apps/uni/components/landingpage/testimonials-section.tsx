"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
    {
        name: "Dr. Priya Sharma",
        role: "HOD, Computer Science",
        institution: "Delhi Technical University",
        image: null,
        content: "The auto-grading feature alone saves me 20+ hours per week. Students get instant feedback, and I can focus on teaching rather than evaluation.",
        rating: 5
    },
    {
        name: "Prof. Rajesh Kumar",
        role: "Placement Coordinator",
        institution: "IIT Roorkee",
        image: null,
        content: "Our placement rate improved by 40% after students started using the mock interview feature. The job board integration is seamless.",
        rating: 5
    },
    {
        name: "Dr. Anita Desai",
        role: "Dean of Academics",
        institution: "BITS Pilani",
        image: null,
        content: "Managing 8 semesters across 4 departments was a nightmare. Now everything is centralized, and analytics help us identify struggling students early.",
        rating: 5
    }
]

export default function TestimonialsSection() {
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
                        Testimonials
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Trusted by Educators
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Hear from professors and administrators who transformed their institutions.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                        >
                            {/* Rating */}
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-neutral-500">
                                        {testimonial.role}
                                    </div>
                                    <div className="text-xs text-violet-600 dark:text-violet-400">
                                        {testimonial.institution}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}