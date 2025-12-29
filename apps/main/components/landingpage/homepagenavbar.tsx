"use client";

import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    Sheet, SheetContent
} from "@repo/ui/components/ui/sheet";
import Image from "next/image";
import { ArrowRight, Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSession } from '@repo/auth/client';
import { ThemeToggle } from "@repo/ui/components/themetoggle";

export default function Navbar() {
    const { data: session, status } = useSession();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const linkBaseClasses = "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200";
    const standardLinkClasses = "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white";

    return (
        <nav className={`fixed top-0 w-full pl-3 pr-3 z-50 transition-all duration-300 
            ${isHome
                ? (scrolled ? 'bg-white/75 dark:bg-neutral-950/75 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 shadow-sm' : 'bg-transparent')
                : 'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800'
            }`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/titlelogo.jpeg"
                        alt="The Coder&apos;z"
                        height={40}
                        width={40}
                        className="rounded-sm sm:hidden"
                    />
                    <h1 className="hidden sm:block text-lg font-semibold text-neutral-900 dark:text-white">The Coder&apos;z</h1>
                </Link>
                <div className={`hidden md:flex items-center space-x-1 rounded-full transition-all duration-300 p-1 -mr-6
                    ${isHome
                        ? (scrolled ? 'bg-transparent' : 'bg-white/40 dark:bg-neutral-900/30 backdrop-blur-md border border-neutral-200/30 dark:border-white/5 shadow-sm')
                        : 'bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800'
                    }`}>
                    <Link href="/" className={`${linkBaseClasses} ${standardLinkClasses} ${pathname === '/' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : ''}`}>Home</Link>
                    <Link href="/projects" className={`${linkBaseClasses} ${standardLinkClasses} ${pathname === '/projects' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : ''}`}>Projects</Link>
                    <Link href="/ai" className={`${linkBaseClasses} ${standardLinkClasses} ${pathname === '/ai' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : ''}`}>AI Tools</Link>
                    <Link href="/blogs" className={`${linkBaseClasses} ${standardLinkClasses} ${pathname === '/blogs' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : ''}`}>Blogs</Link>
                    <Link href="/purchase" className={`${linkBaseClasses} ${standardLinkClasses} ${pathname === '/purchase' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' : ''}`}>Purchase Credits</Link>
                </div>

                <div className="flex items-center justify-center space-x-3">
                    <ThemeToggle />
                    {
                        status === "authenticated" ? (
                            <button className="rounded-full relative group" onClick={() => setIsMobileMenuOpen(true)}>
                                {
                                    session?.user?.image ? (
                                        <Image
                                            className="h-10 w-10 rounded-full hidden md:flex border-2 border-transparent group-hover:border-neutral-200 dark:group-hover:border-neutral-700 transition-all"
                                            src={session.user.image}
                                            alt={`Profile picture of ${session.user.name || 'user'}`}
                                            width={40}
                                            height={40}
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 flex items-center justify-center border-2 border-transparent group-hover:border-neutral-200 dark:group-hover:border-neutral-700 transition-all">
                                            <span className="text-sm font-medium">{session?.user?.name?.[0] || 'U'}</span>
                                        </div>
                                    )
                                }
                            </button>
                        ) : (
                            <Link href="/signin">
                                <Button className="cursor-pointer rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black transition-all">
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        )
                    }
                    <Button onClick={() => setIsMobileMenuOpen(true)} variant="ghost" size="icon" className="md:hidden text-neutral-900 cursor-pointer dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </div >
            <AnimatePresence>
                {
                    isMobileMenuOpen && (
                        <Sheet open={isMobileMenuOpen} onOpenChange={() => setIsMobileMenuOpen(false)}>
                            <SheetContent className="max-w-[500px] h-screen p-0 border-l-0 bg-white dark:bg-neutral-950">
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-auto py-6 px-4 font-medium">
                                        <div className="grid grid-cols-1 gap-2">
                                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-lg bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white">Home</Link>
                                            <Link href="/projects" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-all">Projects</Link>
                                            <Link href="/ai" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-all">AI Tools</Link>
                                            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-all">Blogs</Link>
                                            <Link href="/purchase" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-white transition-all">Purchase Credits</Link>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )
                }
            </AnimatePresence>
        </nav >
    );
}