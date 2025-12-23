"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Github, Code2,
    Linkedin, Twitter, FileText, Lock, Unlock, CreditCard, Zap, CheckCircle2,
    Target, Sparkles, TrendingUp, ExternalLink, Users, Star, MessageSquare
} from "lucide-react"

const platformData = {
    github: {
        name: "GitHub",
        icon: Github,
        color: "from-gray-700 to-gray-900",
        nextSteps: [
            {
                title: "Contribute to React.js Ecosystem Projects",
                description:
                    "Focus on popular React libraries like Next.js, Chakra UI, or Material-UI. Look for 'good first issue' labels and contribute meaningful PRs to build credibility in the React community.",
                priority: "High",
                timeframe: "2-4 weeks",
                techStack: "React, TypeScript, Next.js",
                impact: "High visibility in React community",
            },
            {
                title: "Build a Full-Stack SaaS Project",
                description:
                    "Create a complete SaaS application using modern tech stack (Next.js, Prisma, PostgreSQL, Stripe). Document the entire development process and deployment strategy.",
                priority: "High",
                timeframe: "1-2 months",
                techStack: "Next.js, Prisma, PostgreSQL, Stripe",
                impact: "Demonstrates end-to-end development skills",
            },
            {
                title: "Implement Advanced Testing Strategies",
                description:
                    "Add comprehensive testing to your main repositories: unit tests with Jest, integration tests with Testing Library, and E2E tests with Playwright.",
                priority: "Medium",
                timeframe: "2-3 weeks",
                techStack: "Jest, Testing Library, Playwright",
                impact: "Shows commitment to code quality",
            },
            {
                title: "Create Technical Documentation Hub",
                description:
                    "Build a documentation website using Docusaurus or GitBook. Document your coding standards, architectural decisions, and create tutorials for complex implementations.",
                priority: "Medium",
                timeframe: "1-2 weeks",
                techStack: "Docusaurus, Markdown, MDX",
                impact: "Demonstrates communication skills",
            },
        ],
    },
    leetcode: {
        name: "LeetCode",
        icon: Code2,
        color: "from-orange-500 to-red-500",
        nextSteps: [
            {
                title: "Master Dynamic Programming Patterns",
                description:
                    "Focus on solving 50+ DP problems covering all major patterns: 1D DP, 2D DP, Tree DP, and State Machine DP. Target companies like Google and Meta heavily test these concepts.",
                priority: "High",
                timeframe: "4-6 weeks",
                techStack: "Algorithms, Dynamic Programming",
                impact: "Essential for FAANG interviews",
            },
            {
                title: "Participate in Weekly Contests Consistently",
                description:
                    "Join every LeetCode weekly contest for the next 3 months. Aim to solve at least 3/4 problems consistently to improve your contest rating and ranking.",
                priority: "High",
                timeframe: "12 weeks",
                techStack: "Competitive Programming",
                impact: "Improves problem-solving speed",
            },
            {
                title: "Study System Design Fundamentals",
                description:
                    "Learn system design concepts: Load Balancing, Caching, Database Sharding, Microservices. Practice designing systems like Twitter, Uber, and Netflix.",
                priority: "High",
                timeframe: "2-3 months",
                techStack: "System Design, Distributed Systems",
                impact: "Required for senior positions",
            },
            {
                title: "Create Algorithm Explanation Blog Series",
                description:
                    "Write detailed explanations for complex algorithms you've solved. Include time/space complexity analysis, multiple approaches, and real-world applications.",
                priority: "Medium",
                timeframe: "Ongoing",
                techStack: "Technical Writing, Algorithms",
                impact: "Builds personal brand and teaching skills",
            },
        ],
    },
    linkedin: {
        name: "LinkedIn",
        icon: Linkedin,
        color: "from-blue-600 to-blue-800",
        nextSteps: [
            {
                title: "Publish Weekly Technical Deep-Dives",
                description:
                    "Write in-depth articles about React performance optimization, Node.js best practices, or database design patterns. Share real examples from your projects with code snippets.",
                priority: "High",
                timeframe: "Weekly",
                techStack: "Technical Writing, React, Node.js",
                impact: "Establishes thought leadership",
            },
            {
                title: "Engage with Tech Leaders Daily",
                description:
                    "Comment thoughtfully on posts from CTOs and Engineering Managers at target companies. Share insights, ask meaningful questions, and build relationships.",
                priority: "High",
                timeframe: "Daily",
                techStack: "Networking, Communication",
                impact: "Builds professional network",
            },
            {
                title: "Share Project Case Studies",
                description:
                    "Create detailed posts about your projects: the problem you solved, technical challenges faced, solutions implemented, and lessons learned. Include metrics and results.",
                priority: "Medium",
                timeframe: "Bi-weekly",
                techStack: "Project Management, Technical Communication",
                impact: "Showcases problem-solving abilities",
            },
            {
                title: "Connect with Engineers at Target Companies",
                description:
                    "Strategically connect with 5-10 engineers per week at companies you want to join. Send personalized messages mentioning specific projects or technologies.",
                priority: "Medium",
                timeframe: "Weekly",
                techStack: "Networking, Research",
                impact: "Creates referral opportunities",
            },
        ],
    },
    twitter: {
        name: "Twitter",
        icon: Twitter,
        color: "from-blue-400 to-blue-600",
        nextSteps: [
            {
                title: "Share Daily Coding Tips and Tricks",
                description:
                    "Tweet about useful JavaScript/React patterns, VS Code shortcuts, Git commands, or debugging techniques. Use code snippets and screenshots for better engagement.",
                priority: "High",
                timeframe: "Daily",
                techStack: "JavaScript, React, Developer Tools",
                impact: "Builds developer community following",
            },
            {
                title: "Participate in Tech Twitter Conversations",
                description:
                    "Engage in discussions about React updates, JavaScript features, web performance, and industry trends. Share your opinions and experiences with specific examples.",
                priority: "High",
                timeframe: "Daily",
                techStack: "Industry Knowledge, Communication",
                impact: "Increases visibility in tech community",
            },
            {
                title: "Document Learning Journey Publicly",
                description:
                    "Share your progress learning new technologies, solving challenging problems, or building projects. Include screenshots, code snippets, and lessons learned.",
                priority: "Medium",
                timeframe: "3x per week",
                techStack: "Learning in Public, Documentation",
                impact: "Inspires others and shows growth mindset",
            },
            {
                title: "Build Developer Community Connections",
                description:
                    "Follow and interact with React core team members, popular tech YouTubers, and developers at companies you admire. Retweet and comment on their content.",
                priority: "Medium",
                timeframe: "Weekly",
                techStack: "Community Building, Networking",
                impact: "Expands professional network",
            },
        ],
    },
    medium: {
        name: "Medium",
        icon: FileText,
        color: "from-green-600 to-green-800",
        nextSteps: [
            {
                title: "Create React Performance Optimization Series",
                description:
                    "Write a comprehensive 5-part series covering React.memo, useMemo, useCallback, code splitting, and bundle optimization. Include before/after performance metrics.",
                priority: "High",
                timeframe: "Monthly",
                techStack: "React, Performance, Web Vitals",
                impact: "Establishes expertise in React optimization",
            },
            {
                title: "Build Full-Stack Tutorial Series",
                description:
                    "Create step-by-step tutorials for building complete applications: authentication, database design, API development, deployment, and monitoring.",
                priority: "High",
                timeframe: "Bi-weekly",
                techStack: "Full-Stack Development, Tutorials",
                impact: "Helps other developers and builds authority",
            },
            {
                title: "Cross-Post to Dev.to and Hashnode",
                description:
                    "Republish your Medium articles on Dev.to and Hashnode to reach wider audiences. Optimize for each platform's specific community and engagement patterns.",
                priority: "Medium",
                timeframe: "After each article",
                techStack: "Content Distribution, SEO",
                impact: "Increases reach and backlinks",
            },
            {
                title: "Collaborate with Other Tech Writers",
                description:
                    "Guest post on other developers' publications, participate in writing challenges, and engage with other technical writers' content through meaningful comments.",
                priority: "Medium",
                timeframe: "Monthly",
                techStack: "Collaboration, Networking",
                impact: "Builds writing community connections",
            },
        ],
    },
}

