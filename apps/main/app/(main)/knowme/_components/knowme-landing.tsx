"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Bot, Sparkles, MessageSquare, Github, Code2, Briefcase, ChevronRight,
    Shield, Zap, Globe, BarChart3, Users, ArrowRight, Play
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { initializeKnowMeProfile } from "@/actions/(main)/knowme";
import toast from "@repo/ui/components/ui/sonner";
import Image from "next/image";
import SmoothScroll from "@/components/smoothscroll";

interface KnowMeLandingPageProps {
    isLoggedIn: boolean;
}

const features = [
    {
        icon: MessageSquare,
        title: "24/7 AI Assistant",
        description: "Answer questions about your work anytime, even when you're asleep.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Github,
        title: "Connect Platforms",
        description: "Sync data from GitHub, LeetCode, and more to enrich your AI.",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        icon: Code2,
        title: "Portfolio Integration",
        description: "Embed your AI chatbot directly into your personal portfolio.",
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: BarChart3,
        title: "Rich Analytics",
        description: "See who's asking about you and what they're interested in.",
        gradient: "from-emerald-500 to-teal-500",
    },
];

const howItWorks = [
    {
        step: 1,
        title: "Connect Your Data",
        description: "We gather your projects, assessments, and platform data",
        icon: Zap,
    },
    {
        step: 2,
        title: "AI Learns About You",
        description: "Your data is converted into intelligent knowledge",
        icon: Bot,
    },
    {
        step: 3,
        title: "Share & Impress",
        description: "Visitors can chat with your AI from anywhere",
        icon: Globe,
    },
];

