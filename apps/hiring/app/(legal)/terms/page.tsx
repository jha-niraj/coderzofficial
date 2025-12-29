"use client";

import { motion } from "framer-motion";
import {
    FileText, Building2
} from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
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
                        <FileText className="w-8 h-8 text-neutral-900 dark:text-white" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Legal Document
                    </span>
                    <h1 className="text-4xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                        Terms of Service
                    </h1>
                    <p className="text-neutral-500 mt-4 max-w-xl mx-auto">
                        Last updated: December 29, 2025
                    </p>
                </motion.div>
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
                                Acceptance of Terms
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                By accessing or using Coder&apos;z Hiring, you agree to be bound by these Terms of Service.
                                If you disagree with any part of the terms, you may not access the service.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">02</span>
                                Platform Services
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                Coder&apos;z Hiring provides a technical hiring platform that connects companies
                                with pre-vetted engineering candidates. Our services include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 ml-4">
                                <li>Candidate sourcing and vetting</li>
                                <li>Technical assessment tools</li>
                                <li>AI-powered interview systems</li>
                                <li>Application tracking and management</li>
                                <li>Analytics and reporting</li>
                            </ul>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">03</span>
                                Account Registration
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                To use our platform, you must register a company account and provide accurate information.
                                You are responsible for maintaining the confidentiality of your account credentials
                                and for all activities under your account.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">04</span>
                                User Conduct
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 ml-4">
                                <li>Post false, misleading, or discriminatory job listings</li>
                                <li>Misuse candidate information or violate their privacy</li>
                                <li>Attempt to circumvent platform fees or security measures</li>
                                <li>Use the platform for any unlawful purpose</li>
                                <li>Harass, abuse, or harm other users</li>
                            </ul>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">05</span>
                                Fees and Payment
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Subscription fees are billed according to your selected plan. All fees are non-refundable
                                unless otherwise specified. We reserve the right to modify pricing with 30 days notice.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">06</span>
                                Quality Guarantee
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                We offer a 30-day replacement guarantee for candidates hired through our platform.
                                If a hire doesn&apos;t meet expectations within 30 days, we&apos;ll provide replacement
                                candidates at no additional cost.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">07</span>
                                Intellectual Property
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                The platform, including its original content, features, and functionality,
                                is owned by Shunya Tech and protected by international copyright, trademark,
                                and other intellectual property laws.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">08</span>
                                Limitation of Liability
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Coder&apos;z Hiring shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages resulting from your use of the service.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">09</span>
                                Termination
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                We may terminate or suspend your account immediately for any breach of these Terms.
                                Upon termination, your right to use the platform will cease immediately.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">10</span>
                                Contact
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Questions about these Terms? Contact us at{" "}
                                <a href="mailto:legal@coderzai.xyz" className="text-neutral-900 dark:text-white hover:underline">
                                    legal@coderzai.xyz
                                </a>
                            </p>
                        </section>
                    </div>
                </motion.div>
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