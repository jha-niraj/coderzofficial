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
    const toggleMobileMenu = () => setIsMobileMenuOpen(c => !c);


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

    return (
        <nav className={`fixed top-0 w-full pl-3 pr-3 z-50 transition-all duration-300 ${pathname === '/' ? (scrolled ? 'bg-neutral-950/20 backdrop-blur-md' : 'bg-transparent') : 'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800'}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/titlelogo.jpeg"
                        alt="The Coder&apos;z"
                        height={40}
                        width={40}
                        className="rounded-sm sm:hidden"
                    />
                    <h1 className={`hidden sm:block text-lg font-semibold ${pathname === '/' ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>The Coder&apos;z</h1>
                </Link>
                <div className={`hidden md:flex items-center space-x-1 rounded-full ${pathname === '/' ? 'bg-white/5 backdrop-blur-xl border border-white/10' : 'bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800'} p-1 -mr-6`}>
                    <Link href="/" className={`rounded-full px-4 py-2 text-sm font-medium ${pathname === '/' ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-neutral-700 dark:text-white/90 hover:bg-neutral-200/40 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'} transition-all`}>Home</Link>
                    <Link href="/projects" className={`rounded-full px-4 py-2 text-sm font-medium ${pathname === '/' ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-neutral-700 dark:text-white/90 hover:bg-neutral-200/40 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'} transition-all`}>Projects</Link>
                    <Link href="/ai" className={`rounded-full px-4 py-2 text-sm font-medium ${pathname === '/' ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-neutral-700 dark:text-white/90 hover:bg-neutral-200/40 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'} transition-all`}>AI Tools</Link>
                    <Link href="/blogs" className={`rounded-full px-4 py-2 text-sm font-medium ${pathname === '/' ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-neutral-700 dark:text-white/90 hover:bg-neutral-200/40 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'} transition-all`}>Blogs</Link>
                    <Link href="/purchase" className={`rounded-full px-4 py-2 text-sm font-medium ${pathname === '/' ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-neutral-700 dark:text-white/90 hover:bg-neutral-200/40 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'} transition-all`}>Purchase Credits</Link>
                </div>
                <div className="flex items-center justify-center space-x-3">
                    <ThemeToggle />
                    {
                        status === "authenticated" ? (
                            <button className="rounded-full" onClick={() => setIsMobileMenuOpen(true)}>
                                {
                                    session?.user?.image ? (
                                        <Image
                                            className="h-10 w-10 rounded-full hidden md:flex"
                                            src={session.user.image}
                                            alt={`Profile picture of ${session.user.name || 'user'}`}
                                            width={40}
                                            height={40}
                                        />
                                    ) : (
                                        <div className={`h-10 w-10 rounded-full ${pathname === '/' ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-800 dark:bg-white/20 dark:text-white'} flex items-center justify-center`}>
                                            <span className="text-sm">{session?.user?.name?.[0] || 'U'}</span>
                                        </div>
                                    )
                                }
                            </button>
                        ) : (
                            <Link href="/signin">
                                <Button className={`${pathname === '/' ? 'bg-white text-black hover:bg-gray-100' : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black'} rounded-full`}>
                                    Get Started
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        )
                    }
                    <Button onClick={() => setIsMobileMenuOpen(true)} variant="ghost" size="icon" className="md:hidden">
                        <Menu className={`h-6 w-6 ${pathname === '/' ? 'text-white' : 'text-neutral-900 dark:text-white'}`} />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </div >
            <AnimatePresence>
                {
                    isMobileMenuOpen && (
                        <Sheet open={isMobileMenuOpen} onOpenChange={() => setIsMobileMenuOpen(false)}>
                            <SheetContent className="max-w-[500px] h-screen p-0 border-l-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 overflow-auto py-6 px-4">
                                        <div className="grid grid-cols-1 gap-2">
                                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800">Home</Link>
                                            <Link href="/projects" className={`rounded-full px-4 py-2 text-sm font-medium ${pathname === '/' ? 'text-white/90 hover:bg-white/10 hover:text-white' : 'text-neutral-700 dark:text-white/90 hover:bg-neutral-200/40 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'} transition-all`}>Projects</Link>
                                            <Link href="/ai" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800">AI Tools</Link>
                                            <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800">Blogs</Link>
                                            <Link href="/purchase" onClick={() => setIsMobileMenuOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800">Purchase Credits</Link>
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