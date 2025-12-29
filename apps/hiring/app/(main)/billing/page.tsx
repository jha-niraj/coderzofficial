"use client"

import { motion } from "framer-motion"
import { CreditCard, Check, ArrowRight } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

const plans = [
    {
        name: "Starter",
        price: "Free",
        suffix: "forever",
        description: "Perfect for small teams just getting started",
        features: [
            "Up to 3 active job posts",
            "Basic candidate management",
            "Email support",
            "Standard assessments",
        ],
        current: true,
    },
    {
        name: "Professional",
        price: "$99",
        suffix: "/month",
        description: "For growing companies with hiring needs",
        features: [
            "Unlimited job posts",
            "Advanced candidate tracking",
            "Custom assessments",
            "Priority support",
            "Analytics dashboard",
            "Team collaboration",
        ],
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        suffix: "",
        description: "For large organizations with complex needs",
        features: [
            "Everything in Professional",
            "Dedicated account manager",
            "Custom integrations",
            "SLA guarantee",
            "Advanced security",
            "API access",
        ],
    },
]

export default function BillingPage() {
    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    Billing & Plans
                </h1>
                <p className="text-neutral-500 mt-1">
                    Manage your subscription and billing
                </p>
            </div>

            {/* Current Plan */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 rounded-2xl p-6 mb-8 text-white dark:text-black"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-neutral-400 dark:text-neutral-600 text-sm mb-1">Current Plan</p>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            Starter <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/10">Free</span>
                        </h2>
                        <p className="text-neutral-400 dark:text-neutral-600 text-sm mt-2">
                            You&apos;re using 1 of 3 available job posts
                        </p>
                    </div>
                    <Link href="/pricing">
                        <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 dark:border-black/20 dark:text-black dark:hover:bg-black/10">
                            Upgrade Plan
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {plans.map((plan, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative bg-white dark:bg-neutral-950 border rounded-2xl p-6 ${plan.popular
                            ? "border-neutral-900 dark:border-white shadow-lg"
                            : "border-neutral-200 dark:border-neutral-800"
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-900 dark:bg-white text-white dark:text-black text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                            </div>
                        )}
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-bold text-neutral-900 dark:text-white">{plan.price}</span>
                                <span className="text-neutral-500">{plan.suffix}</span>
                            </div>
                            <p className="text-sm text-neutral-500 mt-2">{plan.description}</p>
                        </div>
                        <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-neutral-600 dark:text-neutral-400">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            variant={plan.current ? "outline" : "default"}
                            className={`w-full rounded-xl ${plan.popular
                                ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                : ""
                                }`}
                            disabled={plan.current}
                        >
                            {plan.current ? "Current Plan" : "Upgrade"}
                        </Button>
                    </motion.div>
                ))}
            </div>

            {/* Payment Methods */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
            >
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                </h2>
                <p className="text-neutral-500 text-sm mb-4">
                    No payment methods on file. Add one when you upgrade.
                </p>
                <Button variant="outline" className="rounded-xl">
                    Add Payment Method
                </Button>
            </motion.div>
        </div>
    )
}
