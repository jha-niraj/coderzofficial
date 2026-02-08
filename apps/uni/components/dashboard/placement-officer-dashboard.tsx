"use client"

import { motion } from "framer-motion"
import {
    Users, Briefcase, ArrowRight, Building2, Plus,
    AlertCircle, TrendingUp, UserCheck
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

interface PlacementOfficerDashboardProps {
    userName: string
    stats?: {
        totalStudents: number
        placedStudents: number
        activeJobPostings: number
        pendingApplications: number
        partnerCompanies: number
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
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                    {icon}
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-sm text-neutral-500">{title}</p>
            </div>
            {change && (
                <div className={`mt-3 text-xs font-medium ${
                    changeType === "positive" ? "text-green-600 dark:text-green-400" :
                    changeType === "negative" ? "text-red-600 dark:text-red-400" :
                    "text-neutral-500"
                }`}>
                    {change}
                </div>
            )}
        </motion.div>
    </Link>
)

export function PlacementOfficerDashboard({ userName, stats }: PlacementOfficerDashboardProps) {
    const placementRate = stats?.totalStudents ? 
        Math.round((stats.placedStudents || 0) / stats.totalStudents * 100) : 0

    const dashboardStats = [
        { 
            title: "Total Students", 
            value: stats?.totalStudents || 0, 
            change: `${placementRate}% placement rate`,
            changeType: placementRate > 50 ? "positive" as const : "neutral" as const,
            icon: <Users className="w-5 h-5 text-blue-600" />, 
            href: "/students" 
        },
        { 
            title: "Placed Students", 
            value: stats?.placedStudents || 0, 
            change: "Successfully placed",
            changeType: "positive" as const,
            icon: <UserCheck className="w-5 h-5 text-blue-600" />, 
            href: "/placements/placed" 
        },
        { 
            title: "Active Jobs", 
            value: stats?.activeJobPostings || 0, 
            change: "Open positions",
            icon: <Briefcase className="w-5 h-5 text-blue-600" />, 
            href: "/placements/jobs" 
        },
        { 
            title: "Partner Companies", 
            value: stats?.partnerCompanies || 0, 
            change: "View partnerships",
            icon: <Building2 className="w-5 h-5 text-blue-600" />, 
            href: "/placements/companies" 
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
                            <Briefcase className="w-5 h-5 text-blue-500" />
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                Placement Officer
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Manage student placements and company partnerships.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/placements/companies/new">
                            <Button variant="outline" className="rounded-xl">
                                <Building2 className="w-4 h-4 mr-2" />
                                Add Company
                            </Button>
                        </Link>
                        <Link href="/placements/jobs/new">
                            <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Post Job
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
                {/* Pending Applications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Applications</h2>
                        <Link href="/placements/applications">
                            <Button variant="ghost" size="sm" className="text-xs">
                                View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">No pending applications</h3>
                        <p className="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">
                            Post jobs to receive student applications.
                        </p>
                        <Link href="/placements/jobs/new">
                            <Button variant="outline" size="sm" className="rounded-xl">
                                <Plus className="w-4 h-4 mr-2" />
                                Post First Job
                            </Button>
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
                    {/* Placement Stats */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">Placement Overview</h3>
                        <p className="text-blue-200 text-sm mb-4">
                            Current semester statistics.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-200">Placement Rate</span>
                                <span className="font-bold">{placementRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-200">Avg. Package</span>
                                <span className="font-bold">-</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-200">Top Recruiter</span>
                                <span className="font-bold">-</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Reports</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Generate placement reports and analytics.
                        </p>
                        <Link href="/placements/reports">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View Reports
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
