"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
    MessageCircle, Plus, HelpCircle
} from "lucide-react";
import Link from "next/link";

// FAQ data
const faqData = [
    {
        id: "item-1",
        question: "How do I start learning a programming language on The Coder'z?",
        answer: "To get started, simply create an account, choose a language you want to learn, and explore our resources. We offer beginner-friendly content for C, C++, Java, Python, and more. You can start with foundational topics and progress to advanced materials."
    },
    {
        id: "item-2",
        question: "Are the resources on The Coder'z suitable for beginners?",
        answer: "Yes! Our resources are designed to cater to all levels, from beginners to advanced learners. For each language, we provide structured content with easy-to-follow explanations, practical examples, and exercises to reinforce your learning."
    },
    {
        id: "item-3",
        question: "Do I get a certificate after completing a course?",
        answer: "Currently, we do not offer certificates for completing individual lessons or resources. However, you can track your progress and gain skills that are highly valuable in the industry. We’re working on integrating certifications in the future."
    },
    {
        id: "item-4",
        question: "Can I ask questions or get help if I am stuck?",
        answer: "Yes, you can reach out to our support team or community forums for help. Additionally, we offer occasional live Q&A sessions and are planning a mentorship program to help learners with personalized guidance."
    },
    {
        id: "item-5",
        question: "Is there a way to practice coding on The Coder'z?",
        answer: "Absolutely! Many of our lessons include coding exercises you can complete directly on the platform. We also provide project-based exercises to help you apply what you’ve learned to real-world scenarios."
    },
    {
        id: "item-6",
        question: "How often are new resources or courses added?",
        answer: "We frequently update and expand our content based on industry trends and user feedback. New courses, languages, and topics are added regularly, so check back often for the latest resources."
    },
    {
        id: "item-7",
        question: "Do I need any prior experience to start learning on The Coder'z?",
        answer: "No prior experience is needed! We offer beginner-friendly tutorials and step-by-step guides for every programming language. If you're new to coding, you can start with our foundational courses and work your way up."
    },
    {
        id: "item-8",
        question: "Are there any costs associated with using The Coder'z?",
        answer: "The Coder'z offers many free resources, and we also have premium content available for those looking for in-depth tutorials, hands-on projects, and mentorship opportunities. You can explore our pricing options on our site."
    },
    {
        id: "item-9",
        question: "Can I access The Coder'z on mobile devices?",
        answer: "Yes, The Coder'z is accessible on mobile devices, so you can learn on the go. The website is optimized for mobile, allowing you to access resources, watch tutorials, and even participate in coding exercises from your smartphone or tablet."
    },
];

export default function FaqsAccrodian() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    return (
        <section className="py-24 relative bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm mb-6">
                                    <HelpCircle className="w-3.5 h-3.5 mr-2" />
                                    Knowledge Base
                                </Badge>
                                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
                                    Common <br />
                                    <span className="text-neutral-400 dark:text-neutral-600">Questions.</span>
                                </h2>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
                                    Everything you need to know about the platform, certifications, and technical capabilities.
                                </p>

                                <Link href="mailto:thecoderzofficial@gmail.com">
                                    <Button className="h-12 px-6 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-medium transition-all">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Talk to Support
                                    </Button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                    <div className="lg:col-span-8">
                        <div className="space-y-4">
                            {
                                faqData.map((faq, index) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                        className="group border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(openIndex === faq.id ? null : faq.id)}
                                            className="flex items-start justify-between w-full p-6 text-left"
                                        >
                                            <span className="text-lg font-semibold text-neutral-900 dark:text-white pr-8">
                                                {faq.question}
                                            </span>
                                            <div className={`flex-shrink-0 transition-transform duration-300 ${openIndex === faq.id ? "rotate-45" : "rotate-0"}`}>
                                                {
                                                    openIndex === faq.id ? (
                                                        <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                                                            <Plus className="w-5 h-5 rotate-45" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {
                                                openIndex === faq.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    >
                                                        <div className="px-6 pb-6 pt-0">
                                                            <div className="h-px w-full bg-neutral-100 dark:bg-neutral-800 mb-4" />
                                                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                                {faq.answer}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                )
                                            }
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};