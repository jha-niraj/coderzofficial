"use client"

import { motion } from "framer-motion"
import { CreditCard, Check, ArrowRight, Coins, Users, BookOpen, Zap } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

const plans = [
    {
        name: "Starter",
        price: "₹49",
        suffix: "/student/sem",
        description: "Perfect for small colleges getting started",
        features: [
            "Up to 500 students",
            "5 faculty accounts",
            "Basic assignments (Quiz, Coding)",
            "Student verification",
            "Email support",
            "Basic analytics",
        ],
        current: true,
    },
    {
        name: "Professional",
        price: "₹39",
        suffix: "/student/sem",
        description: "For growing institutions with more needs",
        features: [
            "Up to 5,000 students",
            "Unlimited faculty accounts",
            "All assignment types",
            "Mock interviews included",
            "Placement module",
            "Priority support",
            "Advanced analytics",
            "API access",
        ],
        popular: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        suffix: "",
        description: "For large universities with complex needs",
        features: [
            "Unlimited students",
            "Multi-campus support",
            "Custom integrations",
            "Dedicated account manager",
            "SLA guarantee",
            "Custom branding",
            "On-premise option",
            "24/7 phone support",
        ],
    },
]

export default function BillingPage() {
    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    Billing & Credits
                </h1>
                <p className="text-neutral-500 mt-1">
                    Manage your subscription and credit balance
                </p>
            </div>

            {/* Credit Balance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-violet-200 text-sm mb-1">Credit Balance</p>
                        <h2 className="text-4xl font-bold flex items-center gap-2">
                            <Coins className="w-8 h-8" />
                            0 <span className="text-lg font-normal text-violet-200">credits</span>
                        </h2>
                        <p className="text-violet-200 text-sm mt-2">
                            0 credits allocated to students
                        </p>
                    </div>
                    <Button className="rounded-xl bg-white text-violet-700 hover:bg-violet-50">
                        <Zap className="w-4 h-4 mr-2" />
                        Buy Credits
                    </Button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-violet-600" />
                        <span className="text-neutral-500 text-sm">Students</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">0</p>
                    <p className="text-xs text-neutral-500">verified students</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Coins className="w-5 h-5 text-violet-600" />
                        <span className="text-neutral-500 text-sm">Used This Month</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">0</p>
                    <p className="text-xs text-neutral-500">credits consumed</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5 text-violet-600" />
                        <span className="text-neutral-500 text-sm">Assignments</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">0</p>
                    <p className="text-xs text-neutral-500">assignments created</p>
                </motion.div>
            </div>

            {/* Current Plan */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mb-8"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-neutral-500 text-sm mb-1">Current Plan</p>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            Starter <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">Trial</span>
                        </h2>
                        <p className="text-neutral-500 text-sm mt-2">
                            30-day free trial • Upgrade anytime
                        </p>
                    </div>
                    <Link href="#plans">
                        <Button variant="outline" className="rounded-xl">
                            Upgrade Plan
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Plans Grid */}
            <div id="plans" className="scroll-mt-8">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Available Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className={`relative bg-white dark:bg-neutral-950 border rounded-2xl p-6 ${plan.popular
                                ? "border-violet-500 shadow-lg shadow-violet-500/10"
                                : "border-neutral-200 dark:border-neutral-800"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
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
                                        <Check className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                                        <span className="text-neutral-600 dark:text-neutral-400">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant={plan.current ? "outline" : "default"}
                                className={`w-full rounded-xl ${plan.popular
                                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                                    : ""
                                    }`}
                                disabled={plan.current}
                            >
                                {plan.current ? "Current Plan" : "Upgrade"}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Payment Methods */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
            >
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-violet-600" />
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
