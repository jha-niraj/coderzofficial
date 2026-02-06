"use client"

import { motion } from "framer-motion"
import {
    CreditCard, Check, ArrowRight, Briefcase, Users, FileText,
    BarChart3, Sparkles, Shield, Zap, Clock, Building2, MessageSquare
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Progress } from "@repo/ui/components/ui/progress"

// ============================================
// PLAN DATA
// ============================================

const plans = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        suffix: "/month",
        description: "Perfect for small teams just getting started with hiring",
        features: [
            { text: "3 active job posts", icon: Briefcase },
            { text: "Up to 50 applications/month", icon: Users },
            { text: "1 interview process template", icon: FileText },
            { text: "Basic candidate management", icon: Users },
            { text: "Email support", icon: MessageSquare },
            { text: "Basic analytics", icon: BarChart3 },
        ],
        current: true,
        color: "from-slate-100 to-slate-50",
        borderColor: "border-slate-200",
    },
    {
        id: "pro",
        name: "Pro",
        price: "$49",
        suffix: "/month",
        description: "For growing companies with active hiring needs",
        features: [
            { text: "10 active job posts", icon: Briefcase },
            { text: "Up to 500 applications/month", icon: Users },
            { text: "5 interview process templates", icon: FileText },
            { text: "AI-powered resume screening", icon: Sparkles },
            { text: "Custom take-home assignments", icon: FileText },
            { text: "Advanced candidate tracking", icon: Users },
            { text: "Team collaboration (5 members)", icon: Building2 },
            { text: "Priority support", icon: Zap },
            { text: "Advanced analytics", icon: BarChart3 },
        ],
        popular: true,
        color: "from-[#0F172A] to-[#1e293b]",
        borderColor: "border-[#0F172A]",
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        suffix: "",
        description: "For large organizations with complex hiring needs",
        features: [
            { text: "Unlimited job posts", icon: Briefcase },
            { text: "Unlimited applications", icon: Users },
            { text: "Unlimited interview templates", icon: FileText },
            { text: "Dedicated account manager", icon: Users },
            { text: "Custom integrations", icon: Zap },
            { text: "SSO/SAML authentication", icon: Shield },
            { text: "API access", icon: Zap },
            { text: "SLA guarantee", icon: Clock },
            { text: "White-label options", icon: Building2 },
            { text: "Unlimited team members", icon: Users },
        ],
        color: "from-violet-100 to-violet-50",
        borderColor: "border-violet-200",
    },
]

// ============================================
// USAGE STATS (would come from server in real app)
// ============================================

const usageStats = {
    jobsUsed: 2,
    jobsLimit: 3,
    applicationsUsed: 23,
    applicationsLimit: 50,
    templatesUsed: 1,
    templatesLimit: 1,
    teamMembers: 1,
    teamLimit: 1,
}

// ============================================
// COMPONENTS
// ============================================

function UsageCard({
    label,
    used,
    limit,
    icon: Icon
}: {
    label: string
    used: number
    limit: number
    icon: React.ElementType
}) {
    const percentage = Math.round((used / limit) * 100)
    const isNearLimit = percentage >= 80

    return (
        <div className="bg-white rounded-xl border border-[#e6e6e6] p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#F1F5F9]">
                        <Icon className="h-4 w-4 text-[#64748B]" />
                    </div>
                    <span className="text-sm font-medium text-[#0F172A]">{label}</span>
                </div>
                <span className={`text-sm font-semibold ${isNearLimit ? 'text-amber-600' : 'text-[#0F172A]'}`}>
                    {used}/{limit}
                </span>
            </div>
            <Progress
                value={percentage}
                className={`h-2 ${isNearLimit ? '[&>div]:bg-amber-500' : '[&>div]:bg-[#0F172A]'}`}
            />
        </div>
    )
}

