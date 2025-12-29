"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Check, X, Zap, Shield, Crown, Briefcase, Users, Code,
    ArrowRight, ClipboardList
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs"

// Currency Configuration
const currencies = {
    INR: { symbol: "₹", rate: 83.21, label: "INR" },
    USD: { symbol: "$", rate: 1, label: "USD" }
}

type CurrencyKey = keyof typeof currencies

// Pricing Data
const pricingData = {
    starter: {
        title: "Job Postings",
        description: "Pay per job listing with full platform access.",
        icon: Briefcase,
        tiers: [
            {
                name: "Single Post",
                basePrice: 49,
                suffix: "per job",
                description: "Perfect for occasional hiring needs.",
                icon: Zap,
                features: [
                    "1 Active Job Posting",
                    "30 Days Visibility",
                    "Basic Candidate Matching",
                    "Email Applications",
                    "Standard Support",
                ],
                missing: ["Custom Assessments", "Team Access", "Analytics"],
            },
            {
                name: "Growth Pack",
                basePrice: 199,
                suffix: "5 job credits",
                description: "For growing teams with multiple openings.",
                icon: Shield,
                popular: true,
                features: [
                    "5 Job Posting Credits",
                    "60 Days Visibility Each",
                    "AI Candidate Scoring",
                    "Custom Assessments",
                    "Basic Analytics",
                    "Priority Support",
                ],
                missing: ["White-label", "API Access"],
            },
            {
                name: "Scale Bundle",
                basePrice: 499,
                suffix: "15 job credits",
                description: "Enterprise-level hiring at scale.",
                icon: Crown,
                features: [
                    "15 Job Posting Credits",
                    "90 Days Visibility Each",
                    "Advanced AI Matching",
                    "Unlimited Assessments",
                    "Full Analytics Suite",
                    "Dedicated Account Manager",
                    "API Access",
                ],
                missing: [],
            },
        ],
    },
    subscription: {
        title: "Monthly Plans",
        description: "Unlimited access with monthly subscription.",
        icon: Users,
        tiers: [
            {
                name: "Startup",
                basePrice: 99,
                suffix: "/month",
                description: "Everything you need to start hiring.",
                icon: Zap,
                features: [
                    "Up to 5 Active Jobs",
                    "3 Team Members",
                    "Basic Assessments",
                    "Candidate Tracking",
                    "Email Support",
                ],
                missing: ["Advanced Analytics", "Custom Branding", "API"],
            },
            {
                name: "Business",
                basePrice: 299,
                suffix: "/month",
                description: "Advanced features for scaling teams.",
                icon: Shield,
                popular: true,
                features: [
                    "Unlimited Job Posts",
                    "10 Team Members",
                    "Custom Assessments",
                    "AI Candidate Scoring",
                    "Advanced Analytics",
                    "Priority Support",
                    "Integrations",
                ],
                missing: ["White-label"],
            },
            {
                name: "Enterprise",
                basePrice: 799,
                suffix: "/month",
                description: "Full platform access for large orgs.",
                icon: Crown,
                features: [
                    "Everything in Business",
                    "Unlimited Team Members",
                    "White-label Branding",
                    "Custom Integrations",
                    "SLA Guarantee",
                    "Dedicated Success Manager",
                    "SSO & Advanced Security",
                ],
                missing: [],
            },
        ],
    },
    assessments: {
        title: "Assessments",
        description: "Technical screening and evaluation tools.",
        icon: ClipboardList,
        tiers: [
            {
                name: "Basic",
                basePrice: 29,
                suffix: "per assessment",
                description: "Standard technical evaluations.",
                icon: Zap,
                features: [
                    "Pre-built Question Bank",
                    "Auto-grading",
                    "Basic Reports",
                    "Email Invites",
                ],
                missing: ["Custom Questions", "Code Execution", "Video"],
            },
            {
                name: "Pro",
                basePrice: 79,
                suffix: "per assessment",
                description: "Advanced coding challenges.",
                icon: Shield,
                popular: true,
                features: [
                    "Custom Question Builder",
                    "Live Code Execution",
                    "Plagiarism Detection",
                    "Detailed Analytics",
                    "Candidate Comparison",
                ],
                missing: ["Video Interviews"],
            },
            {
                name: "Complete",
                basePrice: 149,
                suffix: "per assessment",
                description: "Full technical interview suite.",
                icon: Crown,
                features: [
                    "Everything in Pro",
                    "AI Video Interviews",
                    "Behavioral Analysis",
                    "Custom Scoring Rubrics",
                    "ATS Integration",
                    "White-label Reports",
                ],
                missing: [],
            },
        ],
    },
    enterprise: {
        title: "Custom Solutions",
        description: "Tailored packages for unique requirements.",
        icon: Code,
        tiers: [
            {
                name: "Integration",
                basePrice: 2500,
                suffix: "one-time",
                description: "Connect with your existing systems.",
                icon: Zap,
                features: [
                    "ATS Integration",
                    "HRIS Sync",
                    "SSO Setup",
                    "Data Migration",
                ],
                missing: ["Custom Development"],
            },
            {
                name: "Custom Build",
                basePrice: 5000,
                suffix: "starts at",
                description: "Bespoke features for your workflow.",
                icon: Shield,
                popular: true,
                features: [
                    "Custom Assessment Types",
                    "Branded Candidate Portal",
                    "Custom Reporting",
                    "Workflow Automation",
                    "API Development",
                ],
                missing: [],
            },
            {
                name: "Full Service",
                basePrice: 10000,
                suffix: "/month",
                description: "Managed hiring operations.",
                icon: Crown,
                features: [
                    "Dedicated Team",
                    "Candidate Sourcing",
                    "Screening Services",
                    "Interview Coordination",
                    "Offer Management",
                    "Complete Analytics",
                ],
                missing: [],
            },
        ],
    },
}

