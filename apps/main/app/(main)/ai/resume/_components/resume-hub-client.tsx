"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    FileText, PenTool, ArrowRight, Lock, ChevronRight,
    Sparkles, Target, LineChart, Mail, Search, Briefcase,
    MessageSquare, ArrowUpRight, CheckCircle2, Zap,
    LayoutTemplate, Coins, Image as ImageIcon
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@repo/ui/components/ui/dialog"
import { useRouter } from "next/navigation"
import toast from "@repo/ui/components/ui/sonner"
import { saveFeatureNotifyInterest } from "@/actions/(main)/feature-notify.action"
import { purchaseResumeTemplate } from "@/actions/(main)/ai/resume-template.action"
import { FeatureNotifySection } from "@repo/prisma/client"

// Icon map for serialized icon names from server
const iconMap: Record<string, any> = {
    FileText, PenTool, Target, Sparkles, ArrowUpRight,
    Mail, LineChart, MessageSquare, Search, Briefcase,
}

interface Template {
    id: string
    slug: string
    name: string
    description: string
    previewImageUrl: string
    creditsCost: number
    sectionOrder: string[]
    usageCount: number
    isPurchased: boolean
    isDemo?: boolean
}

interface Stats {
    resumeSections: number
    coverLetters: number
    templatesUsed: number
    totalTemplates: number
}

interface UpcomingTool {
    id: string
    icon: string
    name: string
    description: string
    pain: string
    section: string
}

const activeTools = [
    {
        id: "resume-creator",
        icon: FileText,
        name: "Resume Creator",
        description: "Build ATS-friendly resumes with AI. Sync your profile data directly.",
        features: ["Profile Sync", "Live Preview", "ATS Optimization"],
        status: "Live",
        href: "/ai/resume/create",
    },
    {
        id: "cover-letter",
        icon: PenTool,
        name: "Cover Letter Generator",
        description: "Generate tailored cover letters for specific job postings.",
        features: ["Job-Specific", "Tone Control", "Export Ready"],
        status: "Live",
        href: "/ai/resume/cover-letter",
    },
]

const upcomingTools = [
    {
        id: "ats-score-checker",
        icon: Target,
        name: "ATS Score Checker",
        description: "Get an ATS compatibility score with keyword gaps and formatting issues.",
        pain: "60% of resumes are rejected by ATS before a human ever sees them",
        section: "AI_ATS_CHECKER" as const,
    },
    {
        id: "resume-tailor",
        icon: Sparkles,
        name: "Resume Tailor",
        description: "Auto-rewrite your bullet points to match exact job keywords.",
        pain: "Generic resumes get 3x fewer callbacks than tailored ones",
        section: "AI_RESUME_TAILOR" as const,
    },
    {
        id: "linkedin-optimizer",
        icon: ArrowUpRight,
        name: "LinkedIn Optimizer",
        description: "Get specific rewrites for headline, about, and experience sections.",
        pain: "87% of recruiters use LinkedIn — most profiles aren't optimized",
        section: "AI_LINKEDIN_OPTIMIZER" as const,
    },
    {
        id: "follow-up-email",
        icon: Mail,
        name: "Follow-Up Email Generator",
        description: "Professional follow-up emails after interviews and applications.",
        pain: "Candidates who follow up are 2x more likely to get a response",
        section: "AI_FOLLOWUP_EMAIL" as const,
    },
    {
        id: "salary-negotiator",
        icon: LineChart,
        name: "Salary Negotiation Coach",
        description: "Market-rate data and counter-offer scripts for your role.",
        pain: "Most developers leave $10-30K on the table by not negotiating",
        section: "AI_SALARY_NEGOTIATOR" as const,
    },
    {
        id: "resume-gap-explainer",
        icon: MessageSquare,
        name: "Resume Gap Explainer",
        description: "Turn employment gaps into compelling professional narratives.",
        pain: "72% of hiring managers say gaps are a concern — framing matters",
        section: "AI_GAP_EXPLAINER" as const,
    },
    {
        id: "job-match-finder",
        icon: Search,
        name: "Job Match Finder",
        description: "Get matched to open roles ranked by your skill alignment.",
        pain: "Developers spend 10+ hours/week job hunting — most is noise",
        section: "AI_JOB_MATCH" as const,
    },
    {
        id: "interview-predictor",
        icon: Briefcase,
        name: "Interview Question Predictor",
        description: "Get the 20 most likely interview questions based on YOUR experience.",
        pain: "Being unprepared for behavioral questions is the #1 regret",
        section: "AI_INTERVIEW_PREDICTOR" as const,
    },
]

