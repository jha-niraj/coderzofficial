"use client";

import { motion } from "framer-motion";
import {
    FileText, GraduationCap
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
                        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                            CODER&apos;Z <span className="text-violet-500 font-mono font-normal">UNI</span>
                        </span>
                    </Link>
                    <div className="w-16 h-16 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Legal Document
                    </span>
                    <h1 className="text-4xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                        Terms of Service
                    </h1>
                    <p className="text-neutral-500 mt-4 max-w-xl mx-auto">
                        Last updated: December 30, 2025
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
                                By accessing or using Coder&apos;z Uni, you agree to be bound by these Terms of Service.
                                If you disagree with any part of the terms, you may not access the service.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">02</span>
                                Platform Services
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                Coder&apos;z Uni provides an educational technology platform that connects universities
                                with industry-standard learning and assessment tools. Our services include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 ml-4">
                                <li>Assignment and assessment management</li>
                                <li>AI-powered coding assessments</li>
                                <li>Mock interview practice systems</li>
                                <li>Student progress tracking and analytics</li>
                                <li>Placement portal integration</li>
                                <li>Credit-based resource allocation</li>
                            </ul>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">03</span>
                                Account Registration
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Universities must register and complete verification to use our platform. Faculty members
                                are invited by university administrators. Students verify through their university email domain.
                                You are responsible for maintaining the confidentiality of your account credentials.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">04</span>
                                User Conduct
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">You agree not to:</p>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 ml-4">
                                <li>Submit plagiarized or dishonest work</li>
                                <li>Share account credentials or bypass security measures</li>
                                <li>Misuse platform resources or credits</li>
                                <li>Attempt to manipulate grades or assessment results</li>
                                <li>Harass, abuse, or harm other users</li>
                                <li>Use the platform for any unlawful purpose</li>
                            </ul>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">05</span>
                                Credit System
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Universities purchase credits to enable student access to premium features like AI assessments
                                and mock interviews. Credits are allocated by university administrators and may expire
                                per the subscription terms. Unused credits are non-refundable unless otherwise specified.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">06</span>
                                Academic Integrity
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Our platform includes AI-powered plagiarism detection and proctoring features.
                                Any attempt to cheat or violate academic integrity policies may result in account suspension
                                and notification to your university administration.
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
                                and other intellectual property laws. Faculty-created content remains their property.
                            </p>
                        </section>
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">08</span>
                                Limitation of Liability
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                Coder&apos;z Uni shall not be liable for any indirect, incidental, special,
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
                                University administrators may also suspend individual user accounts.
                                Academic records may be retained per legal requirements.
                            </p>
                        </section>
                        <section>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neutral-400">10</span>
                                Contact
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Questions about these Terms? Contact us at{" "}
                                <a href="mailto:legal@coderzai.xyz" className="text-violet-600 dark:text-violet-400 hover:underline">
                                    legal@coderzai.xyz
                                </a>
                            </p>
                        </section>
                    </div>
                </motion.div>
                <div className="text-center mt-8">
                    <Link
                        href="/"
                        className="text-sm text-neutral-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}