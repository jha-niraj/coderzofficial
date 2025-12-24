"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
    ArrowRight, Github, Linkedin, Twitter, Target, Users, Globe, Cpu
} from 'lucide-react'
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import nirajjha from "./images/nirajjha (copy).jpeg"
import harsh from "./images/harsh.jpeg"

// Filtered Team Data
const leadership = [
    {
        name: "Niraj Jha",
        role: "Lead Developer & Architect",
        bio: "Full-stack engineer passionate about building scalable educational infrastructure.",
        img: nirajjha,
        links: {
            linkedin: "https://linkedin.com/in/janedoe",
            github: "https://github.com/jha-niraj",
            twitter: "#"
        }
    },
    {
        name: "Harsh Pandey",
        role: "Head of Operations & PR",
        bio: "Driving community growth and strategic partnerships across the tech ecosystem.",
        img: harsh,
        links: {
            linkedin: "https://www.linkedin.com/in/harsh-pandey0504",
            github: "https://github.com/HarshPandey-5804",
            twitter: "#"
        }
    }
]

const stats = [
    { label: "Community Members", value: "10K+" },
    { label: "Projects Shipped", value: "500+" },
    { label: "Countries Reached", value: "12" },
    { label: "Lines of Code", value: "1M+" },
]

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">
            <section className="relative pt-32 pb-20 border-b border-neutral-100 dark:border-neutral-800">
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium text-sm">
                            Since 2024
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white mb-8">
                            We are building the <br />
                            <span className="text-neutral-400 dark:text-neutral-600">operating system</span> for students.
                        </h1>
                        <p className="text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                            The Coder'z is not just an ed-tech platform. It is an engineering ecosystem designed to bridge the gap between academic theory and production-grade software development.
                        </p>
                    </motion.div>
                </div>
            </section>
            <section className="py-24 border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        {
                            [
                                { icon: Target, title: "Our Mission", desc: "To democratize access to high-level engineering tools and mentorship." },
                                { icon: Users, title: "Community", desc: "Fostering a peer-to-peer network of ambitious developers." },
                                { icon: Cpu, title: "Technology", desc: "Leveraging AI to simulate real-world technical interviews and tasks." },
                                { icon: Globe, title: "Impact", desc: "Helping students land roles at top product companies globally." }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-900 dark:text-white">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{item.title}</h3>
                                    <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            ))
                        }
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-neutral-100 dark:border-neutral-800">
                        {
                            stats.map((stat, i) => (
                                <div key={i}>
                                    <div className="text-3xl font-bold text-neutral-900 dark:text-white mb-1 font-mono">{stat.value}</div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-24 bg-neutral-50 dark:bg-neutral-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Leadership</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-xl">
                            Engineers and builders dedicated to the future of education.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                        {
                            leadership.map((leader, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl flex items-start gap-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                                >
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                        <Image
                                            src={leader.img}
                                            alt={leader.name}
                                            fill
                                            className="object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">{leader.name}</h3>
                                        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
                                            {leader.role}
                                        </p>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                                            {leader.bio}
                                        </p>
                                        <div className="flex gap-4">
                                            <Link href={leader.links.linkedin} target="_blank" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                                <Linkedin className="w-4 h-4" />
                                            </Link>
                                            <Link href={leader.links.github} target="_blank" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                                <Github className="w-4 h-4" />
                                            </Link>
                                            <Link href={leader.links.twitter} target="_blank" className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                                                <Twitter className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-24 border-t border-neutral-100 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Ready to join the movement?</h2>
                    <div className="flex justify-center gap-4">
                        <Link href="mailto:thecoderzofficial@gmail.com">
                            <Button size="lg" className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
                                Contact Us <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/explore">
                            <Button variant="outline" size="lg" className="rounded-full border-neutral-200 dark:border-neutral-800">
                                Explore Platform
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}