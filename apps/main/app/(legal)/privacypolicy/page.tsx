"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import SmoothScroll from "@/components/smoothscroll"

export default function PrivacyPolicy() {
    const sections = [
        { id: "collection", title: "1. Information We Collect" },
        { id: "usage", title: "2. How We Use Data" },
        { id: "payments", title: "3. Payment Information" },
        { id: "cookies", title: "4. Cookies & Tracking" },
        { id: "sharing", title: "5. Data Sharing" },
        { id: "security", title: "6. Data Security" },
        { id: "rights", title: "7. Your Rights" },
    ]

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    return (
        <SmoothScroll>
            <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">
                <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                    <div className="mb-16 border-b border-neutral-200 dark:border-neutral-800 pb-10">
                        <Link href="/" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return Home
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-neutral-500 dark:text-neutral-400">
                            Last Updated: April 15, 2025
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                        <div className="hidden md:block md:col-span-3 lg:col-span-3">
                            <div className="sticky top-24 space-y-1">
                                <p className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-4 px-3">
                                    Table of Contents
                                </p>
                                {
                                    sections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className="block w-full text-left px-3 py-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors"
                                        >
                                            {section.title}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="md:col-span-9 lg:col-span-8 lg:col-start-5 space-y-16">
                            <section id="collection">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">1. Information We Collect</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                    We collect information to provide better services to all our users. This includes:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                                    <li><strong>Personal Information:</strong> Name, email address, and profile picture (via OAuth providers like Google/GitHub).</li>
                                    <li><strong>Usage Data:</strong> Code submissions, assessment scores, project progress, and AI interaction logs.</li>
                                    <li><strong>Device Information:</strong> IP address, browser type, and operating system for security and optimization.</li>
                                </ul>
                            </section>
                            <section id="usage">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">2. How We Use Data</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    We use the collected data to:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    {
                                        [
                                            "Personalize learning paths",
                                            "Process credit transactions",
                                            "Improve AI model accuracy",
                                            "Prevent fraud and abuse"
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800">
                                                {item}
                                            </div>
                                        ))
                                    }
                                </div>
                            </section>
                            <section id="payments">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">3. Payment Information</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    We use <strong>Razorpay</strong> and other third-party payment processors to handle financial transactions.
                                </p>
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                                    <strong>Important:</strong> We do not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy.
                                </div>
                            </section>
                            <section id="cookies">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">4. Cookies & Tracking</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    We use cookies and similar tracking technologies to track the activity on our Service and hold certain information.
                                </p>
                                <ul className="list-disc pl-5 mt-4 space-y-2 text-neutral-600 dark:text-neutral-400">
                                    <li><strong>Session Cookies:</strong> To operate our Service (e.g., keeping you logged in).</li>
                                    <li><strong>Preference Cookies:</strong> To remember your preferences (e.g., Theme, Currency).</li>
                                    <li><strong>Security Cookies:</strong> To facilitate security features.</li>
                                </ul>
                            </section>
                            <section id="sharing">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">5. Data Sharing</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    We do not sell your personal data. We may share data with:
                                </p>
                                <ul className="list-disc pl-5 mt-4 space-y-2 text-neutral-600 dark:text-neutral-400">
                                    <li><strong>Service Providers:</strong> To facilitate our Service (e.g., Cloud hosting, Email delivery).</li>
                                    <li><strong>Legal Obligations:</strong> If required to do so by law or in response to valid requests by public authorities.</li>
                                </ul>
                            </section>
                            <section id="security">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">6. Data Security</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. We strive to use commercially acceptable means to protect your Personal Data, but we cannot guarantee its absolute security.
                                </p>
                            </section>
                            <section id="rights">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">7. Your Rights</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                    Depending on your location, you may have the right to:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                                    <li>Access and receive a copy of the personal data we hold about you.</li>
                                    <li>Rectify any personal data held about you that is inaccurate.</li>
                                    <li>Request the deletion of your personal data.</li>
                                </ul>
                            </section>
                            <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800">
                                <p className="text-neutral-500 dark:text-neutral-400">
                                    Questions about privacy? Contact our Data Protection Officer at <a href="mailto:privacy@thecoderz.com" className="text-neutral-900 dark:text-white underline">privacy@thecoderz.com</a>
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </SmoothScroll>
    )
}