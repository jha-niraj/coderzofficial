"use client"

import { motion } from "framer-motion"
import {
    GraduationCap, BarChart3, Bell, Calendar
} from "lucide-react"

export default function StudentManagement() {
    return (
        <div className="py-24 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {
                                [
                                    { label: "Enrollment", val: "2,480" },
                                    { label: "Active", val: "92%" },
                                    { label: "Avg Score", val: "8.4" },
                                    { label: "Placed", val: "156" }
                                ].map((s, i) => (
                                    <div key={i} className="bg-white dark:bg-neutral-950 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        <div className="text-[10px] font-mono uppercase text-neutral-500 mb-1">{s.label}</div>
                                        <div className="text-xl font-bold text-neutral-900 dark:text-white">{s.val}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                            Administration
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                            Total Visibility.
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                            Track every student&apos;s journey from enrollment to placement.
                            Automated alerts for attendance and performance dips.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {
                                [
                                    { icon: GraduationCap, title: "Bulk Import", desc: "CSV / XLS Support" },
                                    { icon: BarChart3, title: "Deep Analytics", desc: "Per-student Drilldown" },
                                    { icon: Bell, title: "Smart Alerts", desc: "Automated Triggers" },
                                    { icon: Calendar, title: "Semester Planning", desc: "Curriculum Scheduler" },
                                ].map((f, i) => (
                                    <div key={i}>
                                        <f.icon className="w-5 h-5 text-neutral-900 dark:text-white mb-2" />
                                        <h4 className="font-bold text-sm mb-1">{f.title}</h4>
                                        <p className="text-xs text-neutral-500">{f.desc}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}