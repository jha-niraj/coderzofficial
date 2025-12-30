"use client";

import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import {
    Sheet, SheetContent
} from "@repo/ui/components/ui/sheet";
import {
    Menu, GraduationCap, ArrowRight
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@repo/ui/components/themetoggle";
import { cn } from "@repo/ui/lib/utils";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinkClass = "text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors";

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className={cn(
                "flex items-center justify-between w-full max-w-5xl h-14 px-4 pr-2 rounded-full",
                "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md",
                "border border-neutral-200 dark:border-neutral-800",
                "shadow-sm"
            )}>
                <Link href="/" className="flex items-center gap-3 pl-2 group">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center transition-transform group-hover:scale-105">
                        <GraduationCap className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <div className="flex flex-col justify-center h-8">
                        <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white leading-none">
                            ACADEMIA
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 leading-none mt-0.5 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                            by Coder&apos;z
                        </span>
                    </div>
                </Link>
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/" className={navLinkClass}>Overview</Link>
                    <Link href="#features" className={navLinkClass}>Modules</Link>
                    <Link href="#pricing" className={navLinkClass}>Allocation</Link>
                </div>
                <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <Link href="/register">
                        <Button className="rounded-full h-9 px-4 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-all hover:scale-105">
                            Register Uni
                            <ArrowRight className="ml-1.5 h-3 w-3" />
                        </Button>
                    </Link>
                    <Button
                        onClick={() => setIsMobileMenuOpen(true)}
                        variant="ghost"
                        size="icon"
                        className="md:hidden rounded-full"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
            </nav>
            <AnimatePresence>
                {
                    isMobileMenuOpen && (
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetContent className="w-full sm:max-w-md bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800">
                                <div className="flex flex-col gap-6 mt-8">
                                    <Link href="/" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>Overview</Link>
                                    <Link href="#features" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>Modules</Link>
                                    <Link href="#pricing" className="text-xl font-medium" onClick={() => setIsMobileMenuOpen(false)}>Allocation</Link>
                                    <hr className="border-neutral-200 dark:border-neutral-800" />
                                    <Link href="/register">
                                        <Button className="w-full rounded-full h-12 text-base font-bold bg-neutral-900 text-white dark:bg-white dark:text-black">
                                            Register University
                                        </Button>
                                    </Link>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )
                }
            </AnimatePresence>
        </div>
    );
}