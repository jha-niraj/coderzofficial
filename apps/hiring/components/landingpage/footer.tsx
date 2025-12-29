"use client";

import Link from "next/link";
import {
    Twitter, Linkedin, Github, Building2
} from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white dark:text-black" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                                Coder&apos;z
                            </span>
                        </Link>
                        <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
                            Engineering Intelligence Platform V2.0.<br />
                            Optimizing the global talent supply chain.
                        </p>
                    </div>
                    <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Platform</h4>
                            <ul className="space-y-4 text-sm text-neutral-500">
                                <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Assignment Studio</Link></li>
                                <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Open Source Vetting</Link></li>
                                <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">AI Interviewer</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-neutral-500">
                                <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">About</Link></li>
                                <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Security</Link></li>
                                <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Connect</h4>
                            <div className="flex gap-4">
                                <Link href="#" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><Twitter className="w-5 h-5" /></Link>
                                <Link href="#" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><Github className="w-5 h-5" /></Link>
                                <Link href="#" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><Linkedin className="w-5 h-5" /></Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                    <div className="text-[10px] text-neutral-500 font-mono">
                        © 2025 BuildrHQ Inc.
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">System Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}