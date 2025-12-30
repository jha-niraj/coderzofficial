"use client"

import { motion } from "framer-motion"
import {
    ArrowRight, GraduationCap
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function CtaSection() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-12 rounded-[2rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <GraduationCap className="w-8 h-8 text-neutral-900 dark:text-white" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-neutral-900 dark:text-white mb-6">
                            Modernize Your Campus.
                        </h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/register">
                                <Button className="h-14 px-8 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold">
                                    Start Pilot Program
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/contactus">
                                <Button variant="outline" className="h-14 px-8 rounded-full border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:bg-white dark:hover:bg-neutral-800 font-bold">
                                    Contact Sales
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}