"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { cn } from "@repo/ui/lib/utils"

const faqs = [
    {
        question: "How does student verification work?",
        answer: "Students sign up on the main platform and select their university. They verify using their university email address (.edu domain). Once verified, credits allocated by the university are added to their account automatically."
    },
    {
        question: "What happens if a student runs out of credits?",
        answer: "Students can complete mandatory assignments with university-allocated credits. If they want to explore additional features (personal projects, extra mock interviews), they can purchase credits individually or request more from the university."
    },
    {
        question: "Can we integrate with our existing LMS?",
        answer: "Yes! Enterprise plans include API access and custom integrations. We can sync grades, assignments, and student data with popular LMS platforms like Moodle, Canvas, and Blackboard."
    },
    {
        question: "How do private job listings work?",
        answer: "Placement officers can refer companies to our hiring platform. These companies can post jobs visible only to your university's verified students. You can also filter jobs by year, department, or other criteria."
    },
    {
        question: "What support do you provide during onboarding?",
        answer: "All plans include email support. Professional plans get priority support with a dedicated onboarding specialist. Enterprise plans include a dedicated account manager and on-site training if needed."
    },
    {
        question: "Is student data secure?",
        answer: "Absolutely. We are SOC 2 compliant and follow strict data privacy guidelines. Student data is encrypted at rest and in transit. Universities retain ownership of all student data."
    }
]

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className="py-24 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400">
                        FAQ
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Common Questions
                    </h2>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-800/50"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="cursor-pointer w-full flex items-center justify-between p-6 text-left"
                            >
                                <span className="font-bold text-neutral-900 dark:text-white pr-4">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-neutral-500 shrink-0 transition-transform",
                                        openIndex === index && "rotate-180"
                                    )}
                                />
                            </button>
                            <div
                                className={cn(
                                    "grid transition-all",
                                    openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-6 pb-6 text-neutral-600 dark:text-neutral-400">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}