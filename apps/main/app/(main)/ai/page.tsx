"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    ArrowRight, Sparkles, Users, Zap, Trophy, Briefcase, GitPullRequest,
    LayoutTemplate, BrainCircuit, ChevronRight, Lock, CheckCircle2,
    ScanSearch, FileText, ShieldCheck, TestTube2
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@repo/ui/components/ui/dialog"
import { useRouter } from "next/navigation"
import toast from "@repo/ui/components/ui/sonner"
import { saveFeatureNotifyInterest } from "@/actions/(main)/feature-notify.action"
import { FeatureNotifySection } from "@repo/prisma/client"

// Active tools - Job Interview Assistant & Resume Creator only
const tools = [
    {
        id: "jobinterviewassistant",
        icon: Briefcase,
        name: "Job Interview Assistant",
        description: "Context-aware simulation that ingests your specific resume and the target job description to generate high-probability technical questions.",
        features: ["Resume Parsing", "Role-Specific Scenarios", "STAR Method Feedback"],
        status: "Live",
        credits: 25,
        href: "/ai/jobinterviewassistant"
    },
    {
        id: "resumecreator",
        icon: FileText,
        name: "Resume Creator",
        description: "Build ATS-friendly resumes with AI. Sync work experience, education, skills & projects to your profile.",
        features: ["Profile Sync", "Live Preview", "ATS Optimization"],
        status: "Live",
        credits: 0,
        href: "/ai/resume"
    },
    {
        id: "coverletter",
        icon: FileText,
        name: "Cover Letter",
        description: "Build ATS-friendly resumes with AI. Sync work experience, education, skills & projects to your profile.",
        features: ["Profile Sync", "Live Preview", "ATS Optimization"],
        status: "Live",
        credits: 0,
        href: "/ai/resume/cover-letter"
    },
]

// Locked / Notify Me tools
const lockedTools = [
    { id: "portfolio-audit", icon: ScanSearch, name: "Portfolio Audit", description: "Scan your GitHub and Portfolio to identify red flags and weak case studies.", section: "AI_PORTFOLIO_AUDIT" as const },
    { id: "system-architect", icon: LayoutTemplate, name: "System Architect", description: "Get DB schema, API structure, and tech stack for your project.", section: "AI_SYSTEM_ARCHITECT" as const },
    { id: "project-scoper", icon: BrainCircuit, name: "Project Scoper", description: "Turn ideas into development roadmaps with MVP and sprint planning.", section: "AI_PROJECT_SCOPER" as const },
    { id: "oss-scout", icon: GitPullRequest, name: "Open Source Scout", description: "Find Good First Issues matching your tech stack.", section: "AI_OSS_SCOUT" as const },
    { id: "docusmith", icon: FileText, name: "DocuSmith", description: "Generate API docs and How-to guides from your code.", section: "AI_DOCUSMITH" as const },
    { id: "code-sentinel", icon: ShieldCheck, name: "Code Sentinel", description: "Automated PR reviews for security and anti-patterns.", section: "AI_CODE_SENTINEL" as const },
    { id: "test-forge", icon: TestTube2, name: "Test Forge", description: "Generate integration tests for APIs.", section: "AI_TEST_FORGE" as const },
]

const stats = [
    { label: "Interviews Aced", value: "850", icon: Trophy, suffix: "+" },
    { label: "Systems Designed", value: "2.1K", icon: LayoutTemplate, suffix: "" },
    { label: "Active Developers", value: "10K", icon: Users, suffix: "+" },
    { label: "Uptime", value: "99.9", icon: Zap, suffix: "%" },
]

type LockedTool = typeof lockedTools[0];

