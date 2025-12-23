"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import SmoothScroll from "@/components/smoothscroll"

export default function TermsOfService() {
    const sections = [
        { id: "acceptance", title: "1. Acceptance of Terms" },
        { id: "eligibility", title: "2. Eligibility & Accounts" },
        { id: "credits", title: "3. Credits & Payments" },
        { id: "content", title: "4. User Content & Projects" },
        { id: "conduct", title: "5. Code of Conduct" },
        { id: "termination", title: "6. Termination" },
        { id: "disclaimers", title: "7. Disclaimers & Liability" },
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
                            Terms of Service
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

                            <section id="acceptance">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    By accessing or using The Coder'z platform ("Service"), including our projects, certifications, AI tools, and assessment engines, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
                                </p>
                            </section>
                            <section id="eligibility">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">2. Eligibility & Accounts</h2>
                                <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    <p>
                                        You must be at least 13 years old to use the Service. By creating an account, you represent that the information you provide is accurate and complete.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>You are responsible for maintaining the security of your account credentials.</li>
                                        <li>You must notify us immediately of any unauthorized use of your account.</li>
                                        <li>One person or legal entity may not maintain more than one free account.</li>
                                    </ul>
                                </div>
                            </section>
                            <section id="credits">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">3. Credits, Payments & Virtual Items</h2>
                                <div className="space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    <p>
                                        The Coder'z utilizes a credit-based system ("Compute Credits") for accessing premium AI features and assessments.
                                    </p>
                                    <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                        <h4 className="font-bold text-neutral-900 dark:text-white mb-2">Key Policies:</h4>
                                        <ul className="list-disc pl-5 space-y-2 text-sm">
                                            <li><strong>No Expiration:</strong> Purchased credits do not expire unless your account is terminated for violation of terms.</li>
                                            <li><strong>Non-Refundable:</strong> All credit purchases are final and non-refundable, except as required by law.</li>
                                            <li><strong>Non-Transferable:</strong> Credits cannot be sold, transferred, or exchanged for cash outside of the platform.</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                            <section id="content">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">4. User Content & Projects</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                    You retain ownership of any code, projects, or content ("User Content") you submit to the platform. However, by submitting User Content to public repositories or community showcases, you grant The Coder'z a worldwide, non-exclusive license to use, reproduce, and display such content for promotional or educational purposes.
                                </p>
                            </section>
                            <section id="conduct">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">5. Code of Conduct</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                                    You agree not to engage in any of the following prohibited activities:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-neutral-600 dark:text-neutral-400">
                                    <li>Reverse engineering the AI models or assessment algorithms.</li>
                                    <li>Using bots or scripts to "farm" XP or Credits.</li>
                                    <li>Harassing, bullying, or intimidating other community members.</li>
                                    <li>Posting content that infringes on intellectual property rights.</li>
                                </ul>
                            </section>
                            <section id="termination">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">6. Termination</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                                </p>
                            </section>
                            <section id="disclaimers">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">7. Disclaimers & Limitation of Liability</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Coder'z makes no warranties, expressed or implied, regarding the accuracy of AI-generated code reviews or the likelihood of employment resulting from our certifications.
                                </p>
                            </section>
                            <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800">
                                <p className="text-neutral-500 dark:text-neutral-400">
                                    Questions about these terms? Contact us at <a href="mailto:legal@thecoderz.com" className="text-neutral-900 dark:text-white underline">legal@thecoderz.com</a>
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </SmoothScroll>
    )
}