"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    Code, Users, BookOpen, Trophy, Zap, Database, GitBranch, Calendar, TrendingUp,
    Star, CheckCircle, Clock, Target, Lightbulb, FileCode, Monitor, Cpu, Shield, Globe, Rocket
} from "lucide-react"

// Platform statistics and information
const platformInfo = {
    name: "The Coder'z",
    tagline: "One Stop Platform for Computer Science Students",
    version: "v2.5.0",
    launched: "September 2024",
    lastUpdated: "January 2025",
    techStack: {
        frontend: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion"],
        backend: ["Node.js", "Prisma ORM", "PostgreSQL", "NextAuth"],
        ai: ["Sarvam AI", "OpenAI", "Anthropic"],
        deployment: ["Vercel", "AWS S3", "Docker"],
        tools: ["GitHub", "Resend", "Stripe"]
    },
    features: {
        core: ["AI-Powered Tools", "Project-Based Learning", "Skills Assessment", "Credit System"],
        advanced: ["Open Source Hub", "Mock Interviews", "Certifications", "Job Portal (Coming Soon)"],
        community: ["Referral System", "Leaderboards", "Forums", "Peer Learning"]
    },
    metrics: {
        projects: "500+",
        assessments: "100+",
        aiTools: "6",
        users: "10,000+",
        certifications: "12",
        openSourceProjects: "20+"
    }
}

// Daily updates and changelog data
const dailyUpdates = [
    {
        date: "2025-01-28",
        type: "feature",
        title: "Platform Overview Admin Page",
        description: "Added comprehensive platform overview page for admin dashboard with real-time metrics and daily updates tracking.",
        impact: "high",
        category: "Admin Tools"
    },
    {
        date: "2025-01-27",
        type: "enhancement",
        title: "Credit Transfer System Optimization",
        description: "Improved HMAC signature verification and added better error handling for cross-platform credit transfers.",
        impact: "medium",
        category: "Payment System"
    },
    {
        date: "2025-01-26",
        type: "feature",
        title: "Enhanced Job Interview Assistant",
        description: "Added coding questions with hints and test cases, improved answer generation with STAR method for behavioral questions.",
        impact: "high",
        category: "AI Tools"
    },
    {
        date: "2025-01-25",
        type: "fix",
        title: "Resume Upload Optimization",
        description: "Fixed file upload issues and improved PDF text extraction for better ATS optimization.",
        impact: "medium",
        category: "Resume Tools"
    },
    {
        date: "2025-01-24",
        type: "feature",
        title: "Advanced Project Filtering",
        description: "Added multi-criteria filtering for projects including difficulty, technology stack, and estimated time.",
        impact: "medium",
        category: "Projects"
    },
    {
        date: "2025-01-23",
        type: "enhancement",
        title: "Mobile Responsive Improvements",
        description: "Enhanced mobile experience across all major components with improved touch interactions.",
        impact: "medium",
        category: "UI/UX"
    }
]

const upcomingFeatures = [
    {
        title: "Job Portal Integration",
        description: "Complete job portal with company profiles, application tracking, and AI-powered job matching.",
        eta: "Q2 2025",
        priority: "high"
    },
    {
        title: "Mobile Application",
        description: "Native mobile app with offline capabilities and push notifications.",
        eta: "Q3 2025",
        priority: "high"
    },
    {
        title: "Advanced Analytics Dashboard",
        description: "Comprehensive learning analytics with performance predictions and skill gap analysis.",
        eta: "Q2 2025",
        priority: "medium"
    },
    {
        title: "Institutional Partnerships",
        description: "LMS integration and bulk licensing for educational institutions.",
        eta: "Q4 2025",
        priority: "medium"
    }
]

