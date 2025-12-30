"use client"

import { motion } from "framer-motion"
import { Check, Star } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

const plans = [
    {
        name: "Starter",
        description: "Perfect for small colleges",
        price: "₹49",
        period: "/student/semester",
        features: [
            "Up to 500 students",
            "5 faculty accounts",
            "Basic assignments (Quiz, Coding)",
            "Student verification",
            "Email support",
            "Basic analytics"
        ],
        cta: "Start Free Trial",
        popular: false
    },
    {
        name: "Professional",
        description: "For growing institutions",
        price: "₹39",
        period: "/student/semester",
        features: [
            "Up to 5,000 students",
            "Unlimited faculty accounts",
            "All assignment types",
            "Mock interviews included",
            "Placement module",
            "Priority support",
            "Advanced analytics",
            "API access"
        ],
        cta: "Get Started",
        popular: true
    },
    {
        name: "Enterprise",
        description: "For large universities",
        price: "Custom",
        period: "Contact us",
        features: [
            "Unlimited students",
            "Multi-campus support",
            "Custom integrations",
            "Dedicated account manager",
            "SLA guarantee",
            "Custom branding",
            "On-premise option",
            "24/7 phone support"
        ],
        cta: "Contact Sales",
        popular: false
    }
]

export default function PricingSection() {
    return (
        <div className="py-24 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400">
                        Pricing
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Plans That Scale With You
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Start with a free trial. No credit card required. Pay per student as you grow.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-8 rounded-3xl ${plan.popular
                                    ? "bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-500/20"
                                    : "bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">
                                        <Star className="w-3 h-3" fill="currentColor" /> Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mt-1 ${plan.popular ? "text-violet-200" : "text-neutral-500"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="text-center mb-6">
                                <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-neutral-900 dark:text-white"}`}>
                                    {plan.price}
                                </span>
                                <span className={`text-sm ${plan.popular ? "text-violet-200" : "text-neutral-500"}`}>
                                    {plan.period}
                                </span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <Check className={`w-4 h-4 shrink-0 ${plan.popular ? "text-violet-200" : "text-violet-500"}`} />
                                        <span className={`text-sm ${plan.popular ? "text-violet-100" : "text-neutral-600 dark:text-neutral-400"}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/register">
                                <Button
                                    className={`cursor-pointer w-full rounded-full h-12 font-bold ${plan.popular
                                            ? "bg-white text-violet-700 hover:bg-violet-50"
                                            : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}