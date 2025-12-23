"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    GraduationCap, FolderKanban, Lightbulb, Film, Mic2, Users,
    ChevronRight, LayoutDashboard
} from "lucide-react";
import { cn } from "../../lib/utils";

const sidebarLinks = [
    {
        href: "/learnings",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        href: "/learnings/projects",
        label: "Projects",
        icon: FolderKanban,
    },
    {
        href: "/learnings/concepts",
        label: "Concepts",
        icon: Lightbulb,
    },
    {
        href: "/learnings/studio",
        label: "Studio",
        icon: Film,
    },
    {
        href: "/learnings/mock",
        label: "Mock Interviews",
        icon: Mic2,
    },
    {
        href: "/learnings/communities",
        label: "Communities",
        icon: Users,
    },
];

export default function LearningsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-neutral-900 dark:text-white">My Learnings</h2>
                                    <p className="text-xs text-neutral-500">Track your progress</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {sidebarLinks.map((link) => {
                                const isActive = link.exact 
                                    ? pathname === link.href 
                                    : pathname.startsWith(link.href);
                                const Icon = link.icon;

                                return (
                                    <Link key={link.href} href={link.href}>
                                        <motion.div
                                            whileHover={{ x: 2 }}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                                isActive
                                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{link.label}</span>
                                            {isActive && (
                                                <ChevronRight className="h-4 w-4 ml-auto" />
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Footer */}
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20">
                                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                                    Keep Learning! 🎯
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Consistency is key to mastery
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Mobile Bottom Nav */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 px-2 py-2">
                    <div className="flex items-center justify-around">
                        {sidebarLinks.slice(0, 5).map((link) => {
                            const isActive = link.exact 
                                ? pathname === link.href 
                                : pathname.startsWith(link.href);
                            const Icon = link.icon;

                            return (
                                <Link key={link.href} href={link.href}>
                                    <div
                                        className={cn(
                                            "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                                            isActive
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-neutral-500"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-[10px] font-medium">{link.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
