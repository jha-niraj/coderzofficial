"use client"

import { motion } from "framer-motion"
import {
    Users, BookOpen, School, Plus, ArrowRight, GraduationCap,
    CheckCircle2, AlertCircle, FileText, Clock
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

interface FacultyDashboardProps {
    userName: string
    stats?: {
        myClasses: number
        totalStudents: number
        activeAssignments: number
        pendingGrading: number
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

export function FacultyDashboard({ userName, stats }: FacultyDashboardProps) {
    const dashboardStats = [
        { 
            title: "My Classes", 
            value: stats?.myClasses || 0, 
            change: "View assigned classes",
            icon: <School className="w-5 h-5 text-violet-600" />, 
            href: "/classes" 
        },
        { 
            title: "My Students", 
            value: stats?.totalStudents || 0, 
            change: "Across all classes",
            icon: <Users className="w-5 h-5 text-violet-600" />, 
            href: "/students" 
        },
        { 
            title: "Active Assignments", 
            value: stats?.activeAssignments || 0, 
            change: "View assignments",
            icon: <BookOpen className="w-5 h-5 text-violet-600" />, 
            href: "/assignments" 
        },
        { 
            title: "Pending Grading", 
            value: stats?.pendingGrading || 0, 
            change: stats?.pendingGrading ? "Needs attention" : "All caught up!",
            changeType: stats?.pendingGrading ? "negative" as const : "positive" as const,
            icon: <FileText className="w-5 h-5 text-violet-600" />, 
            href: "/assignments?filter=pending" 
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
                            <GraduationCap className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                Faculty Member
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Manage your classes and assignments.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/assignments">
                            <Button variant="outline" className="rounded-xl">
                                <FileText className="w-4 h-4 mr-2" />
                                Grade Submissions
                            </Button>
                        </Link>
                        <Link href="/assignments/new">
                            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Assignment
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
                {/* My Classes */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">My Classes</h2>
                        <Link href="/classes">
                            <Button variant="ghost" size="sm" className="text-xs">
                                View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-violet-500" />
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">No classes assigned yet</h3>
                        <p className="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">
                            Your department head will assign you to classes.
                        </p>
                    </div>
                </motion.div>

                {/* Right Sidebar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {/* Quick Tips */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">Getting Started</h3>
                        <p className="text-violet-200 text-sm mb-4">
                            Tips for using the platform effectively.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                <span>Profile completed</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Get assigned to classes</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Create your first assignment</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Grade student submissions</span>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <Clock className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Upcoming Deadlines</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            No upcoming assignment deadlines.
                        </p>
                        <Link href="/assignments">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View All Assignments
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
