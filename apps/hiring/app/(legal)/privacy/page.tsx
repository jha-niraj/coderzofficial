"use client";

import { motion } from "framer-motion";
import { Shield, Building2 } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Link href="/" className="inline-flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                            CODER&apos;Z <span className="text-neutral-500 font-mono font-normal">HIRING</span>
                        </span>
                    </Link>

                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-neutral-900 dark:text-white" />
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Legal Document
                    </span>
                    <h1 className="text-4xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                        Privacy Policy
                    </h1>
                    <p className="text-neutral-500 mt-4 max-w-xl mx-auto">
                        Last updated: December 29, 2025
                    </p>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 md:p-12"
                >
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">01</span>
                                Introduction
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Coder&apos;z Hiring (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                                when you use our hiring platform services.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">02</span>
                                Information We Collect
                            </h2>
                            <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
                                <p className="font-medium text-neutral-900 dark:text-white">Account Information</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Company name, website, and description</li>
                                    <li>Contact information (email, phone)</li>
                                    <li>User account credentials</li>
                                    <li>Team member information</li>
                                </ul>
                                <p className="font-medium text-neutral-900 dark:text-white mt-6">Usage Data</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Job posting and application data</li>
                                    <li>Platform interaction logs</li>
                                    <li>Analytics and performance metrics</li>
                                </ul>
                            </div>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">03</span>
                                How We Use Information
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 ml-4">
                                <li>Provide and maintain our hiring platform services</li>
                                <li>Match candidates with job opportunities</li>
                                <li>Facilitate communication between employers and candidates</li>
                                <li>Improve and optimize our platform</li>
                                <li>Send service-related communications</li>
                                <li>Ensure platform security and prevent fraud</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">04</span>
                                Data Sharing
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                We do not sell your personal information. We may share data with:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mt-4 text-neutral-600 dark:text-neutral-400 ml-4">
                                <li>Service providers who assist in platform operations</li>
                                <li>Law enforcement when required by law</li>
                                <li>Business partners with your explicit consent</li>
                            </ul>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">05</span>
                                Data Security
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                We implement industry-standard security measures including encryption,
                                access controls, and regular security audits to protect your data.
                            </p>
                        </section>

                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">06</span>
                                Your Rights
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 ml-4">
                                <li>Access and export your data</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Delete your account and associated data</li>
                                <li>Opt-out of marketing communications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">07</span>
                                Contact Us
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                For privacy-related inquiries, contact us at{" "}
                                <a href="mailto:privacy@coderzai.xyz" className="text-neutral-900 dark:text-white hover:underline">
                                    privacy@coderzai.xyz
                                </a>
                            </p>
                        </section>
                    </div>
                </motion.div>

                {/* Back Link */}
                <div className="text-center mt-8">
                    <Link
                        href="/"
                        className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