export default function AiToolsPage() {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState<LockedTool | null>(null);
    const [notifyLoading, setNotifyLoading] = useState(false);

    const handleLockedClick = (tool: LockedTool) => {
        setSelectedTool(tool);
        setDialogOpen(true);
    };

    const handleNotifyMe = async () => {
        if (!selectedTool) return;
        setNotifyLoading(true);
        const res = await saveFeatureNotifyInterest({
            section: selectedTool.section as FeatureNotifySection,
            title: selectedTool.name,
            description: selectedTool.description,
        });
        setNotifyLoading(false);
        if (res.success) {
            setDialogOpen(false);
            setSelectedTool(null);
            toast.success("You'll receive an email at launch!", {
                description: "We'll notify you when this feature is ready.",
            });
        } else {
            toast.error(res.error || "Failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans selection:bg-neutral-100 dark:selection:bg-neutral-800">

                <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
                    <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500/10 opacity-50 blur-[100px] dark:bg-blue-500/20"></div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <motion.div
                            className="flex flex-col items-center text-center space-y-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm backdrop-blur-sm">
                                    <Sparkles className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                    The Coder&apos;z Intelligence Engine
                                </Badge>
                            </motion.div>
                            <motion.h1
                                className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-950 dark:text-white max-w-4xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Tools specifically engineered <br className="hidden md:block" />
                                <span className="text-neutral-400 dark:text-neutral-500">for the modern developer.</span>
                            </motion.h1>
                            <motion.p
                                className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                We don&apos;t build generic wrappers. We build specialized agents that help you architect systems, contribute to open source, and land high-impact roles.
                            </motion.p>
                            <motion.div
                                className="flex flex-wrap items-center justify-center gap-4 pt-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Button size="lg" className="h-12 px-8 text-base bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-xl shadow-neutral-500/10 rounded-full transition-all duration-300">
                                    Explore Studio
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
                <section className="py-12 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            {
                                stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col items-center text-center group"
                                    >
                                        <div className="mb-3 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                            {stat.value}<span className="text-neutral-400 dark:text-neutral-600 ml-0.5 text-2xl">{stat.suffix}</span>
                                        </div>
                                        <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))
                            }
                        </div>
                    </div>
                </section>
                <section id="studio" className="py-24 bg-neutral-50/50 dark:bg-neutral-950">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                                    Developer Studio
                                </h2>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
                                    Specialized agents designed to handle the complexities of software engineering.
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tools.map((tool, index) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    onClick={() => router.push(tool.href)}
                                    className="cursor-pointer"
                                >
                                    <div className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-neutral-900/5 dark:hover:shadow-black/50 transition-all duration-500">
                                        <div className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-14 h-14 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white">
                                                    <tool.icon className="w-7 h-7" />
                                                </div>
                                                <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                    {tool.status}
                                                </Badge>
                                            </div>
                                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{tool.name}</h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-base mb-6">
                                                {tool.description}
                                            </p>
                                            <div className="flex items-center justify-end text-sm font-bold text-neutral-900 dark:text-white group-hover:translate-x-1 transition-transform">
                                                Launch <ChevronRight className="ml-1 w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {lockedTools.map((tool, index) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: (tools.length + index) * 0.1 }}
                                    onClick={() => handleLockedClick(tool)}
                                    className="cursor-pointer"
                                >
                                    <div className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-neutral-900/5 dark:hover:shadow-black/50 transition-all duration-500 opacity-90">
                                        <div className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-14 h-14 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-500">
                                                    <tool.icon className="w-7 h-7" />
                                                </div>
                                                <Badge variant="outline" className="border-neutral-300 text-neutral-500">
                                                    <Lock className="w-3 h-3 mr-1" />
                                                    Notify Me
                                                </Badge>
                                            </div>
                                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">{tool.name}</h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-base mb-6">
                                                {tool.description}
                                            </p>
                                            <div className="flex items-center justify-end text-sm font-bold text-neutral-500 group-hover:translate-x-1 transition-transform">
                                                Notify Me <ChevronRight className="ml-1 w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="py-24 relative overflow-hidden bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-900/20"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neutral-200/50 dark:bg-neutral-800/30 rounded-full blur-[100px] pointer-events-none" />

                    <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                One subscription. <br /> Infinite possibilities.
                            </h2>
                            <p className="text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-light">
                                Access the entire suite of engineering intelligence tools with a single plan. No hidden fees.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    size="lg"
                                    className="h-14 px-8 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 font-semibold text-lg rounded-full"
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 bg-transparent text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 font-semibold text-lg rounded-full"
                                >
                                    View Pricing
                                </Button>
                            </div>
                            <div className="pt-6 flex items-center justify-center gap-6 text-sm text-neutral-400 font-medium">
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Cancel anytime</span>
                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Secure payment</span>
                            </div>
                        </motion.div>
                    </div>
                </section>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                                <Lock className="w-5 h-5 text-neutral-400" />
                                Coming Soon
                            </DialogTitle>
                            <DialogDescription>
                                Get notified when this feature launches. We&apos;ll send you an email.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6">
                            {selectedTool && (
                                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-100 dark:border-neutral-800 mb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                            <selectedTool.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-lg">{selectedTool.name}</span>
                                    </div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                        {selectedTool.description}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => setDialogOpen(false)} variant="outline" className="flex-1 rounded-full border-neutral-200 dark:border-neutral-800">
                                Close
                            </Button>
                            <Button onClick={handleNotifyMe} disabled={notifyLoading} className="flex-1 rounded-full bg-neutral-900 dark:bg-white dark:text-neutral-900">
                                {notifyLoading ? "Saving..." : "Notify Me"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
    )
}