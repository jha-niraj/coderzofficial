"use client";

import Link from "next/link";
import {
    Twitter, Linkedin, Github, Youtube, Command,
} from "lucide-react";
import toast from "@repo/ui/components/ui/sonner";
import { NewsletterSubscription } from "../homepage/newslettersubscription";

export default function Footer() {
    const handleComingSoon = (featureName: string) => {
        toast.info("Coming Soon", {
            description: `${featureName} is currently in development.`,
        });
    };

    const linkGroups = [
        {
            title: "Platform",
            links: [
                { name: "Explore", href: "/explore" },
                { name: "AI Tools", href: "/ai" },
                { name: "Projects", href: "/projects" },
                { name: "Pricing", href: "/#pricing" },
                { name: "Assessments", href: "/assessments" },
            ]
        },
        {
            title: "Resources",
            links: [
                { name: "Documentation", href: "/docs", dev: true },
                { name: "API Reference", href: "/api", dev: true },
                { name: "Community", href: "/communities" },
                { name: "Blog", href: "/blog", dev: true },
                { name: "Help Center", href: "/help", dev: true },
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About", href: "/about" },
                { name: "Careers", href: "/careers", dev: true },
                { name: "Partners", href: "/partners", dev: true },
                { name: "Terms of Service", href: "/termsofservice" },
                { name: "Privacy Policy", href: "/privacypolicy" },
                { name: "Contact", href: "/contactus" },
            ]
        }
    ];

    return (
        <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

                    <div className="lg:col-span-4 flex flex-col justify-between h-full">
                        <div>
                            <Link href="/" className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-neutral-900 font-bold">
                                    <Command className="w-4 h-4" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">The Coder&apos;z</span>
                            </Link>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed max-w-xs">
                                The operating system for engineering students.
                                Master system design, open source, and full-stack architecture.
                            </p>
                        </div>
                        <NewsletterSubscription />
                    </div>
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                        {
                            linkGroups.map((group) => (
                                <div key={group.title}>
                                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-6 text-sm">
                                        {group.title}
                                    </h4>
                                    <ul className="space-y-3">
                                        {
                                            group.links.map((link) => (
                                                <li key={link.name}>
                                                    {link.dev ? (
                                                        <button
                                                            onClick={() => handleComingSoon(link.name)}
                                                            className="group flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                                        >
                                                            {link.name}
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white border border-neutral-200 dark:border-neutral-700">
                                                                Dev
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            href={link.href}
                                                            className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                                        >
                                                            {link.name}
                                                        </Link>
                                                    )
                                                    }
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <p className="text-xs text-neutral-500">
                            © {new Date().getFullYear()} CoderzLab Inc.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-mono text-neutral-500 uppercase">All Systems Normal</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="https://twitter.com/thecoderzlab" target="_blank" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <Twitter className="w-4 h-4" />
                        </Link>
                        <Link href="https://github.com/thecoderzofficial" target="_blank" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <Github className="w-4 h-4" />
                        </Link>
                        <Link href="https://linkedin.com/company/thecoderzlab" target="_blank" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <Linkedin className="w-4 h-4" />
                        </Link>
                        <Link href="https://youtube.com/@thecoderzofficial" target="_blank" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <Youtube className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}