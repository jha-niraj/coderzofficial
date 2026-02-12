"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowRight, Sparkles, Users, Zap, Trophy, Briefcase, GitPullRequest,
    LayoutTemplate, BrainCircuit, ChevronRight, Lock, Clock, CheckCircle2,
    ScanSearch, FileText, ShieldCheck, TestTube2
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import {
    Tabs, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog"
import SmoothScroll from "@/components/smoothscroll"
import { useRouter } from "next/navigation"

// --- Curated High-Value Tools ---
const toolCategories = [
    { id: "career", label: "Career Engineering" },
    { id: "architecture", label: "System Design" },
    { id: "quality", label: "Code Quality" },
    { id: "contribution", label: "Open Source" },
]

const tools = [
    {
        id: "jobinterviewassistant",
        icon: Briefcase,
        name: "Interview Assistant",
        description: "Context-aware simulation that ingests your specific resume and the target job description to generate high-probability technical questions.",
        features: ["Resume Parsing", "Role-Specific Scenarios", "STAR Method Feedback"],
        status: "Live",
        category: "career",
        credits: 25,
        access: "public"
    },
    {
        id: "portfolio-audit",
        icon: ScanSearch,
        name: "Portfolio Audit",
        description: "Stop guessing why you aren't getting callbacks. We scan your GitHub and Portfolio site to identify red flags, missing projects, and weak case studies.",
        features: ["GitHub Activity Analysis", "Project Impact Scoring", "Recruiter View Simulation"],
        status: "Beta",
        category: "career",
        credits: 15,
        access: "public"
    },
    {
        id: "system-architect",
        icon: LayoutTemplate,
        name: "System Architect",
        description: "Don't just code—design. Input your project idea and get a complete database schema, API endpoint structure, and tech stack recommendation.",
        features: ["DB Schema Generation", "API Route Planning", "Tech Stack Analysis"],
        status: "Beta",
        category: "architecture",
        credits: 40,
        access: "public"
    },
    {
        id: "project-scoper",
        icon: BrainCircuit,
        name: "Project Scoper",
        description: "Turn a vague startup idea into a development roadmap. Generates user stories, MVP requirements, and estimated development cycles.",
        features: ["MVP Definition", "Sprint Planning", "Feature Prioritization"],
        status: "In Development",
        category: "architecture",
        credits: 0,
        access: "waitlist"
    },
    {
        id: "oss-scout",
        icon: GitPullRequest,
        name: "Open Source Scout",
        description: "Stop scrolling GitHub aimlessly. We analyze your tech stack and find 'Good First Issues' in reputable repositories that actually match your skill level.",
        features: ["Repo Vetting", "Issue Complexity Analysis", "Contribution Guide"],
        status: "In Development",
        category: "contribution",
        credits: 0,
        access: "waitlist"
    },
    {
        id: "docusmith",
        icon: FileText,
        name: "DocuSmith",
        description: "Engineers hate writing docs. We generate beautiful, comprehensive API documentation (OpenAPI/Swagger) and 'How-to' guides directly from your code.",
        features: ["Auto-Swagger Generation", "Readme Optimization", "Usage Examples"],
        status: "In Development",
        category: "opensource",
        credits: 0,
        access: "waitlist"
    },
    {
        id: "code-sentinel",
        icon: ShieldCheck,
        name: "Code Sentinel",
        description: "An automated Senior Engineer that reviews your PRs. It ignores style nits and focuses on security vulnerabilities, memory leaks, and anti-patterns.",
        features: ["Security Vulnerability Scan", "Performance Audit", "Anti-Pattern Detection"],
        status: "Beta",
        category: "quality",
        credits: 30,
        access: "public"
    },
    {
        id: "test-forge",
        icon: TestTube2,
        name: "Test Forge",
        description: "Stop writing boilerplate. Generates comprehensive integration tests and edge-case scenarios for your API endpoints automatically.",
        features: ["Integration Test Generation", "Edge Case Discovery", "Mock Data Creation"],
        status: "In Development",
        category: "quality",
        credits: 0,
        access: "waitlist"
    },
]

const stats = [
    { label: "Interviews Aced", value: "850", icon: Trophy, suffix: "+" },
    { label: "Systems Designed", value: "2.1K", icon: LayoutTemplate, suffix: "" },
    { label: "Active Developers", value: "10K", icon: Users, suffix: "+" },
    { label: "Uptime", value: "99.9", icon: Zap, suffix: "%" },
]

export default function AiToolsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("career");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null);

    const handleToolClick = (tool: typeof tools[0]) => {
        if (tool.status === "Live" || tool.status === "Beta") {
            router.push(`/ai/${tool.id}`);
        } else {
            setSelectedTool(tool);
            setDialogOpen(true);
        }
    };

    return (
        <SmoothScroll>
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
                        <Tabs defaultValue="career" value={activeTab} onValueChange={setActiveTab} className="w-full mb-12">
                            <TabsList className="bg-transparent p-0 gap-2 h-auto flex flex-wrap justify-start">
                                {
                                    toolCategories.map((cat) => (
                                        <TabsTrigger
                                            key={cat.id}
                                            value={cat.id}
                                            className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-neutral-900 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                                        >
                                            {cat.label}
                                        </TabsTrigger>
                                    ))
                                }
                                <TabsTrigger value="all" className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-neutral-900 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 px-6 py-2.5 rounded-full text-sm font-medium transition-all">
                                    View All
                                </TabsTrigger>
                            </TabsList>
                            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {
                                        tools
                                            .filter(t => activeTab === 'all' || t.category === activeTab)
                                            .map((tool, index) => (
                                                <motion.div
                                                    key={tool.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                                    onClick={() => handleToolClick(tool)}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-neutral-900/5 dark:hover:shadow-black/50 transition-all duration-500">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neutral-200 via-neutral-500 to-neutral-200 dark:from-neutral-800 dark:via-neutral-500 dark:to-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                        <div className="p-8">
                                                            <div className="flex items-start justify-between mb-6">
                                                                <div className="w-14 h-14 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white group-hover:bg-neutral-100 dark:group-hover:bg-neutral-700 transition-colors">
                                                                    <tool.icon className="w-7 h-7" />
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <Badge variant="secondary" className={`
                                                                font-medium px-3 py-1 
                                                                ${tool.status === 'Live' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}
                                                            `}>
                                                                        {tool.status}
                                                                    </Badge>
                                                                    {
                                                                        tool.status === 'Live' && (
                                                                            <span className="text-xs text-neutral-400 font-medium">{tool.credits} Credits</span>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="mb-6">
                                                                <div className="text-xs font-bold text-neutral-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">
                                                                    {tool.category.replace("-", " ")}
                                                                </div>
                                                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                                                                    {tool.name}
                                                                </h3>
                                                                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-base">
                                                                    {tool.description}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-3 mb-8">
                                                                {
                                                                    tool.features.map((feature, idx) => (
                                                                        <div key={idx} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                                                            {feature}
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                            <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                                                <div className="text-sm font-medium text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
                                                                    {
                                                                        tool.access === 'waitlist' ? (
                                                                            <><Lock className="w-3.5 h-3.5" /> Private Beta</>
                                                                        ) : (
                                                                            <><Users className="w-3.5 h-3.5" /> Public Access</>
                                                                        )
                                                                    }
                                                                </div>
                                                                <div className="flex items-center text-sm font-bold text-neutral-900 dark:text-white group-hover:translate-x-1 transition-transform">
                                                                    {tool.status === 'Live' ? 'Launch' : 'Notify Me'}
                                                                    <ChevronRight className="ml-1 w-4 h-4" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                    }
                                </AnimatePresence>
                            </div>
                        </Tabs>
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
                                Private Beta
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-6">
                            <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-100 dark:border-neutral-800 mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                        {selectedTool && <selectedTool.icon className="w-5 h-5" />}
                                    </div>
                                    <span className="font-semibold text-lg">{selectedTool?.name}</span>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                    {selectedTool?.description}
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-neutral-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-sm text-neutral-900 dark:text-white">Coming Soon</p>
                                        <p className="text-xs text-neutral-500">This tool is currently undergoing final stress testing with our alpha group.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => setDialogOpen(false)} variant="outline" className="flex-1 rounded-full border-neutral-200 dark:border-neutral-800">
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

            </div>
        </SmoothScroll>
    )
}