export function ResumeHubClient({
    stats,
    templates,
}: {
    stats: Stats
    templates: Template[]
}) {
    const router = useRouter()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedTool, setSelectedTool] = useState<typeof upcomingTools[0] | null>(null)
    const [notifyLoading, setNotifyLoading] = useState(false)
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)

    const handleLockedClick = (tool: typeof upcomingTools[0]) => {
        setSelectedTool(tool)
        setDialogOpen(true)
    }

    const handleNotifyMe = async () => {
        if (!selectedTool) return
        setNotifyLoading(true)
        const res = await saveFeatureNotifyInterest({
            section: selectedTool.section as FeatureNotifySection,
            title: selectedTool.name,
            description: selectedTool.description,
        })
        setNotifyLoading(false)
        if (res.success) {
            setDialogOpen(false)
            setSelectedTool(null)
            toast.success("You'll be notified at launch!", {
                description: "We'll send you an email when this tool is ready.",
            })
        } else {
            toast.error(res.error || "Failed. Please try again.")
        }
    }

    const handleTemplateClick = async (template: Template) => {
        if (template.isDemo) {
            toast.info("Fill your resume data first!", {
                description: "Go to Resume Creator to add your experience, education, skills and projects. Then come back to pick a template.",
            })
            router.push("/ai/resume/create")
            return
        }

        if (template.isPurchased) {
            // Already purchased — go to resume creator with template
            router.push(`/ai/resume/create?template=${template.slug}`)
            return
        }

        // Purchase template
        setPurchaseLoading(template.id)
        const res = await purchaseResumeTemplate(template.id)
        setPurchaseLoading(null)

        if (res.success) {
            if (res.alreadyOwned) {
                router.push(`/ai/resume/create?template=${template.slug}`)
            } else {
                toast.success(`Template "${template.name}" unlocked!`, {
                    description: "Fill your resume data in the Resume Creator, then apply this template.",
                })
                router.push("/ai/resume/create")
            }
        } else {
            toast.error(res.error || "Failed to unlock template")
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans">
            <section className="relative pt-20 pb-8 lg:pt-28 lg:pb-14 overflow-hidden border-b border-neutral-100 dark:border-neutral-800">
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500/10 opacity-50 blur-[100px] dark:bg-indigo-500/20" />

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <motion.div
                        className="flex flex-col items-center text-center space-y-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm">
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                            Career Toolkit
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-950 dark:text-white max-w-3xl">
                            Land the job you deserve.
                            <br className="hidden md:block" />
                            <span className="text-neutral-400 dark:text-neutral-500">No fluff. Just results.</span>
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
                            Purpose-built tools that solve real problems developers face during the job hunt — from resume black-holes to salary lowballs.
                        </p>
                    </motion.div>
                </div>
            </section>
            <section className="py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            [
                                { label: "Resume Sections", value: stats.resumeSections, icon: FileText, suffix: "" },
                                { label: "Cover Letters", value: stats.coverLetters, icon: PenTool, suffix: "" },
                                { label: "Templates Used", value: stats.templatesUsed, icon: LayoutTemplate, suffix: "" },
                                { label: "Tools Coming", value: "8", icon: Zap, suffix: "" },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex flex-col items-center text-center group"
                                >
                                    <stat.icon className="w-5 h-5 mb-2 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                        {stat.value}<span className="text-neutral-400 ml-0.5 text-lg">{stat.suffix}</span>
                                    </div>
                                    <div className="text-xs font-medium text-neutral-500 mt-1">{stat.label}</div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-8 border-t border-neutral-100 dark:border-neutral-800">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Available Now</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 font-light text-sm">
                            Ready to use — start building your application materials today.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {
                            activeTools.map((tool, i) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                    onClick={() => router.push(tool.href)}
                                    className="cursor-pointer group"
                                >
                                    <div className="relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-neutral-900/5 dark:hover:shadow-black/30 transition-all duration-300">
                                        <div className="p-5 flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white flex-shrink-0">
                                                <tool.icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{tool.name}</h3>
                                                    <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-[10px] h-4 px-1.5">
                                                        {tool.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-2">
                                                    {tool.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {
                                                        tool.features.map((f) => (
                                                            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                                                                {f}
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <LayoutTemplate className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Resume Templates</h2>
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 font-light">
                            Choose a template to style your resume. Fill your data first in Resume Creator, then pick a template to apply.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {
                            templates.map((template, i) => (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                    onClick={() => handleTemplateClick(template)}
                                    className="cursor-pointer group"
                                >
                                    <div className="relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-neutral-900/5 dark:hover:shadow-black/40 transition-all duration-500">
                                        <div className="relative aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px]" />
                                            <div className="relative flex flex-col items-center gap-3 text-neutral-400">
                                                <ImageIcon className="w-12 h-12 opacity-30" />
                                                <span className="text-xs font-medium opacity-50">Preview Coming Soon</span>
                                            </div>
                                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                                {
                                                    template.isPurchased ? (
                                                        <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-[10px]">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Unlocked
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-700 text-[10px]">
                                                            <Coins className="w-3 h-3 mr-1 text-amber-500" />
                                                            {template.creditsCost} Credits
                                                        </Badge>
                                                    )
                                                }
                                                {
                                                    template.usageCount > 0 && (
                                                        <Badge variant="outline" className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-700 text-[10px]">
                                                            {template.usageCount} uses
                                                        </Badge>
                                                    )
                                                }
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">{template.name}</h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 text-xs leading-relaxed mb-3 line-clamp-2">
                                                {template.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                {
                                                    (template.sectionOrder as string[]).slice(0, 4).map((section) => (
                                                        <span
                                                            key={section}
                                                            className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-medium capitalize"
                                                        >
                                                            {section}
                                                        </span>
                                                    ))
                                                }
                                                {
                                                    (template.sectionOrder as string[]).length > 4 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 font-medium">
                                                            +{(template.sectionOrder as string[]).length - 4}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            <Button
                                                size="sm"
                                                className="w-full h-8 text-xs rounded-full"
                                                variant={template.isPurchased ? "outline" : "default"}
                                                disabled={purchaseLoading === template.id}
                                            >
                                                {
                                                    purchaseLoading === template.id
                                                        ? "Unlocking..."
                                                        : template.isPurchased
                                                            ? "Use Template"
                                                            : template.isDemo
                                                                ? "Fill Data First"
                                                                : "Unlock Template"
                                                }
                                                <ArrowRight className="ml-1.5 w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-16 bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-800">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Coming Soon</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 font-light text-sm">
                            Built from real developer pain points — not generic feature lists.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {
                            upcomingTools.map((tool, i) => (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    onClick={() => handleLockedClick(tool)}
                                    className="cursor-pointer group"
                                >
                                    <div className="relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-md hover:shadow-neutral-900/5 dark:hover:shadow-black/20 transition-all duration-300">
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-8 h-8 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center text-neutral-500">
                                                    <tool.icon className="w-4 h-4" />
                                                </div>
                                                <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700 text-neutral-500 text-[9px] h-4 px-1.5">
                                                    <Lock className="w-2.5 h-2.5 mr-0.5" />
                                                    Soon
                                                </Badge>
                                            </div>
                                            <h3 className="text-xs font-bold text-neutral-900 dark:text-white mb-1 leading-tight">{tool.name}</h3>
                                            <p className="text-neutral-500 dark:text-neutral-400 text-[10px] leading-relaxed mb-2 line-clamp-2">
                                                {tool.description}
                                            </p>
                                            <p className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1 leading-relaxed line-clamp-2">
                                                📊 {tool.pain}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="py-16 border-t border-neutral-100 dark:border-neutral-800">
                <div className="max-w-3xl mx-auto px-6 text-center space-y-5">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                        Stop applying blind.
                    </h2>
                    <p className="text-base text-neutral-500 dark:text-neutral-400 font-light">
                        Every tool here solves a specific pain point that costs developers real opportunities.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button
                            size="lg"
                            onClick={() => router.push("/ai/resume/create")}
                            className="h-11 px-7 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-full font-semibold text-sm"
                        >
                            Build Your Resume
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => router.push("/ai/resume/cover-letter")}
                            className="h-11 px-7 rounded-full border-neutral-200 dark:border-neutral-800 font-semibold text-sm"
                        >
                            Generate Cover Letter
                        </Button>
                    </div>
                    <div className="pt-3 flex items-center justify-center gap-6 text-xs text-neutral-400">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 100% Free</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> No signup wall</span>
                    </div>
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
                            Get notified when this tool launches. We&apos;ll send you an email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {
                            selectedTool && (
                                <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-100 dark:border-neutral-800 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                                            <selectedTool.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-semibold text-lg">{selectedTool.name}</span>
                                    </div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                        {selectedTool.description}
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md px-3 py-2">
                                        📊 {selectedTool.pain}
                                    </p>
                                </div>
                            )
                        }
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => setDialogOpen(false)} variant="outline" className="flex-1 rounded-full">
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