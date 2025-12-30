"use client"

import Link from "next/link"
import { GraduationCap, Twitter, Linkedin, Github, Mail } from "lucide-react"

const footerLinks = {
    product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "How It Works", href: "#how-it-works" },
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
        { label: "Main Platform", href: "https://coderzai.xyz" },
        { label: "Hiring Platform", href: "https://hiring.coderzai.xyz" },
        { label: "For Students", href: "https://coderzai.xyz" },
    ]
}

const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/thecoderzlab", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/coderzai", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/coderzai", label: "GitHub" },
    { icon: Mail, href: "mailto:support@coderzai.xyz", label: "Email" },
]

export default function Footer() {
    return (
        <footer className="bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-neutral-900 dark:text-white">
                                Coder&apos;z Uni
                            </span>
                        </Link>
                        <p className="text-sm text-neutral-500 mb-4">
                            Empowering universities with industry-ready technical education.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-4">Platforms</h4>
                        <ul className="space-y-2">
                            {footerLinks.platforms.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-neutral-500">
                        © {new Date().getFullYear()} Coder&apos;z University. All rights reserved.
                    </p>
                    <p className="text-sm text-neutral-500">
                        Made with 💜 by <a href="https://shunyatech.in" target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 transition-colors">Shunya Tech</a>
                    </p>
                </div>
            </div>
        </footer>
    )
}