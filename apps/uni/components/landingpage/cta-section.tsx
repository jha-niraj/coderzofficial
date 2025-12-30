"use client"

import { motion } from "framer-motion"
import { ArrowRight, GraduationCap } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function CtaSection() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-12 rounded-[2rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-center overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Ready to Transform Your University?
                        </h2>
                        <p className="text-lg text-violet-100 max-w-2xl mx-auto mb-8">
                            Join 100+ universities already using Coder&apos;z University to deliver industry-ready education. Start your free trial today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register">
                                <Button
                                    size="lg"
                                    className="cursor-pointer rounded-full h-14 px-8 bg-white text-violet-700 hover:bg-violet-50 font-bold text-lg"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/contactus">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="cursor-pointer rounded-full h-14 px-8 border-white/30 text-white hover:bg-white/10 font-bold text-lg"
                                >
                                    Talk to Sales
                                </Button>
                            </Link>
                        </div>

                        <p className="mt-6 text-sm text-violet-200">
                            No credit card required • 30-day free trial • Cancel anytime
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}