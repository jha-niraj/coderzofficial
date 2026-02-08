"use client"

import { motion } from "framer-motion"
import {
    Users, School, ArrowRight, GraduationCap,
    CheckCircle2, Briefcase, Building, CreditCard,
    PieChart, Shield, Coins, UserPlus
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

interface HeadDashboardProps {
    userName: string
    stats?: {
        totalStudents: number
        totalFaculty: number
        totalClasses: number
        totalAssignments: number
        creditsBalance: number
        pendingVerifications: number
    }
}

interface StatCardProps {
    title: string
    value: string | number
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon: React.ReactNode
    href: string
}

const StatCard = ({ title, value, change, changeType = "neutral", icon, href }: StatCardProps) => (
    <Link href={href}>
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                    {icon}
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-sm text-neutral-500">{title}</p>
            </div>
            {
                change && (
                    <div className={`mt-3 text-xs font-medium ${changeType === "positive" ? "text-green-600 dark:text-green-400" :
                            changeType === "negative" ? "text-red-600 dark:text-red-400" :
                                "text-neutral-500"
                        }`}>
                        {change}
                    </div>
                )
            }
        </motion.div>
    </Link>
)

export function HeadDashboard({ userName, stats }: HeadDashboardProps) {
    const dashboardStats = [
        {
            title: "Total Students",
            value: stats?.totalStudents || 0,
            change: stats?.pendingVerifications ? `${stats.pendingVerifications} pending verification` : "No pending verifications",
            icon: <Users className="w-5 h-5 text-violet-600" />,
            href: "/students"
        },
        {
            title: "Faculty Members",
            value: stats?.totalFaculty || 0,
            change: "Manage team roles",
            icon: <GraduationCap className="w-5 h-5 text-violet-600" />,
            href: "/team/roles"
        },
        {
            title: "Active Classes",
            value: stats?.totalClasses || 0,
            change: "View all classes",
            icon: <School className="w-5 h-5 text-violet-600" />,
            href: "/classes"
        },
        {
            title: "Credit Balance",
            value: stats?.creditsBalance || 0,
            change: "Manage credits",
            icon: <Coins className="w-5 h-5 text-violet-600" />,
            href: "/billing"
        },
    ]

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                University Administrator
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Complete administrative overview of your university platform.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/team/roles">
                            <Button variant="outline" className="rounded-xl">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite Faculty
                            </Button>
                        </Link>
                        <Link href="/billing">
                            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                                <CreditCard className="w-4 h-4 mr-2" />
                                Manage Billing
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                {dashboardStats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/departments/new" className="block">
                            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                        <Building className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">Create Department</p>
                                        <p className="text-xs text-neutral-500">Set up academic departments</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/classes/new" className="block">
                            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">Create Class</p>
                                        <p className="text-xs text-neutral-500">Set up a new class</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/students/verify" className="block">
                            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">Verify Students</p>
                                        <p className="text-xs text-neutral-500">Review verification requests</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <Link href="/analytics" className="block">
                            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                        <PieChart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">View Analytics</p>
                                        <p className="text-xs text-neutral-500">University-wide insights</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {/* Getting Started */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">Admin Checklist</h3>
                        <p className="text-violet-200 text-sm mb-4">
                            Complete these to fully set up your university.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                <span>University profile complete</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Create departments</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Invite faculty members</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Set up student verification</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Purchase credits</span>
                            </div>
                        </div>
                    </div>

                    {/* Billing Quick View */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <CreditCard className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Billing</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Manage subscription, credits, and invoices.
                        </p>
                        <Link href="/billing">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                Manage Billing
                            </Button>
                        </Link>
                    </div>

                    {/* Placements */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <Briefcase className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Placements</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Partner with companies and manage job postings.
                        </p>
                        <Link href="/placements">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View Placements
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