function PricingCard({ plan, index }: { plan: typeof plans[0]; index: number }) {
    const isPro = plan.id === "pro"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-2xl overflow-hidden ${isPro
                    ? 'bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white shadow-xl'
                    : 'bg-white border border-[#e6e6e6]'
                }`}
        >
            {
                plan.popular && (
                    <div className="absolute top-4 right-4">
                        <Badge className="bg-white text-[#0F172A] hover:bg-white">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Most Popular
                        </Badge>
                    </div>
                )
            }
            {
                plan.current && (
                    <div className="absolute top-4 right-4">
                        <Badge variant="outline" className="border-[#0F172A] text-[#0F172A]">
                            Current Plan
                        </Badge>
                    </div>
                )
            }

            <div className="p-6">
                <div className="mb-6">
                    <h3 className={`font-semibold text-lg ${isPro ? 'text-white' : 'text-[#0F172A]'}`}>
                        {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-2">
                        <span className={`text-4xl font-bold ${isPro ? 'text-white' : 'text-[#0F172A]'}`}>
                            {plan.price}
                        </span>
                        <span className={isPro ? 'text-white/60' : 'text-[#64748B]'}>
                            {plan.suffix}
                        </span>
                    </div>
                    <p className={`text-sm mt-2 ${isPro ? 'text-white/70' : 'text-[#64748B]'}`}>
                        {plan.description}
                    </p>
                </div>
                <ul className="space-y-3 mb-6">
                    {
                        plan.features.map((feature, j) => (
                            <li key={j} className="flex items-start gap-2.5">
                                <div className={`p-1 rounded-full mt-0.5 ${isPro
                                        ? 'bg-white/20'
                                        : 'bg-emerald-100'
                                    }`}>
                                    <Check className={`h-3 w-3 ${isPro
                                            ? 'text-white'
                                            : 'text-emerald-600'
                                        }`} />
                                </div>
                                <span className={`text-sm ${isPro ? 'text-white/90' : 'text-[#475569]'}`}>
                                    {feature.text}
                                </span>
                            </li>
                        ))
                    }
                </ul>
                <Button
                    className={`w-full ${isPro
                            ? 'bg-white text-[#0F172A] hover:bg-white/90'
                            : plan.current
                                ? 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#F1F5F9] cursor-not-allowed'
                                : 'bg-[#0F172A] text-white hover:bg-[#1e293b]'
                        }`}
                    disabled={plan.current}
                >
                    {plan.current ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                    {!plan.current && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
            </div>
        </motion.div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BillingPage() {
    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <div className="bg-white border-b border-[#e6e6e6]">
                <div className="container mx-auto px-6 py-6">
                    <h1 className="text-2xl font-semibold text-[#0F172A]">Billing & Plans</h1>
                    <p className="text-[#64748B] mt-1">
                        Manage your subscription and view usage
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] rounded-2xl p-6 mb-8 text-white"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-white/60 text-sm mb-1">Current Plan</p>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                Free
                                <Badge className="bg-white/20 text-white hover:bg-white/20 text-xs">
                                    Active
                                </Badge>
                            </h2>
                            <p className="text-white/60 text-sm mt-2">
                                You&apos;re using the free tier. Upgrade to unlock more features.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="border-white/30 text-white bg-white/10 hover:bg-white/20"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                        </Button>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Usage This Month</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <UsageCard
                            label="Active Jobs"
                            used={usageStats.jobsUsed}
                            limit={usageStats.jobsLimit}
                            icon={Briefcase}
                        />
                        <UsageCard
                            label="Applications"
                            used={usageStats.applicationsUsed}
                            limit={usageStats.applicationsLimit}
                            icon={Users}
                        />
                        <UsageCard
                            label="Interview Templates"
                            used={usageStats.templatesUsed}
                            limit={usageStats.templatesLimit}
                            icon={FileText}
                        />
                        <UsageCard
                            label="Team Members"
                            used={usageStats.teamMembers}
                            limit={usageStats.teamLimit}
                            icon={Building2}
                        />
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Available Plans</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {
                            plans.map((plan, index) => (
                                <PricingCard key={plan.id} plan={plan} index={index} />
                            ))
                        }
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-5 w-5 text-[#0F172A]" />
                            <h3 className="font-semibold text-[#0F172A]">Payment Methods</h3>
                        </div>
                        <p className="text-sm text-[#64748B] mb-4">
                            No payment methods on file. Add one when you upgrade.
                        </p>
                        <Button variant="outline" size="sm">
                            Add Payment Method
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl border border-[#e6e6e6] p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-[#0F172A]" />
                            <h3 className="font-semibold text-[#0F172A]">Billing History</h3>
                        </div>
                        <p className="text-sm text-[#64748B] mb-4">
                            No billing history yet. Invoices will appear here after your first payment.
                        </p>
                        <Button variant="outline" size="sm" disabled>
                            View All Invoices
                        </Button>
                    </motion.div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 bg-[#F8FAFC] rounded-xl p-6"
                >
                    <h3 className="font-semibold text-[#0F172A] mb-4">Frequently Asked Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium text-[#0F172A] text-sm">Can I change plans anytime?</p>
                            <p className="text-sm text-[#64748B] mt-1">
                                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-[#0F172A] text-sm">What happens if I exceed my limits?</p>
                            <p className="text-sm text-[#64748B] mt-1">
                                We&apos;ll notify you when you&apos;re approaching limits. You can upgrade to continue without interruption.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-[#0F172A] text-sm">Do you offer refunds?</p>
                            <p className="text-sm text-[#64748B] mt-1">
                                Yes, we offer a 14-day money-back guarantee on all paid plans.
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-[#0F172A] text-sm">How does Enterprise pricing work?</p>
                            <p className="text-sm text-[#64748B] mt-1">
                                Enterprise pricing is customized based on your organization&apos;s specific needs. Contact our sales team.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}