"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"
import { Switch } from "@repo/ui/components/ui/switch"
import { cn } from "@repo/ui/lib/utils"

const plans = [
    {
        name: "Starter",
        description: "Small colleges",
        price: { INR: "₹49", USD: "$0.99" },
        features: ["500 Students", "5 Faculty", "Basic Quizzes", "Email Support"],
        highlight: false
    },
    {
        name: "Professional",
        description: "Growing institutions",
        price: { INR: "₹39", USD: "$0.79" },
        features: ["5,000 Students", "Unlimited Faculty", "AI Interviews", "Placement Module", "API Access"],
        highlight: true
    },
    {
        name: "Enterprise",
        description: "Large universities",
        price: { INR: "Custom", USD: "Custom" },
        features: ["Unlimited Scale", "LMS Integration", "SLA Guarantee", "On-Premise", "Dedicated Manager"],
        highlight: false
    }
]

export default function PricingSection() {
    const [currency, setCurrency] = useState<"INR" | "USD">("INR")

    return (
        <div className="py-24 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                        Cost Structure
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                        Scalable Licensing
                    </h2>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={cn("text-xs font-bold", currency === "INR" ? "text-neutral-900 dark:text-white" : "text-neutral-400")}>INR (₹)</span>
                        <Switch
                            checked={currency === "USD"}
                            onCheckedChange={(c) => setCurrency(c ? "USD" : "INR")}
                        />
                        <span className={cn("text-xs font-bold", currency === "USD" ? "text-neutral-900 dark:text-white" : "text-neutral-400")}>USD ($)</span>
                    </div>
                </motion.div>
                <div className="grid md:grid-cols-3 gap-8">
                    {
                        plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative p-8 rounded-3xl flex flex-col border transition-all",
                                    plan.highlight
                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl"
                                        : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                                )}
                            >
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">{plan.name}</h3>
                                    <p className={cn("text-sm mt-1", plan.highlight ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500")}>
                                        {plan.description}
                                    </p>
                                </div>
                                <div className="mb-8">
                                    <span className="text-4xl font-bold tracking-tighter">
                                        {currency === "INR" ? plan.price.INR : plan.price.USD}
                                    </span>
                                    {plan.price.INR !== "Custom" && <span className="text-xs opacity-70 ml-1">/ student / sem</span>}
                                </div>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {
                                        plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-3 text-sm">
                                                <Check className="w-4 h-4 opacity-70" />
                                                <span>{feature}</span>
                                            </li>
                                        ))
                                    }
                                </ul>
                                <Link href="/register">
                                    <Button
                                        className={cn(
                                            "w-full rounded-full h-12 font-bold",
                                            plan.highlight
                                                ? "bg-white text-black hover:bg-neutral-200 dark:bg-black dark:text-white"
                                                : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
                                        )}
                                    >
                                        Select Plan
                                    </Button>
                                </Link>
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}