export default function KnowMeLandingPage({ isLoggedIn }: KnowMeLandingPageProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleGetStarted = async () => {
        if (!isLoggedIn) {
            router.push("/login?callbackUrl=/knowme");
            return;
        }

        setIsLoading(true);
        try {
            const result = await initializeKnowMeProfile();
            if (result.success) {
                toast.success("Profile initialized! Let's set up your AI.");
                router.push("/knowme/onboarding");
            } else {
                toast.error(result.error || "Failed to initialize profile");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SmoothScroll>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 overflow-hidden">
                <section className="relative py-20 lg:py-32">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
                    </div>
                    <div className="container mx-auto px-4 max-w-7xl relative">
                        <div className="text-center max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Badge
                                    className="mb-6 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                                >
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    New AI Feature
                                </Badge>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6"
                            >
                                Meet{" "}
                                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                    KnowMe
                                </span>
                                <br />
                                Your AI Portfolio Assistant
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto"
                            >
                                Create an intelligent AI chatbot that knows everything about your
                                professional profile. Let recruiters and visitors discover your
                                skills, projects, and experience through natural conversation.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <Button
                                    size="lg"
                                    onClick={handleGetStarted}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                                >
                                    {
                                        isLoading ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Setting up...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                {isLoggedIn ? "Get Started Free" : "Sign In to Start"}
                                                <ChevronRight className="w-5 h-5 ml-1" />
                                            </>
                                        )
                                    }
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-6 text-lg rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    Watch Demo
                                </Button>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>500+ developers using</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>10K+ questions answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    <span>100+ recruiters engaged</span>
                                </div>
                            </motion.div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                            className="mt-16 relative"
                        >
                            <div className="relative max-w-4xl mx-auto">
                                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-neutral-700 overflow-hidden">
                                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-700">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                            <div className="w-3 h-3 rounded-full bg-green-400" />
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="bg-white dark:bg-neutral-800 rounded-lg px-4 py-1.5 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 max-w-md mx-auto">
                                                <Shield className="w-3 h-3 text-green-500" />
                                                coderz.com/knowme/yourname
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gradient-to-b from-slate-50 to-white dark:from-neutral-800 dark:to-neutral-900 min-h-[300px]">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                                                    <Image
                                                        src="https://tse4.mm.bing.net/th?id=OIP.-BS8Y2nH1k93GJiitUVBCAHaHa&pid=Api&P=0"
                                                        height={12}
                                                        width={12}
                                                        alt="User Image"
                                                        className="w-4 h-4"
                                                    />                                            </div>
                                                <div className="flex-1 bg-white dark:bg-neutral-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                                    <p className="text-sm text-slate-700 dark:text-slate-200">
                                                        Hi! 👋 I&apos;m the AI assistant for <strong>John Developer</strong>.
                                                        Ask me anything about his skills, projects, or experience!
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 justify-end">
                                                <div className="bg-sky-500 text-white rounded-2xl rounded-tr-none p-4 max-w-xs">
                                                    <p className="text-sm">
                                                        What&apos;s his experience with React?
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                                                    <Image
                                                        src="https://tse4.mm.bing.net/th?id=OIP.-BS8Y2nH1k93GJiitUVBCAHaHa&pid=Api&P=0"
                                                        height={12}
                                                        width={12}
                                                        alt="User Image"
                                                        className="w-4 h-4"
                                                    />
                                                </div>
                                                <div className="flex-1 bg-white dark:bg-neutral-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                                    <p className="text-sm text-slate-700 dark:text-slate-200">
                                                        I have 3+ years of React experience! I&apos;ve built 5 production apps
                                                        including an e-commerce platform with 10K+ users.
                                                        <br /><br />
                                                        📊 <strong>95%</strong> on React Assessment
                                                        <br />
                                                        🔗 View my projects →
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-4 -left-4 bg-white dark:bg-neutral-800 rounded-xl px-4 py-2 shadow-lg border border-slate-200 dark:border-neutral-700"
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-slate-600 dark:text-slate-300">Always available</span>
                                    </div>
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -bottom-4 -right-4 bg-white dark:bg-neutral-800 rounded-xl px-4 py-2 shadow-lg border border-slate-200 dark:border-neutral-700"
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <span className="text-slate-600 dark:text-slate-300">AI-powered answers</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>
                <section className="py-20 bg-white dark:bg-neutral-900/50">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-16"
                        >
                            <Badge className="mb-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                                Features
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                Everything you need to stand out
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                KnowMe combines your professional data with AI to create
                                an intelligent assistant that represents you perfectly.
                            </p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {
                                features.map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        className="group bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 hover:shadow-xl transition-all"
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {feature.description}
                                        </p>
                                    </motion.div>
                                ))
                            }
                        </div>
                    </div>
                </section>
                <section className="py-20">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-16"
                        >
                            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                How It Works
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                                Set up in 2 minutes
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Getting started is simple. Just connect your data and let AI do the rest.
                            </p>
                        </motion.div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {
                                howItWorks.map((step, index) => (
                                    <motion.div
                                        key={step.step}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        className="relative text-center"
                                    >
                                        {
                                            index < howItWorks.length - 1 && (
                                                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-neutral-700 dark:to-neutral-600" />
                                            )
                                        }
                                        <div className="relative">
                                            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                                                <step.icon className="w-10 h-10 text-slate-600 dark:text-slate-300" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                {step.step}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {step.description}
                                        </p>
                                    </motion.div>
                                ))
                            }
                        </div>
                    </div>
                </section>
                <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-white.svg')] opacity-10" />
                    <div className="container mx-auto px-4 max-w-4xl relative text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to transform your portfolio?
                            </h2>
                            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                                Join hundreds of developers who are already using KnowMe
                                to showcase their skills in a whole new way.
                            </p>
                            <Button
                                size="lg"
                                onClick={handleGetStarted}
                                disabled={isLoading}
                                className="bg-white text-purple-600 hover:bg-white/90 px-8 py-6 text-lg rounded-xl shadow-lg"
                            >
                                {isLoading ? "Setting up..." : "Create Your AI Now"}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    </div>
                </section>
            </div>
        </SmoothScroll>
    );
}