export default function PricingPage() {
    const [currency, setCurrency] = useState<CurrencyKey>("USD")
    const [activeTab, setActiveTab] = useState("starter")

    const formatPrice = (basePrice: number) => {
        const value = Math.round(basePrice * currencies[currency].rate)
        return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-6 mb-16 relative">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                        <div>
                            <Badge variant="outline" className="mb-6 border-neutral-300 dark:border-neutral-700">
                                Global Pricing Protocol
                            </Badge>
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-neutral-900 dark:text-white mb-6">
                                Transparent Investment.<br />
                                <span className="text-neutral-400 dark:text-neutral-600">Engineered for ROI.</span>
                            </h1>
                            <p className="text-lg text-neutral-500 max-w-2xl font-light">
                                Select your service domain and currency to view our standardized rate card.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex gap-1 shadow-sm">
                            {
                                (Object.keys(currencies) as CurrencyKey[]).map((cur) => (
                                    <button
                                        key={cur}
                                        onClick={() => setCurrency(cur)}
                                        className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all ${currency === cur
                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-md"
                                            : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            }`}
                                    >
                                        {cur}
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6">
                    <Tabs defaultValue="starter" value={activeTab} onValueChange={setActiveTab} className="space-y-12">
                        <div className="overflow-x-auto pb-4 scrollbar-hide">
                            <TabsList className="inline-flex h-auto p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                {
                                    Object.entries(pricingData).map(([key, data]) => (
                                        <TabsTrigger
                                            key={key}
                                            value={key}
                                            className="px-6 py-3 cursor-pointer rounded-xl text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                                        >
                                            <data.icon className="w-4 h-4" />
                                            {data.title}
                                        </TabsTrigger>
                                    ))
                                }
                            </TabsList>
                        </div>
                        <AnimatePresence mode="wait">
                            {
                                Object.entries(pricingData).map(([key, data]) => (
                                    <TabsContent key={key} value={key} className="mt-0 outline-none">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="grid md:grid-cols-3 gap-8"
                                        >
                                            {
                                                data.tiers.map((tier, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className={`relative p-8 rounded-3xl border flex flex-col ${tier.popular
                                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white shadow-2xl scale-105 z-10"
                                                            : "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                                                            }`}
                                                    >
                                                        {
                                                            tier.popular && (
                                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wider">
                                                                    MOST POPULAR
                                                                </div>
                                                            )
                                                        }
                                                        <div className="mb-8">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${tier.popular
                                                                ? "bg-white/20 dark:bg-black/10"
                                                                : "bg-neutral-100 dark:bg-neutral-800"
                                                                }`}>
                                                                <tier.icon className="w-6 h-6" />
                                                            </div>
                                                            <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                                                            <p className={`text-sm leading-relaxed ${tier.popular
                                                                ? "text-neutral-300 dark:text-neutral-600"
                                                                : "text-neutral-500"
                                                                }`}>
                                                                {tier.description}
                                                            </p>
                                                        </div>
                                                        <div className="mb-8">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-4xl font-bold tracking-tight">
                                                                    {formatPrice(tier.basePrice)}
                                                                </span>
                                                            </div>
                                                            <span className={`text-sm ${tier.popular
                                                                ? "text-neutral-400 dark:text-neutral-500"
                                                                : "text-neutral-500"
                                                                }`}>
                                                                {tier.suffix}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 space-y-4 mb-8">
                                                            {
                                                                tier.features.map((feature, i) => (
                                                                    <div key={i} className="flex items-start gap-3 text-sm">
                                                                        <Check className={`w-5 h-5 shrink-0 ${tier.popular
                                                                            ? "text-green-400 dark:text-green-600"
                                                                            : "text-green-600 dark:text-green-400"
                                                                            }`} />
                                                                        <span>{feature}</span>
                                                                    </div>
                                                                ))
                                                            }
                                                            {
                                                                tier.missing.map((feature, i) => (
                                                                    <div key={i} className="flex items-start gap-3 text-sm opacity-50">
                                                                        <X className="w-5 h-5 shrink-0" />
                                                                        <span>{feature}</span>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                        <Link href="/contactus" className="w-full mt-auto">
                                                            <button className={`cursor-pointer w-full py-4 rounded-xl font-bold transition-all ${tier.popular
                                                                ? "bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                                                : "bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                                                                }`}>
                                                                Select {tier.name}
                                                            </button>
                                                        </Link>
                                                    </motion.div>
                                                ))
                                            }
                                        </motion.div>
                                    </TabsContent>
                                ))
                            }
                        </AnimatePresence>
                    </Tabs>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-24">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 md:p-12 text-center">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                            Need a Custom Configuration?
                        </h2>
                        <p className="text-neutral-500 mb-8 max-w-2xl mx-auto">
                            For enterprise requirements, volume discounts, or specific integration needs,
                            we offer a bespoke pricing model based on your hiring volume.
                        </p>
                        <Link
                            href="/contactus"
                            className="cursor-pointer inline-flex items-center font-bold border-b border-neutral-900 dark:border-white pb-0.5 hover:opacity-70 transition-opacity text-neutral-900 dark:text-white"
                        >
                            Schedule a Technical Discovery Call <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}