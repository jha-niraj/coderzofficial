"use client"

import Link from "next/link"
import {
    GraduationCap, Twitter, Linkedin, Github, Mail
} from "lucide-react"

const footerLinks = {
    product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "System", href: "#how-it-works" },
        { label: "FAQ", href: "#faq" },
    ],
    company: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contactus" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
    ],
    legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Data Processing", href: "#" },
    ],
    platforms: [
        { label: "Main Platform", href: "https://buildrhq.com" },
        { label: "BuildrHQ Hiring", href: "https://hiring.buildrhq.com" },
        { label: "For Students", href: "https://buildrhq.com" },
    ]
}

const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "#", label: "Email" },
]

export default function Footer() {
    return (
        <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white dark:text-black" />
                            </div>
                            <span className="font-bold text-neutral-900 dark:text-white">
                                BuildrHQ University
                            </span>
                        </Link>
                        <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mb-6">
                            Deploying industry-grade educational infrastructure for modern universities.
                        </p>
                        <div className="flex gap-3">
                            {
                                socialLinks.map((social) => (
                                    <Link
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </Link>
                                ))
                            }
                        </div>
                    </div>
                    <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Product</h4>
                        <ul className="space-y-3">
                            {
                                footerLinks.product.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Company</h4>
                        <ul className="space-y-3">
                            {
                                footerLinks.company.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Legal</h4>
                        <ul className="space-y-3">
                            {
                                footerLinks.legal.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Ecosystem</h4>
                        <ul className="space-y-3">
                            {
                                footerLinks.platforms.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                            {link.label}
                                        </a>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-mono text-neutral-500">
                        © {new Date().getFullYear()} BuildrHQ University.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">System Online</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}