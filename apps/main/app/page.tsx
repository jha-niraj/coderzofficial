"use client"

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Target, Rocket, Globe, Cpu, Terminal, Layers, ShieldCheck, Code2, GitMerge,
    Zap
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import Testimonials from "@/components/landingpage/testimonials-section";
import FaqsAccrodian from "@/components/landingpage/faqs";
import SmoothScroll from "@/components/smoothscroll";
import Navbar from "@/components/landingpage/homepagenavbar";
import EtherealBeamsHero from "@/components/landingpage/ethereal-beams-hero";
import FeaturesSection from "@/components/landingpage/featuressection";
import StudioSection from "@/components/landingpage/studio-section";
import AssessmentsSection from "@/components/landingpage/assessments-section";
import CreditsSection from "@/components/landingpage/credits-section";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import Footer from "@/components/landingpage/footer";

import { PublicProjectsGrid } from "@/app/(main)/projects/_components/public-projects-grid";
import PricingSection from "@/components/landingpage/pricing-section";
import AIToolsSection from "@/components/landingpage/aitoolssection";
import OpenSourceSection from "@/components/landingpage/opensource";
import { Badge } from "@repo/ui/components/ui/badge";

// import { Scene } from "@/components/ui/herosectioncanvas";

// Animation variants - can be used for future animations
const _fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};
const _staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};
const _floating = {
    y: [0, -10, 0],
    transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
    }
};
export default function LandingPage() {
    const [_mobileMenuOpen, _setMobileMenuOpen] = useState(false)
    const [_visibleSection, setVisibleSection] = useState("")
    const [_showBackToTop, setShowBackToTop] = useState(false)
    const _router = useRouter();


    const heroRef = useRef<HTMLElement | null>(null)
    const featuresRef = useRef<HTMLElement | null>(null)
    const projectsRef = useRef<HTMLElement | null>(null)
    const openSourceRef = useRef<HTMLElement | null>(null)
    const aiToolsRef = useRef<HTMLElement | null>(null)
    const assessmentsRef = useRef<HTMLElement | null>(null)
    const creditsRef = useRef<HTMLElement | null>(null)
    const testimonialsRef = useRef<HTMLElement | null>(null)
    const pricingRef = useRef<HTMLElement | null>(null)
    const faqRef = useRef<HTMLElement | null>(null)
    const contactRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 500) {
                setShowBackToTop(true)
            } else {
                setShowBackToTop(false)
            }

            const sections = [
                { ref: heroRef, id: "hero" },
                { ref: featuresRef, id: "features" },
                { ref: projectsRef, id: "projects" },
                { ref: openSourceRef, id: "opensource" },
                { ref: aiToolsRef, id: "aitools" },
                { ref: assessmentsRef, id: "assessments" },
                { ref: creditsRef, id: "credits" },
                { ref: testimonialsRef, id: "testimonials" },
                { ref: pricingRef, id: "pricing" },
                { ref: faqRef, id: "faq" },
                { ref: contactRef, id: "contact" },
            ]

            for (const section of sections) {
                if (section.ref.current) {
                    const rect = section.ref.current.getBoundingClientRect()
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        setVisibleSection(section.id)
                        break
                    }
                }
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <SmoothScroll>
            <Navbar />
            <main className={cn("relative overflow-hidden bg-white dark:bg-neutral-900")}>
                <section ref={heroRef}>
                    <EtherealBeamsHero />
                </section>
                <section id="studio">
                    <StudioSection />
                </section>
                <section id="mainfeatures">
                    <FeaturesSection />
                </section>
                <section ref={aiToolsRef} id="aitools" className="py-12 relative">
                    <AIToolsSection />
                </section>
                <section ref={projectsRef} id="projects" className="py-24 relative bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 overflow-hidden">
                    <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center max-w-3xl mx-auto mb-20"
                        >
                            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm mb-6">
                                <Cpu className="w-3.5 h-3.5 mr-2" />
                                Project Foundry
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white tracking-tight">
                                From Prompt to <span className="text-neutral-400 dark:text-neutral-600">Production.</span>
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                                Don&apos;t just watch tutorials. Generate full-stack project scaffolds, follow execution plans, and deploy real software to your portfolio.
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
                        >
                            {
                                [
                                    {
                                        icon: Terminal,
                                        title: "Scaffold Agent",
                                        description: "Generate personalized boilerplates based on your tech stack preference."
                                    },
                                    {
                                        icon: Layers,
                                        title: "Execution Plan",
                                        description: "Step-by-step implementation guide broke down into atomic tasks."
                                    },
                                    {
                                        icon: ShieldCheck,
                                        title: "Knowledge Check",
                                        description: "Validate understanding with automated technical quizzes per module."
                                    },
                                    {
                                        icon: Target,
                                        title: "Interview Sim",
                                        description: "Defend your project decisions against an AI technical interviewer."
                                    }
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-4 text-neutral-900 dark:text-white">
                                            <feature.icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                ))
                            }
                        </motion.div>
                        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-8 gap-6">
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-neutral-500" />
                                    Public Registry
                                </h3>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                    Open source projects built by the community.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/projects/generate">
                                    <Button className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
                                        <Terminal className="mr-2 h-4 w-4" />
                                        Initialize Project
                                    </Button>
                                </Link>
                                <Link href="/projects/allprojects">
                                    <Button variant="outline" className="rounded-full border-neutral-200 dark:border-neutral-800">
                                        View Registry
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <PublicProjectsGrid />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mt-20 border-t border-neutral-200 dark:border-neutral-800 pt-10"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {
                                    [
                                        { label: "Projects Deployed", value: "1.2k+", icon: Rocket },
                                        { label: "Active Builders", value: "850+", icon: Code2 },
                                        { label: "Code Commits", value: "15k", icon: GitMerge },
                                        { label: "System Uptime", value: "99.99%", icon: Zap },
                                    ].map((stat, index) => (
                                        <div key={index} className="flex flex-col items-center md:items-start">
                                            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-mono text-2xl font-bold mb-1">
                                                <stat.icon className="w-5 h-5 text-neutral-400" />
                                                {stat.value}
                                            </div>
                                            <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </motion.div>
                    </div>
                </section>
                <section ref={openSourceRef}
                    id="opensource"
                    className="py-12 relative overflow-hidden"
                >
                    <OpenSourceSection />
                </section>
                <section ref={assessmentsRef} id="assessments">
                    <AssessmentsSection />
                </section>
                <section ref={creditsRef} id="credits">
                    <CreditsSection />
                </section>
                <Testimonials />
                <section ref={pricingRef} id="pricing" className="w-full">
                    <PricingSection />
                </section>
                <section className="w-full">
                    <FaqsAccrodian />
                </section>
                <Footer />
                {/* eslint-disable-next-line react/no-unknown-property */}
                <style jsx global>{`
                        @keyframes wave {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                        }
                        
                        @keyframes wave-slow {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                        }
                        
                        .animate-wave {
                        animation: wave 15s linear infinite;
                        }
                        
                        .animate-wave-slow {
                        animation: wave 25s linear infinite;
                        }
                        
                        .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                        }
                        
                        .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                        }
                        
                        .perspective-1000 {
                        perspective: 1000px;
                        }
                        
                        .rotate-y-10:hover {
                        transform: rotateY(10deg);
                        }
                    `}
                </style>
            </main>
        </SmoothScroll>
    )
}