export default function PlatformOverview() {
    const [selectedFilter, setSelectedFilter] = useState("all")

    const filteredUpdates = selectedFilter === "all" 
        ? dailyUpdates 
        : dailyUpdates.filter(update => update.type === selectedFilter)

    const getUpdateIcon = (type: string) => {
        switch (type) {
            case "feature": return <Rocket className="h-4 w-4 text-green-500" />
            case "enhancement": return <TrendingUp className="h-4 w-4 text-blue-500" />
            case "fix": return <CheckCircle className="h-4 w-4 text-orange-500" />
            default: return <Clock className="h-4 w-4 text-gray-500" />
        }
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "high": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
            case "low": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
        }
    }

    return (
        <div className="w-full p-6 space-y-6">
            {/* Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                            {platformInfo.name}
                        </h1>
                        <p className="text-xl text-muted-foreground mt-2">{platformInfo.tagline}</p>
                    </div>
                    <div className="text-right">
                        <Badge variant="outline" className="text-lg px-4 py-2">
                            {platformInfo.version}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                            Last Updated: {platformInfo.lastUpdated}
                        </p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(platformInfo.metrics).map(([key, value]) => (
                        <Card key={key} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">{value}</div>
                                <div className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Platform Overview</TabsTrigger>
                    <TabsTrigger value="updates">Daily Updates</TabsTrigger>
                    <TabsTrigger value="features">Features & Roadmap</TabsTrigger>
                    <TabsTrigger value="technical">Technical Details</TabsTrigger>
                </TabsList>

                {/* Platform Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Core Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Core Features
                                </CardTitle>
                                <CardDescription>Essential platform capabilities</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {platformInfo.features.core.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Zap className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{feature}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Advanced Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-500" />
                                    Advanced Features
                                </CardTitle>
                                <CardDescription>Premium platform capabilities</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {platformInfo.features.advanced.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Rocket className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium">{feature}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Community Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-green-500" />
                                    Community Features
                                </CardTitle>
                                <CardDescription>Social learning and engagement</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {platformInfo.features.community.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Users className="h-4 w-4 text-green-500" />
                                        <span className="font-medium">{feature}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Platform Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-purple-500" />
                                    Platform Information
                                </CardTitle>
                                <CardDescription>Key platform details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Launched</span>
                                    <span className="font-medium">{platformInfo.launched}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Version</span>
                                    <span className="font-medium">{platformInfo.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span className="font-medium">{platformInfo.lastUpdated}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Daily Updates Tab */}
                <TabsContent value="updates" className="space-y-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Button 
                            variant={selectedFilter === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilter("all")}
                        >
                            All Updates
                        </Button>
                        <Button 
                            variant={selectedFilter === "feature" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilter("feature")}
                        >
                            Features
                        </Button>
                        <Button 
                            variant={selectedFilter === "enhancement" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilter("enhancement")}
                        >
                            Enhancements
                        </Button>
                        <Button 
                            variant={selectedFilter === "fix" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedFilter("fix")}
                        >
                            Fixes
                        </Button>
                    </div>

                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            {filteredUpdates.map((update, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getUpdateIcon(update.type)}
                                                    <div>
                                                        <CardTitle className="text-lg">{update.title}</CardTitle>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {update.category}
                                                            </Badge>
                                                            <Badge className={`text-xs ${getImpactColor(update.impact)}`}>
                                                                {update.impact} impact
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {update.date}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{update.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* Features & Roadmap Tab */}
                <TabsContent value="features" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-yellow-500" />
                                Upcoming Features
                            </CardTitle>
                            <CardDescription>Planned developments and roadmap</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {upcomingFeatures.map((feature, index) => (
                                    <Card key={index} className="border-l-4 border-l-primary">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold">{feature.title}</h4>
                                                <Badge className={`${feature.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {feature.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium">{feature.eta}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Technical Details Tab */}
                <TabsContent value="technical" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Frontend Stack */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Monitor className="h-5 w-5 text-blue-500" />
                                    Frontend Stack
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {platformInfo.techStack.frontend.map((tech, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                                        <Code className="h-4 w-4 text-blue-500" />
                                        <span>{tech}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Backend Stack */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5 text-green-500" />
                                    Backend Stack
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {platformInfo.techStack.backend.map((tech, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                                        <Database className="h-4 w-4 text-green-500" />
                                        <span>{tech}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* AI Integration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Cpu className="h-5 w-5 text-purple-500" />
                                    AI Integration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {platformInfo.techStack.ai.map((tech, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                                        <Cpu className="h-4 w-4 text-purple-500" />
                                        <span>{tech}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Deployment & Tools */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-orange-500" />
                                    Deployment & Tools
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[...platformInfo.techStack.deployment, ...platformInfo.techStack.tools].map((tech, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                                        <Globe className="h-4 w-4 text-orange-500" />
                                        <span>{tech}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 