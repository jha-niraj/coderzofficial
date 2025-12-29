"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
    Check 
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Switch } from "@repo/ui/components/ui/switch"
import { cn } from "@repo/ui/lib/utils"

const plans = [
    {
        name: "Starter",
        price: { INR: "Free", USD: "Free" },
        desc: "Entry level access.",
        features: ["3 Active Nodes", "Basic Matching", "Standard Logs"],
        cta: "Deploy Free",
        highlight: false
    },
    {
        name: "Professional",
        price: { INR: "₹29,999", USD: "$399" },
        desc: "Full system scale.",
        features: ["Unlimited Nodes", "AI Logic Core", "Custom Sandboxes", "Priority Routing"],
        cta: "Start Trial",
        highlight: true
    },
    {
        name: "Enterprise",
        price: { INR: "Custom", USD: "Custom" },
        desc: "Dedicated infrastructure.",
        features: ["Dedicated Instance", "SLA Guarantees", "API Access", "White-label"],
        cta: "Contact Sales",
        highlight: false
    },
]

export default function PricingSection() {
    const [currency, setCurrency] = useState<"INR" | "USD">("INR")

    return (
        <section id="pricing" className="py-32 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-6">

                <div className="flex flex-col items-center text-center mb-16">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                        Resource Allocation
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-neutral-900 dark:text-white mb-8">
                        Transparent Compute Costs
                    </h2>

                    {/* Minimal Toggle */}
                    <div className="flex items-center gap-3 p-1 pr-4 pl-4 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                        <span className={cn("text-xs font-bold", currency === "INR" ? "text-neutral-900 dark:text-white" : "text-neutral-400")}>INR</span>
                        <Switch checked={currency === "USD"} onCheckedChange={(c) => setCurrency(c ? "USD" : "INR")} />
                        <span className={cn("text-xs font-bold", currency === "USD" ? "text-neutral-900 dark:text-white" : "text-neutral-400")}>USD</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "relative p-8 rounded-3xl flex flex-col h-full border transition-all duration-300",
                                plan.highlight
                                    ? "bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-black shadow-2xl"
                                    : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                            )}
                        >
                            <div className="mb-8">
                                <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                                <p className={cn("text-sm", plan.highlight ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500")}>
                                    {plan.desc}
                                </p>
                            </div>

                            <div className="mb-8">
                                <span className="text-4xl font-bold tracking-tighter">
                                    {currency === "INR" ? plan.price.INR : plan.price.USD}
                                </span>
                                {plan.price.INR !== "Custom" && <span className="text-sm opacity-60">/mo</span>}
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                                        <Check className={cn("w-4 h-4", plan.highlight ? "text-white dark:text-black" : "text-neutral-900 dark:text-white")} />
                                        {feat}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={cn(
                                    "w-full rounded-full font-bold h-12",
                                    plan.highlight
                                        ? "bg-white text-black hover:bg-neutral-200 dark:bg-black dark:text-white dark:hover:bg-neutral-800"
                                        : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                                )}
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}