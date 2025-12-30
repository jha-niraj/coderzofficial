"use client"

import { motion } from "framer-motion"
import {
    GraduationCap, UserCheck, BarChart3, Bell, Calendar, FileText, Award
} from "lucide-react"

export default function StudentManagement() {
    return (
        <div className="py-24 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left - Feature Preview */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Dashboard Preview Card */}
                        <div className="rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-2xl shadow-neutral-200/50 dark:shadow-neutral-900/50 overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                <span className="ml-4 text-xs font-mono text-neutral-500">University Dashboard</span>
                            </div>

                            {/* Content Preview */}
                            <div className="p-6">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[
                                        { label: "Total Students", value: "2,847", change: "+124 this month" },
                                        { label: "Active Assignments", value: "38", change: "12 due this week" },
                                        { label: "Avg Completion", value: "87%", change: "+5% from last sem" },
                                        { label: "Placements", value: "156", change: "This semester" },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50">
                                            <div className="text-xs text-neutral-500 mb-1">{stat.label}</div>
                                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
                                            <div className="text-xs text-emerald-600 mt-1">{stat.change}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-3">
                                    {[
                                        { icon: UserCheck, text: "45 students verified today", time: "Just now" },
                                        { icon: FileText, text: "New assignment: DSA Quiz 3", time: "2h ago" },
                                        { icon: Award, text: "Rahul Kumar placed at Google", time: "5h ago" },
                                    ].map((activity, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
                                            <activity.icon className="w-4 h-4 text-violet-500" />
                                            <span className="text-sm text-neutral-700 dark:text-neutral-300 flex-1">{activity.text}</span>
                                            <span className="text-xs text-neutral-400">{activity.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -bottom-4 -right-4 p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
                            <div className="text-2xl font-bold">24/7</div>
                            <div className="text-xs opacity-80">Real-time sync</div>
                        </div>
                    </motion.div>

                    {/* Right - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="px-3 py-1 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 text-[10px] font-mono uppercase tracking-widest text-violet-600 dark:text-violet-400">
                            Student Management
                        </span>
                        <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Complete Visibility, Zero Hassle
                        </h2>
                        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
                            From enrollment to placement, track every student&apos;s journey. Get actionable insights, identify at-risk students, and celebrate successes.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            {[
                                { icon: GraduationCap, title: "Easy Enrollment", desc: "Bulk import or email verification" },
                                { icon: BarChart3, title: "Progress Analytics", desc: "Detailed reports per student" },
                                { icon: Bell, title: "Smart Alerts", desc: "Deadlines & at-risk notifications" },
                                { icon: Calendar, title: "Academic Calendar", desc: "Plan semesters ahead" },
                            ].map((feature, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                                    <feature.icon className="w-6 h-6 text-violet-500 mb-2" />
                                    <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{feature.title}</h4>
                                    <p className="text-xs text-neutral-500 mt-1">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
