"use client"

import {
    Shield, Lock, Activity
} from "lucide-react"

export default function AdminControlCenter() {
    return (
        <section className="py-24 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2 block">
                            Governance
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                            Institutional Control
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                            Complete oversight of student data, credit usage, and platform access levels.
                        </p>
                        <div className="space-y-4">
                            {
                                [
                                    { icon: Shield, title: "RBAC", desc: "Role-Based Access Control for HODs, Profs, and TAs." },
                                    { icon: Lock, title: "SSO Integration", desc: "Seamless login via Google Workspace or Microsoft Azure." },
                                    { icon: Activity, title: "Audit Logs", desc: "Track every assignment creation and grade change." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-neutral-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{item.title}</h4>
                                            <p className="text-xs text-neutral-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="relative aspect-video rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
                            <div className="absolute top-4 left-4 flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                                <div className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                            </div>
                            <div className="mt-8 grid grid-cols-3 gap-4">
                                <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800" />
                                <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800" />
                                <div className="h-24 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800" />
                            </div>
                            <div className="mt-4 h-32 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                                <span className="font-mono text-xs text-neutral-400">ADMIN_DASHBOARD_PREVIEW</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}