const allPlatforms = ["github", "leetcode", "linkedin", "twitter", "medium"]

// Create a client component for the main content
function NextStepsContent() {
    const searchParams = useSearchParams()
    const [unlockedPlatforms, setUnlockedPlatforms] = useState<string[]>(["github"])
    const [credits, setCredits] = useState(5)
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState("")
    const [paymentProcessing, setPaymentProcessing] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)

    const currentPlatform = searchParams?.get("platform") || "github"

    useEffect(() => {
        if (currentPlatform && !unlockedPlatforms.includes(currentPlatform)) {
            setUnlockedPlatforms([currentPlatform])
        }
    }, [currentPlatform])

    const handleUnlock = (platform: string) => {
        setSelectedPlatform(platform)
        setPaymentDialogOpen(true)
    }

    const handlePayment = () => {
        setPaymentProcessing(true)
        setTimeout(() => {
            setCredits(credits - 2)
            setUnlockedPlatforms([...unlockedPlatforms, selectedPlatform])
            setPaymentProcessing(false)
            setPaymentSuccess(true)
            setTimeout(() => {
                setPaymentDialogOpen(false)
                setPaymentSuccess(false)
            }, 2000)
        }, 2000)
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "High":
                return "bg-red-100 text-red-800 border-red-200"
            case "Medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "Low":
                return "bg-green-100 text-green-800 border-green-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getImpactIcon = (step: any) => {
        if (step.impact.includes("community")) return <Users className="h-4 w-4" />
        if (step.impact.includes("visibility")) return <Star className="h-4 w-4" />
        if (step.impact.includes("network")) return <MessageSquare className="h-4 w-4" />
        return <Target className="h-4 w-4" />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <Target className="h-4 w-4" />
                        AI-Powered Next Steps
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                        Your Personalized Action Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        AI-generated recommendations to accelerate your career growth and maximize your platform impact
                    </p>

                    {/* Credits Display */}
                    <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{credits} Credits Available</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Platform Sidebar */}
                    <motion.div
                        className="lg:col-span-1"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card className="sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-lg">Your Platforms</CardTitle>
                                <CardDescription>Click to view next steps for each platform</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {allPlatforms.map((platform) => {
                                    const data = platformData[platform as keyof typeof platformData]
                                    const isUnlocked = unlockedPlatforms.includes(platform)
                                    const isCurrent = platform === currentPlatform

                                    return (
                                        <div
                                            key={platform}
                                            className={`relative p-3 rounded-lg border transition-all cursor-pointer ${isCurrent
                                                    ? "border-orange-500 bg-orange-50"
                                                    : isUnlocked
                                                        ? "border-gray-200 bg-white hover:border-orange-300"
                                                        : "border-gray-200 bg-gray-50"
                                                }`}
                                            onClick={() => {
                                                if (isUnlocked) {
                                                    window.history.pushState({}, "", `?platform=${platform}`)
                                                    window.location.reload()
                                                } else {
                                                    handleUnlock(platform)
                                                }
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <data.icon className={`h-5 w-5 ${isUnlocked ? "text-gray-700" : "text-gray-400"}`} />
                                                    <span className={`font-medium ${isUnlocked ? "text-gray-900" : "text-gray-500"}`}>
                                                        {data.name}
                                                    </span>
                                                </div>
                                                {!isUnlocked && <Lock className="h-4 w-4 text-gray-400" />}
                                                {isUnlocked && isCurrent && <Unlock className="h-4 w-4 text-orange-500" />}
                                            </div>
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                                                    <Button
                                                        size="sm"
                                                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleUnlock(platform)
                                                        }}
                                                    >
                                                        Unlock (2 credits)
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {unlockedPlatforms.includes(currentPlatform) ? (
                            <div className="space-y-6">
                                {/* Platform Header */}
                                <Card className="border-gray-200">
                                    <CardHeader>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`p-3 bg-gradient-to-r ${platformData[currentPlatform as keyof typeof platformData].color
                                                    } rounded-xl`}
                                            >
                                                {(() => {
                                                    const IconComponent = platformData[currentPlatform as keyof typeof platformData].icon
                                                    return <IconComponent className="h-6 w-6 text-white" />
                                                })()}
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl">
                                                    {platformData[currentPlatform as keyof typeof platformData].name} Next Steps
                                                </CardTitle>
                                                <CardDescription>
                                                    Specific, actionable recommendations to maximize your{" "}
                                                    {platformData[currentPlatform as keyof typeof platformData].name} impact
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>

                                {/* Next Steps */}
                                <div className="space-y-6">
                                    {platformData[currentPlatform as keyof typeof platformData].nextSteps.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                        >
                                            <Card className="border-gray-200 hover:shadow-xl transition-all duration-300">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {index + 1}
                                                                </div>
                                                                <CardTitle className="text-xl">{step.title}</CardTitle>
                                                            </div>
                                                            <CardDescription className="text-base leading-relaxed mb-4">
                                                                {step.description}
                                                            </CardDescription>

                                                            {/* Tech Stack */}
                                                            <div className="mb-3">
                                                                <span className="text-sm font-medium text-gray-700 mb-2 block">Tech Stack:</span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {step.techStack.split(", ").map((tech, techIndex) => (
                                                                        <Badge
                                                                            key={techIndex}
                                                                            variant="secondary"
                                                                            className="bg-blue-50 text-blue-700 border-blue-200"
                                                                        >
                                                                            {tech}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Impact */}
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                                                {getImpactIcon(step)}
                                                                <span className="font-medium">Impact:</span>
                                                                <span>{step.impact}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <Badge className={`border ${getPriorityColor(step.priority)}`}>
                                                                {step.priority} Priority
                                                            </Badge>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <TrendingUp className="h-4 w-4" />
                                                                <span>{step.timeframe}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-green-500 text-green-600 hover:bg-green-50"
                                                            >
                                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                Mark Complete
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                                Learn More
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Progress Tracking */}
                                <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                                    <CardHeader>
                                        <CardTitle className="text-orange-800 flex items-center gap-2">
                                            <Sparkles className="h-5 w-5" />
                                            Track Your Progress
                                        </CardTitle>
                                        <CardDescription className="text-orange-700">
                                            Complete these steps and watch your profile strength increase
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-orange-800 font-medium">Completion Rate</span>
                                            <span className="text-2xl font-bold text-orange-600">0/4</span>
                                        </div>
                                        <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                                            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full w-0"></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card className="border-gray-200 text-center py-16">
                                <CardContent>
                                    <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Locked</h3>
                                    <p className="text-gray-600 mb-6">
                                        Unlock personalized next steps for{" "}
                                        {platformData[currentPlatform as keyof typeof platformData]?.name || "this platform"}
                                    </p>
                                    <Button
                                        onClick={() => handleUnlock(currentPlatform)}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Unlock for 2 Credits
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                </div>

                {/* Payment Dialog */}
                <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        {!paymentSuccess ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-orange-500" />
                                        Unlock Next Steps
                                    </DialogTitle>
                                    <DialogDescription>
                                        Unlock personalized next steps for{" "}
                                        {platformData[selectedPlatform as keyof typeof platformData]?.name} using 2 credits
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-orange-800">Current Credits</span>
                                            <span className="text-lg font-bold text-orange-600">{credits}</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-orange-800">Cost</span>
                                            <span className="text-lg font-bold text-orange-600">2 Credits</span>
                                        </div>
                                        <hr className="border-orange-200 my-2" />
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-orange-800">Remaining</span>
                                            <span className="text-lg font-bold text-orange-600">{credits - 2}</span>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handlePayment}
                                        disabled={paymentProcessing || credits < 2}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                    >
                                        {paymentProcessing ? "Processing..." : "Unlock Now"}
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle2 className="h-8 w-8 text-white" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Unlocked Successfully!</h3>
                                <p className="text-gray-600">
                                    {platformData[selectedPlatform as keyof typeof platformData]?.name} next steps are now available.
                                </p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

// Main page component with Suspense boundary
export default function NextStepsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        }>
            <NextStepsContent />
        </Suspense>
    )
}